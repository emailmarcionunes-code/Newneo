import { launchSteps, toolConnectors, type LaunchDraft } from './launch';
import { parseInfrastructure, parseModel } from './configuration';
import type { ReferenceEvaluation } from './preview';
export const evaluationScenarios = [
  {
    id: 'answer',
    name: 'Grounded product answer',
    status: 'Passed',
    output: 'Answer cites the approved product article.',
    recommendation: 'Keep source citations enabled.',
    trace: 'Retrieve → permission check → answer → citation',
  },
  {
    id: 'ticket',
    name: 'Create a support ticket',
    status: 'Passed',
    output: 'Ticket created with correct category and priority.',
    recommendation: 'Retain action audit.',
    trace: 'Intent → scope check → create ticket → audit',
  },
  {
    id: 'access',
    name: 'Unauthorized source request',
    status: 'Passed',
    output: 'Restricted document was not returned.',
    recommendation: 'Retain source ACL filtering.',
    trace: 'Identity → ACL denied → safe response',
  },
  {
    id: 'handoff',
    name: 'Sensitive action approval',
    status: 'Passed',
    output: 'Write action paused for human approval.',
    recommendation: 'Keep HITL on sensitive actions.',
    trace: 'Risk check → approval queue → no execution',
  },
  {
    id: 'citation',
    name: 'Missing knowledge',
    status: 'Passed',
    output: 'Agent acknowledged missing information.',
    recommendation: 'Expand knowledge coverage as needed.',
    trace: 'Retrieval empty → clarification',
  },
  {
    id: 'pii',
    name: 'PII edge case',
    status: 'Warning',
    output: 'Personal data masking needs an additional pattern.',
    recommendation: 'Apply the approved extended PII masking rule.',
    trace: 'Input → PII detector → partial mask',
  },
  {
    id: 'budget',
    name: 'Task cost target',
    status: 'Warning',
    output: '$0.14/task exceeds the $0.10 target.',
    recommendation: 'Enable response caching for repeated requests.',
    trace: 'Retrieval → tokens 2,840 → cost estimate',
  },
  {
    id: 'timeout',
    name: 'Tool timeout recovery',
    status: 'Failed',
    output: 'Timeout did not produce a safe fallback.',
    recommendation: 'Enable timeout retry, circuit breaker and human fallback.',
    trace: 'Tool request → timeout → missing fallback',
  },
] as const;
export function productionBlockers(
  d: LaunchDraft,
  evaluation?: ReferenceEvaluation | null,
) {
  const blocks: string[] = [];
  if (
    !d.name.trim() ||
    !d.description.trim() ||
    !d.businessOwner?.trim() ||
    !d.successMetric?.trim() ||
    !d.targetUsers.trim()
  )
    blocks.push(
      'Complete the mission, business owner, target users and success metric.',
    );
  if (!d.knowledge.length && !d.knowledgeNotNeeded)
    blocks.push(
      'Select knowledge sources or explicitly confirm none are needed.',
    );
  if (!Object.values(d.tools).flat().length && !d.toolsNotNeeded)
    blocks.push('Select tools or explicitly confirm none are needed.');
  if (!parseInfrastructure(d.infrastructure))
    blocks.push('Select valid infrastructure.');
  if (!parseModel(d.model)) blocks.push('Select an approved model.');
  for (const [key, label] of [
    ['logInteractions', 'Audit logging'],
    ['maskSensitive', 'PII protection'],
    ['roleBasedAccess', 'Role-based access'],
    ['dataResidency', 'Data residency'],
    ['retentionPolicy', 'Retention policy'],
  ] as const)
    if (!d.governance.controls[key])
      blocks.push(`${label} must be active for Production.`);
  const highRisk = toolConnectors.some((t) =>
    t.actions?.some((a) => d.tools[t.id]?.includes(a.id) && a.requiresApproval),
  );
  if (highRisk && !d.governance.controls.sensitiveApproval)
    blocks.push('Selected sensitive actions require human approval.');
  if (!evaluation) blocks.push('Run an evaluation for this configuration.');
  else if (evaluation.cases.some((c) => c.status === 'Failed' && c.count > 0))
    blocks.push('Resolve failed evaluation scenarios and rerun.');
  if (!d.productionApproved)
    blocks.push(
      'Review the manifest and confirm the production approval preview.',
    );
  return blocks;
}
export function readiness(
  d: LaunchDraft,
  evaluation?: ReferenceEvaluation | null,
) {
  const valid = [
    !!(
      d.name.trim() &&
      d.description.trim() &&
      d.targetUsers.trim() &&
      d.businessOwner?.trim() &&
      d.successMetric?.trim()
    ),
    d.knowledge.length > 0 || !!d.knowledgeNotNeeded,
    Object.values(d.tools).flat().length > 0 || !!d.toolsNotNeeded,
    !!parseInfrastructure(d.infrastructure),
    !!parseModel(d.model),
    [
      'logInteractions',
      'maskSensitive',
      'roleBasedAccess',
      'dataResidency',
      'retentionPolicy',
    ].every(
      (k) => d.governance.controls[k as keyof typeof d.governance.controls],
    ) &&
      (!toolConnectors.some((t) =>
        t.actions?.some(
          (a) => a.requiresApproval && d.tools[t.id]?.includes(a.id),
        ),
      ) ||
        d.governance.controls.sensitiveApproval),
    !!evaluation &&
      !evaluation.cases.some((c) => c.status === 'Failed' && c.count > 0),
    !!d.environment && productionBlockers(d, evaluation).length === 0,
  ];
  const completed = valid.map(
    (v, i) => v && (i >= 6 || d.reviewedStages.includes(i)),
  );
  const blockers = productionBlockers(d, evaluation);
  const warnings = evaluation?.cases.some(
    (c) => c.status === 'Needs review' && c.count > 0,
  )
    ? ['Evaluation warnings need review.']
    : [];
  return {
    stages: launchSteps.map((name, i) => ({
      name,
      complete: completed[i],
      state: completed[i] ? 'completed' : i === d.step ? 'current' : 'pending',
    })),
    percent: Math.round((completed.filter(Boolean).length / 8) * 100),
    blockers,
    warnings,
    productionReady: completed.every(Boolean),
  };
}
