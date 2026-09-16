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
  requiredKnowledgeTypes: string[];
  toolRequirements: string[];
  governanceRequirements: string[];
  evaluationSuite: { name: string; expected: string }[];
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
    | 'policy change';
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
    parameters: '{}',
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
    ['Knowledge available', !!b.knowledge.trim()],
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
