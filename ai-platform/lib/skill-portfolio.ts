import type { Skill } from './skills';

/** Internal composition metadata. No execution, readiness or production authority. */
export type CapabilityCore = {
  id: string;
  name: string;
  description: string;
  category: string;
  reusableLogic: string[];
  requiredInputs: string[];
  outputContract: Record<string, string>;
  governanceProfile: string[];
  toolPatterns: string[];
  evaluationPatterns: string[];
};
export type DomainPattern = {
  id: string;
  domain: string;
  terminology: string[];
  regulatoryConstraints: string[];
  dataBoundaryRules: string[];
  domainEvaluations: string[];
};
const coreRows = [
  [
    'identity',
    'Identity Verification',
    'Verify subject and authorization',
    'Identity Provider',
  ],
  [
    'scheduling',
    'Scheduling',
    'Resolve availability and confirm a booking',
    'Calendar / Availability API',
  ],
  [
    'eligibility',
    'Eligibility Check',
    'Evaluate request against applicable criteria',
    'Eligibility Rules API',
  ],
  [
    'documents',
    'Document Review',
    'Extract and review scoped document evidence',
    'Document Repository',
  ],
  [
    'approval',
    'Approval Workflow',
    'Route a decision to an authorized approver',
    'Approval Queue',
  ],
  [
    'exception',
    'Exception Handling',
    'Classify failure and safely route unresolved cases',
    'Case Management',
  ],
  [
    'notification',
    'Notification',
    'Deliver an authorized outcome notification',
    'Notification Gateway',
  ],
  [
    'escalation',
    'Escalation',
    'Transfer unresolved work with supporting context',
    'Service Desk',
  ],
  [
    'extraction',
    'Data Extraction',
    'Extract structured fields with provenance',
    'Document Repository',
  ],
  [
    'intake',
    'Case Intake',
    'Normalize and classify incoming requests',
    'ServiceNow',
  ],
];
export const capabilityCores: CapabilityCore[] = coreRows.map(
  ([id, name, description, tool]) => ({
    id,
    name,
    description,
    category: 'Horizontal capability',
    reusableLogic: [
      description,
      'Validate inputs',
      'Record outcome and provenance',
    ],
    requiredInputs: ['request', 'authorizedSubject'],
    outputContract: { outcome: 'string', evidence: 'string' },
    governanceProfile: [
      'Audit logging',
      'Scoped data access',
      'Human approval for privileged actions',
    ],
    toolPatterns: [tool],
    evaluationPatterns: [
      'Valid request',
      'Unauthorized request',
      'Dependency failure',
    ],
  }),
);
export const domainPatterns: DomainPattern[] = [
  'Healthcare',
  'IT Services',
  'Financial Services',
  'Retail',
  'HR',
  'Legal',
  'Customer Service',
  'Sales',
  'Operations',
  'Public Sector',
].map((domain) => ({
  id: domain.toLowerCase().replaceAll(' ', '-'),
  domain,
  terminology:
    domain === 'Healthcare'
      ? ['patient', 'appointment', 'care team']
      : [domain.toLowerCase(), 'request', 'case'],
  regulatoryConstraints: [
    'Organization-approved domain policies; review required before live use',
  ],
  dataBoundaryRules: [
    'Authorized tenant resources only',
    'Purpose-limited data access',
  ],
  domainEvaluations: [
    `${domain} terminology and routing`,
    'Out-of-domain request rejected',
  ],
}));
export type SkillReuse = {
  coreId: string;
  domainPatternId: string;
  components: string[];
};
const existing: Record<string, [string, string]> = {
  'reset-password': ['identity', 'it-services'],
  'unlock-user': ['identity', 'it-services'],
  'create-ticket': ['intake', 'customer-service'],
  'search-crm': ['extraction', 'sales'],
  'qualify-opportunity': ['eligibility', 'sales'],
  'contract-risk': ['documents', 'legal'],
  'executive-summary': ['documents', 'operations'],
  'provision-access': ['approval', 'it-services'],
  'execute-runbook': ['exception', 'it-services'],
  'purchase-request': ['approval', 'financial-services'],
};
export function reuseOf(skill: Skill): SkillReuse | undefined {
  const mapped = existing[skill.id];
  return (
    skill.reuse ||
    (mapped
      ? {
          coreId: mapped[0],
          domainPatternId: mapped[1],
          components: [
            'Input validation',
            'Audit trail',
            'Safe failure handling',
          ],
        }
      : undefined)
  );
}
export function coreUsage(skills: Skill[], coreId: string) {
  const members = skills.filter((s) => reuseOf(s)?.coreId === coreId);
  return {
    skills: members,
    domains: [...new Set(members.map((s) => reuseOf(s)!.domainPatternId))],
  };
}
export function portfolioSuggestions(query: string) {
  const words = query
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 3);
  return capabilityCores.filter((c) =>
    words.some((w) =>
      `${c.name} ${c.description} ${c.toolPatterns.join(' ')} ${c.governanceProfile.join(' ')}`
        .toLowerCase()
        .includes(w),
    ),
  );
}
const adaptations: [string, string, string, string, Skill['maturity']][] = [
  [
    'patient-scheduling',
    'Patient Appointment Scheduling',
    'scheduling',
    'healthcare',
    'Production Ready',
  ],
  [
    'specialist-scheduling',
    'Technical Specialist Scheduling',
    'scheduling',
    'it-services',
    'Validated',
  ],
  [
    'interview-scheduling',
    'Interview Scheduling',
    'scheduling',
    'hr',
    'Experimental',
  ],
  [
    'insurance-eligibility',
    'Insurance Eligibility Check',
    'eligibility',
    'healthcare',
    'Validated',
  ],
  [
    'license-eligibility',
    'Software License Eligibility Check',
    'eligibility',
    'it-services',
    'Production Ready',
  ],
  [
    'clinical-escalation',
    'Clinical Case Escalation',
    'exception',
    'healthcare',
    'Experimental',
  ],
  [
    'incident-escalation',
    'Incident Escalation',
    'exception',
    'it-services',
    'Validated',
  ],
  [
    'finance-document-review',
    'Financial Document Review',
    'documents',
    'financial-services',
    'Production Ready',
  ],
];
export const portfolioSkills: Skill[] = adaptations.map(
  ([id, name, coreId, domainPatternId, maturity]) => {
    const core = capabilityCores.find((c) => c.id === coreId)!;
    const pattern = domainPatterns.find((d) => d.id === domainPatternId)!;
    return {
      id,
      name,
      domain: pattern.domain,
      version: '1.0',
      maturity,
      riskLevel: 'Medium',
      owner: `${pattern.domain} Operations`,
      description: `${name} adapted from the ${core.name} Core. Demonstration definition; live deployment requires domain review.`,
      instructions: `${core.description}. Apply ${pattern.domain} policy, verify authorization and safely escalate exceptions.`,
      requiredKnowledgeTypes: [`${pattern.domain} policy knowledge`],
      toolRequirements: [...core.toolPatterns],
      governanceRequirements: [...core.governanceProfile],
      permissionRequirements: 'Least privilege within approved scope',
      dataAccess: pattern.dataBoundaryRules.join('; '),
      parameterDefaults: '{}',
      evaluationSuite: core.evaluationPatterns.map((name) => ({
        name,
        expected: 'Respect domain constraints and return an auditable outcome',
      })),
      inputSchema: { request: 'string', authorizedSubject: 'string' },
      outputSchema: { ...core.outputContract },
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: '2026-09-16T00:00:00Z',
      evaluationScore: null,
      reuse: {
        coreId,
        domainPatternId,
        components:
          coreId === 'scheduling'
            ? [
                'Identity Verification',
                'Availability Lookup',
                'Confirmation Notification',
                'Exception Escalation',
              ]
            : core.reusableLogic,
      },
    };
  },
);

export function portfolioDomainId(domain: string): string {
  const aliases: Record<string, string> = {
    IT: 'it-services',
    Finance: 'financial-services',
    Support: 'customer-service',
  };
  return (
    aliases[domain] ||
    domainPatterns.find((p) => p.domain === domain)?.id ||
    domain.toLowerCase()
  );
}
