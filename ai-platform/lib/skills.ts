/** Canonical Skill definitions and pinned Agent Version bindings. Demo only. */
export const maturities = [
  'Experimental',
  'Validated',
  'Production Ready',
  'Proven at Scale',
] as const;
export type Skill = {
  id: string;
  name: string;
  description: string;
  domain: string;
  version: string;
  maturity: (typeof maturities)[number];
  riskLevel: 'Low' | 'Medium' | 'High';
  owner: string;
  instructions: string;
  permissionRequirements?: string;
  parameterDefaults?: string;
  dataAccess?: string;
  requiredKnowledgeTypes: string[];
  toolRequirements: string[];
  governanceRequirements: string[];
  evaluationSuite: {
    name: string;
    expected: string;
    previewResult?: 'Passed' | 'Warning' | 'Failed';
  }[];
  inputSchema: Record<string, string>;
  outputSchema: Record<string, string>;
  createdAt: string;
  updatedAt: string;
  evaluationScore: number | null;
};
const rows = [
  [
    'reset-password',
    'Reset Password',
    'IT',
    'Medium',
    'Identity Provider,ServiceNow,User Directory',
  ],
  [
    'unlock-user',
    'Unlock User',
    'IT',
    'Medium',
    'Identity Provider,User Directory',
  ],
  [
    'create-ticket',
    'Create ServiceNow Ticket',
    'Shared',
    'Medium',
    'ServiceNow',
  ],
  ['search-crm', 'Search CRM Records', 'Sales', 'Low', 'Salesforce'],
  [
    'qualify-opportunity',
    'Qualify Opportunity',
    'Sales',
    'Medium',
    'Salesforce',
  ],
  [
    'contract-risk',
    'Analyze Contract Risk',
    'Legal',
    'High',
    'Document Repository',
  ],
  [
    'executive-summary',
    'Generate Executive Summary',
    'Research',
    'Low',
    'Document Repository',
  ],
  [
    'provision-access',
    'Provision User Access',
    'IT',
    'High',
    'Identity Provider,ServiceNow',
  ],
  ['execute-runbook', 'Execute IT Runbook', 'IT', 'High', 'Runbook Executor'],
  ['purchase-request', 'Create Purchase Request', 'Finance', 'Medium', 'ERP'],
] as const;
export const skillLibrary: Skill[] = rows.map(
  ([id, name, domain, risk, tools], i) => ({
    id,
    name,
    domain,
    description: `${name} with verified inputs, scoped actions and an auditable outcome.`,
    version: id === 'reset-password' ? '1.6' : '1.0',
    maturity:
      i === 9
        ? 'Experimental'
        : i === 5
          ? 'Validated'
          : i === 2
            ? 'Proven at Scale'
            : 'Production Ready',
    riskLevel: risk,
    owner: `${domain} Operations`,
    instructions: `Verify identity, validate inputs, execute approved ${name.toLowerCase()} actions and confirm the result. Escalate failures safely.`,
    requiredKnowledgeTypes: [
      `${domain === 'Shared' ? 'Support' : domain} policy knowledge`,
    ],
    toolRequirements: tools.split(','),
    governanceRequirements: [
      'Audit logging',
      'Scoped data access',
      ...(risk === 'Low'
        ? []
        : ['Human approval for privileged or high-risk actions']),
    ],
    evaluationSuite: [
      'Valid request',
      'Unknown user',
      'Privileged account',
      'Identity mismatch',
      'Tool timeout',
      'API failure',
    ].map((name) => ({
      name,
      expected:
        name === 'Valid request'
          ? 'Complete approved action and validate output'
          : 'Deny, require approval or safely escalate; no unauthorized side effects',
    })),
    inputSchema: { request: 'string', userId: 'string' },
    outputSchema: { outcome: 'string', evidence: 'string' },
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-16T00:00:00Z',
    evaluationScore: i === 9 ? null : i === 5 ? 86 : 98,
  }),
);
export type SkillBinding = {
  skillId: string;
  skillVersion: string;
  status: 'Active' | 'Draft';
  knowledge: string;
  tools: Record<string, string>;
  permissions: boolean;
  scope: string;
  parameters: string;
  environment: 'Development' | 'Staging';
  humanApproval: boolean;
  policies: boolean;
  modelCompatible: boolean;
  infrastructureCompatible: boolean;
  evaluated: boolean;
  validationFingerprint?: string;
  updatedAt: string;
};
export type SkillChange = {
  kind:
    | 'Added Skill'
    | 'Removed Skill'
    | 'Skill version changed'
    | 'Tool binding changed'
    | 'Knowledge binding changed'
    | 'policy change'
    | 'Skill configuration changed';
  skillId: string;
  detail: string;
  at: string;
};
export type SkillComposition = {
  bindings: SkillBinding[];
  changes: SkillChange[];
};
export type SkillVersions = Record<string, SkillComposition>;
export const skillKey = (id: string) => `agent:${id}:skillVersions`;
export const agentDomain = (id: string) =>
  id === 'it-support'
    ? 'IT'
    : id === 'sales-assistant'
      ? 'Sales'
      : id === 'research-assistant' || id === 'knowledge-assistant'
        ? 'Research'
        : id === 'process-automation'
          ? 'Finance'
          : id === 'customer-service'
            ? 'Support'
            : 'Custom';
const seedIds = (id: string) =>
  id === 'it-support' || id === 'customer-service'
    ? ['create-ticket']
    : id === 'sales-assistant'
      ? ['search-crm']
      : id === 'research-assistant'
        ? ['executive-summary']
        : [];
export function emptyBinding(skill: Skill): SkillBinding {
  return {
    skillId: skill.id,
    skillVersion: skill.version,
    status: 'Draft',
    knowledge: '',
    tools: Object.fromEntries(skill.toolRequirements.map((t) => [t, ''])),
    permissions: false,
    scope: '',
    parameters: skill.parameterDefaults || '{}',
    environment: 'Staging',
    humanApproval: false,
    policies: false,
    modelCompatible: true,
    infrastructureCompatible: true,
    evaluated: false,
    updatedAt: new Date().toISOString(),
  };
}
export function composition(
  ui: Record<string, unknown> | undefined,
  id: string,
  version: string,
): SkillComposition {
  const versions = ui?.[skillKey(id)] as SkillVersions | undefined;
  return (
    versions?.[version] ?? {
      bindings: seedIds(id).map((key) => {
        const s = skillLibrary.find((s) => s.id === key)!;
        return {
          ...emptyBinding(s),
          status: 'Active' as const,
          knowledge: s.requiredKnowledgeTypes[0],
          tools: Object.fromEntries(
            s.toolRequirements.map((t) => [t, `${t} approved demo action`]),
          ),
          scope: 'Agent domain only',
          permissions: true,
          policies: true,
          humanApproval: true,
          evaluated: true,
          updatedAt: s.updatedAt,
        };
      }),
      changes: [],
    }
  );
}
export function bindingFingerprint(b: SkillBinding) {
  const { evaluated, validationFingerprint, updatedAt, status, ...config } = b;
  return JSON.stringify(config);
}
export function validateBinding(skill: Skill, b: SkillBinding, domain: string) {
  let params = false;
  try {
    const p = JSON.parse(b.parameters);
    params = !!p && typeof p === 'object' && !Array.isArray(p);
  } catch {}
  const checks: [string, boolean][] = [
    [
      'Pinned Skill version',
      b.skillId === skill.id && b.skillVersion === skill.version,
    ],
    [
      'Mission / domain boundary',
      skill.domain === 'Shared' || skill.domain === domain,
    ],
    [
      'Required tools connected',
      skill.toolRequirements.every((t) => !!b.tools[t]?.trim()),
    ],
    [
      'Knowledge available',
      !skill.requiredKnowledgeTypes.length || !!b.knowledge.trim(),
    ],
    ['Permissions sufficient', b.permissions && !!b.scope.trim()],
    ['Governance compatibility', b.policies],
    ['Approval requirements', skill.riskLevel === 'Low' || b.humanApproval],
    ['Model compatibility', b.modelCompatible],
    ['Infrastructure constraints', b.infrastructureCompatible],
    ['Parameter schema', params],
    [
      'Skill scenarios and Agent regression',
      b.evaluated && b.validationFingerprint === bindingFingerprint(b),
    ],
  ];
  return [
    ...checks.map(([name, passed]) => ({
      name,
      status: passed ? 'Passed' : 'Blocking',
    })),
    {
      name: 'Risk review',
      status: skill.riskLevel === 'High' ? 'Warning' : 'Passed',
    },
    {
      name: 'Maturity review',
      status: skill.maturity === 'Experimental' ? 'Warning' : 'Passed',
    },
  ];
}
export function resolveAgentDomain(
  ui: Record<string, unknown> | undefined,
  id: string,
) {
  const launch = ui?.[`agent:${id}:launch`] as
    { templateId?: string } | undefined;
  return agentDomain(launch?.templateId || id);
}
export function proposedSkillVersion(
  ui: Record<string, unknown> | undefined,
  id: string,
  currentVersion: string,
) {
  const existing = ui?.[skillKey(id)] as SkillVersions | undefined;
  const draft =
    ui?.[`agent:${id}:draft`] &&
    (ui?.[`agent:${id}:draftVersion`] as string | undefined);
  let version = draft && draft !== currentVersion ? String(draft) : '';
  if (!version) {
    const [major, minor] = currentVersion
      .replace(/^v/, '')
      .split('.')
      .map(Number);
    let next = (minor || 0) + 1;
    version = `v${major || 1}.${next}`;
    while (existing?.[version]) version = `v${major || 1}.${++next}`;
  }
  return version;
}
export function addSkillToDraft(
  ui: Record<string, unknown> | undefined,
  id: string,
  currentVersion: string,
  skill: Skill,
  binding: SkillBinding,
) {
  if (
    validateBinding(skill, binding, resolveAgentDomain(ui, id)).some(
      (c) => c.status === 'Blocking',
    )
  )
    throw new Error('Resolve blocking checks before adding this Skill.');
  const existing = ui?.[skillKey(id)] as SkillVersions | undefined;
  const version = proposedSkillVersion(ui, id, currentVersion);
  const base = existing?.[version] ?? composition(ui, id, currentVersion);
  if (base.bindings.some((b) => b.skillId === skill.id))
    throw new Error('This Skill is already bound to this version.');
  const at = new Date().toISOString();
  const change: SkillChange = {
    kind: 'Added Skill',
    skillId: skill.id,
    detail: `Added ${skill.name} v${skill.version}; tools: ${Object.values(binding.tools).join(', ')}; knowledge: ${binding.knowledge}; approval: ${binding.humanApproval ? 'required' : 'standard policy'}`,
    at,
  };
  const next = {
    bindings: [
      ...base.bindings,
      { ...binding, status: 'Draft' as const, updatedAt: at },
    ],
    changes: [...base.changes, change],
  };
  return {
    version,
    count: next.bindings.length,
    ui: {
      ...ui,
      [skillKey(id)]: {
        ...existing,
        [currentVersion]: composition(ui, id, currentVersion),
        [version]: next,
      },
      [`agent:${id}:draftVersion`]: version,
      [`agent:${id}:draft`]: true,
      [`agent:${id}:saved`]: true,
    },
  };
}
/** Reserved execution dimensions; no sample metrics are represented as measured billing. */
export type SkillExecution = {
  id: string;
  organizationId: string;
  workspaceId: string;
  taskId: string;
  agentId: string;
  agentVersion: string;
  skillId: string;
  skillVersion: string;
  bindingId: string;
  environment: string;
  modelId: string;
  toolCallIds: string[];
  outcome: 'success' | 'failure';
  latencyMs: number;
  costMinor: number | null;
  currency: string;
};

/** Session-scoped immutable library versions. Live storage requires server authorization. */
export const libraryKey = 'skills:library';
export const builderKey = 'skills:builderDraft';
export function allSkills(ui?: Record<string, unknown>): Skill[] {
  return [
    ...skillLibrary,
    ...((ui?.[libraryKey] as Skill[] | undefined) || []),
  ];
}
export function latestSkills(ui?: Record<string, unknown>): Skill[] {
  return [...new Map(allSkills(ui).map((s) => [s.id, s])).values()];
}
export function definitionErrors(s: Skill) {
  const errors: string[] = [];
  if (!s.permissionRequirements?.trim())
    errors.push('Define permission requirements.');
  if (!s.dataAccess?.trim()) errors.push('Define the data access boundary.');
  if (
    ![s.name, s.description, s.domain, s.owner, s.instructions].every((v) =>
      v.trim(),
    )
  )
    errors.push('Complete name, outcome, domain, owner and instructions.');
  if (!Object.keys(s.inputSchema).length || !Object.keys(s.outputSchema).length)
    errors.push('Define inputs and outputs.');
  if (
    ![...Object.values(s.inputSchema), ...Object.values(s.outputSchema)].every(
      (v) => typeof v === 'string' && v.trim(),
    )
  )
    errors.push('Input/output field types must be nonempty strings.');
  try {
    const p = JSON.parse(s.parameterDefaults || '{}');
    if (!p || typeof p !== 'object' || Array.isArray(p)) throw Error();
  } catch {
    errors.push('Parameter defaults must be a JSON object.');
  }
  if (!s.governanceRequirements.some((v) => v.trim()))
    errors.push('Define governance policies.');
  if (
    s.riskLevel !== 'Low' &&
    !s.governanceRequirements.some((v) => /approval/i.test(v))
  )
    errors.push('Medium/high risk requires an approval policy.');
  if (
    s.evaluationSuite.length < 2 ||
    s.evaluationSuite.some((v) => !v.name.trim() || !v.expected.trim())
  )
    errors.push(
      'Define at least two scenarios with expected results, including a failure case.',
    );
  return errors;
}
export function definitionFingerprint(s: Skill) {
  const { maturity, evaluationScore, updatedAt, ...definition } = s;
  return JSON.stringify(definition);
}
export function publishSkill(
  ui: Record<string, unknown> | undefined,
  skill: Skill,
  evidence: string,
) {
  const errors = definitionErrors(skill);
  if (errors.length) throw new Error(errors.join(' '));
  if (skill.maturity === 'Proven at Scale')
    throw new Error('Operational evidence is required for Proven at Scale.');
  if (
    skill.maturity !== 'Experimental' &&
    evidence !== definitionFingerprint(skill)
  )
    throw new Error(
      'Run fresh preview evaluation before publishing this maturity.',
    );
  if (
    skill.maturity !== 'Experimental' &&
    skill.evaluationSuite.some((s) => s.previewResult === 'Failed')
  )
    throw new Error('Resolve failing scenarios before promoting maturity.');
  if (
    skill.maturity === 'Production Ready' &&
    skill.evaluationSuite.some((s) => s.previewResult === 'Warning')
  )
    throw new Error('Resolve warnings before Production Ready.');
  if (
    allSkills(ui).some((s) => s.id === skill.id && s.version === skill.version)
  )
    throw new Error('This version already exists. Start a new version.');
  return {
    ...ui,
    [builderKey]: null,
    [libraryKey]: [
      ...((ui?.[libraryKey] as Skill[]) || []),
      {
        ...skill,
        evaluationScore:
          evidence === definitionFingerprint(skill)
            ? Math.round(
                (100 *
                  skill.evaluationSuite.filter(
                    (s) => !s.previewResult || s.previewResult === 'Passed',
                  ).length) /
                  skill.evaluationSuite.length,
              )
            : null,
        updatedAt: new Date().toISOString(),
      },
    ],
  };
}
export function reviseSkillBinding(
  ui: Record<string, unknown> | undefined,
  id: string,
  current: string,
  skill: Skill,
  binding: SkillBinding | null,
) {
  const version = proposedSkillVersion(ui, id, current);
  const existing = ui?.[skillKey(id)] as SkillVersions | undefined;
  const base = existing?.[version] ?? composition(ui, id, current);
  const old = base.bindings.find((b) => b.skillId === skill.id);
  if (!old) throw new Error('Skill binding not found.');
  if (
    binding &&
    validateBinding(skill, binding, resolveAgentDomain(ui, id)).some(
      (c) => c.status === 'Blocking',
    )
  )
    throw new Error('Resolve blocking checks before saving.');
  const at = new Date().toISOString();
  const changes: SkillChange[] = [];
  const record = (kind: SkillChange['kind'], detail: string) =>
    changes.push({ kind, skillId: skill.id, detail, at });
  if (!binding)
    record('Removed Skill', `Removed ${skill.name} v${old.skillVersion}`);
  else {
    if (old.skillVersion !== binding.skillVersion)
      record(
        'Skill version changed',
        `${skill.name}: v${old.skillVersion} → v${binding.skillVersion}`,
      );
    if (JSON.stringify(old.tools) !== JSON.stringify(binding.tools))
      record(
        'Tool binding changed',
        `${skill.name}: ${Object.values(binding.tools).join(', ')}`,
      );
    if (old.knowledge !== binding.knowledge)
      record(
        'Knowledge binding changed',
        `${skill.name}: ${binding.knowledge}`,
      );
    if (
      old.humanApproval !== binding.humanApproval ||
      old.policies !== binding.policies
    )
      record(
        'policy change',
        `${skill.name}: approval ${binding.humanApproval ? 'required' : 'standard policy'}`,
      );
    record(
      'Skill configuration changed',
      `${skill.name}: scope ${binding.scope}; ${binding.environment}; permissions ${binding.permissions}`,
    );
  }
  const next = {
    bindings: binding
      ? base.bindings.map((b) =>
          b.skillId === skill.id
            ? { ...binding, status: 'Draft' as const, updatedAt: at }
            : b,
        )
      : base.bindings.filter((b) => b.skillId !== skill.id),
    changes: [...base.changes, ...changes],
  };
  return {
    version,
    count: next.bindings.length,
    ui: {
      ...ui,
      [skillKey(id)]: {
        ...existing,
        [current]: composition(ui, id, current),
        [version]: next,
      },
      [`agent:${id}:draftVersion`]: version,
      [`agent:${id}:draft`]: true,
      [`agent:${id}:saved`]: true,
    },
  };
}
