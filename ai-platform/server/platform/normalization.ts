import { eventTypes, type PlatformEvent, type UsageCharge } from './contracts';
const optionalIds = [
  'taskId',
  'agentId',
  'agentVersionId',
  'skillId',
  'modelEndpointId',
  'resourceId',
] as const;
function nonempty(value: unknown): asserts value is string {
  if (typeof value !== 'string' || !value.trim())
    throw new Error('Missing canonical identifier');
}
function base(value: {
  organizationId: string;
  workspaceId: string;
  id: string;
  occurredAt: string;
  environment: string;
}) {
  for (const key of ['organizationId', 'workspaceId', 'id'] as const)
    nonempty(value[key]);
  if (!Number.isFinite(Date.parse(value.occurredAt)))
    throw new Error('Invalid event timestamp');
  if (!['development', 'staging', 'production'].includes(value.environment))
    throw new Error('Invalid environment');
}
/** Adapter must explicitly map provider fields first. Unknown raw fields are dropped. */
export function normalizeEvent(value: PlatformEvent): PlatformEvent {
  base(value);
  nonempty(value.correlationId);
  if (!(eventTypes as readonly string[]).includes(value.type))
    throw new Error('Unknown NEWNEO event');
  if (value.type !== 'DeploymentChanged' && value.type !== 'IncidentOpened')
    nonempty(value.taskId);
  const event: PlatformEvent = {
    id: value.id,
    organizationId: value.organizationId,
    workspaceId: value.workspaceId,
    type: value.type,
    occurredAt: new Date(value.occurredAt).toISOString(),
    correlationId: value.correlationId,
    environment: value.environment,
  };
  for (const key of optionalIds)
    if (value[key] !== undefined) {
      nonempty(value[key]);
      event[key] = value[key];
    }
  return event;
}
export function normalizeCharge(value: UsageCharge): UsageCharge {
  base(value);
  nonempty(value.taskId);
  nonempty(value.agentId);
  if (
    value.currency !== 'USD' ||
    !Number.isSafeInteger(value.amountMicros) ||
    value.amountMicros < 0
  )
    throw new Error('Usage requires nonnegative integer USD micro-units');
  for (const key of ['skillId', 'modelEndpointId'] as const)
    if (value[key] !== undefined) nonempty(value[key]);
  return {
    id: value.id,
    organizationId: value.organizationId,
    workspaceId: value.workspaceId,
    taskId: value.taskId,
    agentId: value.agentId,
    environment: value.environment,
    occurredAt: new Date(value.occurredAt).toISOString(),
    currency: 'USD',
    amountMicros: value.amountMicros,
    ...(value.skillId ? { skillId: value.skillId } : {}),
    ...(value.modelEndpointId
      ? { modelEndpointId: value.modelEndpointId }
      : {}),
  };
}
/** For a single workspace batch. Durable ingestion still needs a DB unique constraint. */
export function summarizeCharges(values: UsageCharge[]) {
  const unique = new Map<string, UsageCharge>();
  let scope: string | undefined;
  for (const raw of values) {
    const charge = normalizeCharge(raw);
    const current = JSON.stringify([charge.organizationId, charge.workspaceId]);
    if (scope && scope !== current) throw new Error('Mixed workspace usage');
    scope = current;
    const previous = unique.get(charge.id);
    if (previous && JSON.stringify(previous) !== JSON.stringify(charge))
      throw new Error('Conflicting charge identity');
    unique.set(charge.id, charge);
  }
  const amountMicros = [...unique.values()].reduce(
    (sum, item) => sum + item.amountMicros,
    0,
  );
  if (!Number.isSafeInteger(amountMicros))
    throw new Error('Usage total overflow');
  return {
    amountMicros,
    taskCount: new Set([...unique.values()].map((c) => c.taskId)).size,
    chargeCount: unique.size,
  };
}
