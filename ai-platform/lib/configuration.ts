import { hybridModels } from './hybrid-models';
// Organization-scoped preview registry. Production must supply approved resources
// and enforce permissions through its backend; these fixtures grant no access.
export const executionModels = [
  {
    id: 'managed',
    name: 'Cloud',
    description: 'Use leading approved model providers.',
  },
  {
    id: 'customer-cloud',
    name: 'Private Cloud',
    description: 'Run in your own cloud account.',
  },
  {
    id: 'private',
    name: 'Local / On-Prem',
    description: 'Run approved open models in your environment.',
  },
  {
    id: 'hybrid',
    name: 'Hybrid',
    description: 'Combine approved execution models.',
  },
] as const;
export type ExecutionModel = (typeof executionModels)[number]['id'];
export type RuntimeSelection = {
  executionModel: 'organization-default' | ExecutionModel;
  endpointId: string;
};
export const approvedEndpoints = hybridModels.map((m) => ({
  id: m.id,
  provider: m.provider,
  executionModel: 'managed' as ExecutionModel,
  name: m.name,
  region: 'Organization default',
  contextWindow: m.context,
  estimatedCost: m.cost,
  expectedLatency: m.latency,
}));
export const defaultRuntime = (): RuntimeSelection => ({
  executionModel: 'organization-default',
  endpointId: 'acme-cloud-gpt4o',
});
export function endpointsFor(
  executionModel: RuntimeSelection['executionModel'],
) {
  // Model and infrastructure are independent preview choices; actual availability
  // must be validated by the organization endpoint adapter before live execution.
  return executionModel === 'organization-default' ||
    executionModels.some((x) => x.id === executionModel)
    ? approvedEndpoints
    : [];
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
      { id: 'roleBasedAccess', label: 'Role-based access' },
      { id: 'retentionPolicy', label: 'Retention policy' },
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
    if (
      (id === 'roleBasedAccess' || id === 'retentionPolicy') &&
      selection.controls[id] === undefined
    )
      continue;
    if (typeof selection.controls[id] !== 'boolean') return null;
    controls[id] = selection.controls[id];
  }
  return { audience: selection.audience, controls };
}

// Canonical domain selections. RuntimeSelection remains only a legacy adapter.
export type InfrastructureSelection = { kind: ExecutionModel };
export type ModelSelection = { modelId: string };
export const defaultInfrastructure = (): InfrastructureSelection => ({
  kind: 'managed',
});
export const defaultModel = (): ModelSelection => ({
  modelId: 'acme-cloud-gpt4o',
});
export function parseInfrastructure(
  v: unknown,
): InfrastructureSelection | null {
  if (
    !v ||
    typeof v !== 'object' ||
    !executionModels.some((x) => x.id === (v as InfrastructureSelection).kind)
  )
    return null;
  return { kind: (v as InfrastructureSelection).kind };
}
export function parseModel(v: unknown): ModelSelection | null {
  if (
    !v ||
    typeof v !== 'object' ||
    !approvedEndpoints.some((x) => x.id === (v as ModelSelection).modelId)
  )
    return null;
  return { modelId: (v as ModelSelection).modelId };
}
export function splitLegacyRuntime(v: RuntimeSelection) {
  return {
    infrastructure: {
      kind:
        v.executionModel === 'organization-default'
          ? 'managed'
          : v.executionModel,
    } as InfrastructureSelection,
    model: { modelId: v.endpointId },
  };
}
