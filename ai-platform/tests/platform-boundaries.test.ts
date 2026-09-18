import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeEvent,
  normalizeCharge,
  summarizeCharges,
} from '../server/platform/normalization';
import type { PlatformEvent, UsageCharge } from '../server/platform/contracts';
const scope = { organizationId: 'org', workspaceId: 'workspace' };
const event: PlatformEvent = {
  ...scope,
  id: 'event',
  type: 'TaskStarted',
  taskId: 'task',
  correlationId: 'trace',
  environment: 'staging',
  occurredAt: '2026-09-16T12:00:00Z',
};
const charge: UsageCharge = {
  ...scope,
  id: 'charge',
  taskId: 'task',
  agentId: 'agent',
  environment: 'staging',
  occurredAt: event.occurredAt,
  currency: 'USD',
  amountMicros: 1200,
};
test('event projection drops provider payloads and rejects invalid event identity', () => {
  const normalized = normalizeEvent({
    ...event,
    providerArn: 'private',
    rawPayload: { secret: true },
  } as PlatformEvent);
  assert.equal('rawPayload' in normalized, false);
  assert.equal('providerArn' in normalized, false);
  assert.throws(() => normalizeEvent({ ...event, taskId: undefined }));
  assert.throws(() =>
    normalizeEvent({
      ...event,
      type: 'CloudEvent',
    } as unknown as PlatformEvent),
  );
  assert.throws(() => normalizeEvent({ ...event, workspaceId: '' }));
  assert.equal(
    normalizeEvent({ ...event, type: 'DeploymentChanged', taskId: undefined })
      .type,
    'DeploymentChanged',
  );
});
test('multiple provider charges remain one business Task, with retry deduplication', () => {
  assert.deepEqual(
    summarizeCharges([charge, charge, { ...charge, id: 'call-2' }]),
    { taskCount: 1, chargeCount: 2, amountMicros: 2400 },
  );
  assert.throws(() =>
    summarizeCharges([charge, { ...charge, amountMicros: 99 }]),
  );
  assert.throws(() =>
    summarizeCharges([charge, { ...charge, workspaceId: 'other' }]),
  );
  assert.throws(() => normalizeCharge({ ...charge, amountMicros: 0.1 }));
  assert.throws(() => normalizeCharge({ ...charge, amountMicros: -1 }));
  assert.throws(() =>
    summarizeCharges([
      { ...charge, amountMicros: Number.MAX_SAFE_INTEGER },
      { ...charge, id: 'second' },
    ]),
  );
  assert.equal(
    'providerId' in
      normalizeCharge({ ...charge, providerId: 'private' } as UsageCharge),
    false,
  );
});
