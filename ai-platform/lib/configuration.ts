// Organization-scoped preview registry. Production must supply approved resources
// and enforce permissions through its backend; these fixtures grant no access.
export const executionModels = [
  {
    id: 'managed',
    name: 'Managed AI',
    description: 'Use leading approved model providers.',
  },
  {
    id: 'customer-cloud',
    name: 'Customer Cloud',
    description: 'Run in your own cloud account.',
  },
  {
    id: 'private',
    name: 'Private AI',
    description: 'Run approved open models in your environment.',
  },
  {
    id: 'hybrid',
    name: 'Hybrid AI',
    description: 'Combine approved execution models.',
  },
] as const;
export type ExecutionModel = (typeof executionModels)[number]['id'];
export type RuntimeSelection = {
  executionModel: 'organization-default' | ExecutionModel;
  endpointId: string;
};
export const approvedEndpoints = [
  {
    id: 'acme-cloud-gpt4o',
    executionModel: 'customer-cloud' as ExecutionModel,
    name: 'GPT-4o · approved endpoint',
    region: 'US East',
    contextWindow: '128k',
    estimatedCost: '~ $0.02 / task',
    expectedLatency: '~ 1.2 s',
  },
];
export const defaultRuntime = (): RuntimeSelection => ({
  executionModel: 'organization-default',
  endpointId: 'acme-cloud-gpt4o',
});
export function endpointsFor(
  executionModel: RuntimeSelection['executionModel'],
) {
  const runtime =
    executionModel === 'organization-default'
      ? 'customer-cloud'
      : executionModel;
  return approvedEndpoints.filter(
    (endpoint) => endpoint.executionModel === runtime,
  );
}
export function runtimeIsReady(selection: RuntimeSelection) {
  return endpointsFor(selection.executionModel).some(
    (endpoint) => endpoint.id === selection.endpointId,
  );
}
export function parseRuntime(value: unknown): RuntimeSelection | null {
  if (!value || typeof value !== 'object') return null;
  const selection = value as RuntimeSelection;
  if (
    selection.executionModel !== 'organization-default' &&
    !executionModels.some((item) => item.id === selection.executionModel)
  )
    return null;
  if (typeof selection.endpointId !== 'string') return null;
  if (selection.endpointId && !runtimeIsReady(selection)) return null;
  return {
    executionModel: selection.executionModel,
    endpointId: selection.endpointId,
  };
}
export const governanceGroups = [
  {
    title: 'Access & Permissions',
    controls: [
      {
        id: 'sensitiveApproval',
        label: 'Require approval for sensitive actions',
      },
      { id: 'logInteractions', label: 'Log all interactions' },
    ],
  },
  {
    title: 'Policies',
    controls: [
      { id: 'companyPolicy', label: 'Follow company AI policy' },
      { id: 'blockHarmful', label: 'Block harmful content' },
      { id: 'dataResidency', label: 'Respect data residency' },
      { id: 'humanEscalation', label: 'Enable human escalation' },
    ],
  },
  {
    title: 'Data Controls',
    controls: [
      { id: 'noCustomerPii', label: 'Do not store customer PII' },
      { id: 'maskSensitive', label: 'Mask sensitive data' },
      { id: 'companyDataOnly', label: 'Use company data only' },
    ],
  },
  {
    title: 'Compliance',
    controls: [
      { id: 'gdpr', label: 'GDPR' },
      { id: 'soc2', label: 'SOC 2' },
      { id: 'iso27001', label: 'ISO 27001' },
      { id: 'hipaa', label: 'HIPAA (if applicable)' },
    ],
  },
] as const;
export type GovernanceControl =
  (typeof governanceGroups)[number]['controls'][number]['id'];
export type GovernanceSelection = {
  audience: 'everyone';
  controls: Record<GovernanceControl, boolean>;
};
export function defaultGovernance(): GovernanceSelection {
  return {
    audience: 'everyone',
    controls: Object.fromEntries(
      governanceGroups.flatMap((group) =>
        group.controls.map((control) => [control.id, control.id !== 'hipaa']),
      ),
    ) as GovernanceSelection['controls'],
  };
}
export function parseGovernance(value: unknown): GovernanceSelection | null {
  if (!value || typeof value !== 'object') return null;
  const selection = value as GovernanceSelection;
  if (
    selection.audience !== 'everyone' ||
    !selection.controls ||
    typeof selection.controls !== 'object'
  )
    return null;
  const controls = defaultGovernance().controls;
  for (const id of Object.keys(controls) as GovernanceControl[]) {
    if (typeof selection.controls[id] !== 'boolean') return null;
    controls[id] = selection.controls[id];
  }
  return { audience: selection.audience, controls };
}
