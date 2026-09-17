import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  productCapabilities,
  hasCapability,
  isOperationsPath,
  demoProductRole,
} from '../lib/product-access';
import { businessAgent } from '../server/business-workspace';
test('Workspace and Operations roles are distinct and unknown roles fail closed', () => {
  for (const role of ['Read Only', 'Business Owner', 'Unknown', undefined])
    assert.equal(hasCapability(role, 'operations:view'), false);
  for (const role of [
    'Org Admin',
    'AI Platform Admin',
    'AI Engineer',
    'Operator',
    'Reviewer / Approver',
  ])
    assert.equal(hasCapability(role, 'operations:view'), true);
  assert.equal(hasCapability('Business Owner', 'business:propose'), true);
  assert.equal(hasCapability('Business Owner', 'agents:configure'), false);
  assert.equal(hasCapability('Operator', 'agents:configure'), false);
  assert.deepEqual(productCapabilities('unknown'), []);
  assert.equal(demoProductRole('Employee'), 'Read Only');
  assert.equal(demoProductRole('Department Owner'), 'Business Owner');
});
test('legacy technical links remain Operations routes while Workspace paths are business', () => {
  for (const path of [
    '/agents',
    '/agents/example',
    '/skills',
    '/settings',
    '/operations',
  ])
    assert.equal(isOperationsPath(path), true);
  for (const path of [
    '/',
    '/workspace/agents',
    '/workspace/discover',
    '/login',
  ])
    assert.equal(isOperationsPath(path), false);
});
test('business Agent is a projection of the same ID, with technical configuration excluded', () => {
  const a = businessAgent(
    {
      id: 'same-agent',
      name: 'Analyst',
      description: 'Review documents',
      organization_id: 'private',
    },
    {
      id: 'same-version',
      configuration: {
        mission: 'Review contracts',
        model: 'hidden-model',
        infrastructure: 'hidden-cloud',
        toolPlan: 'hidden-tools',
        skillPlan: '["Compare clauses"]',
      },
    },
    [{ id: 'source', title: 'Contracts' }],
  );
  assert.equal(a.id, 'same-agent');
  assert.equal(a.versionId, 'same-version');
  assert.equal(a.canSearch, true);
  assert.deepEqual(a.capabilities, ['Compare clauses']);
  assert.equal(JSON.stringify(a).includes('hidden'), false);
  assert.equal('organization_id' in a, false);
  assert.deepEqual(businessAgent({ id: 'a' }, undefined, []).capabilities, []);
});
