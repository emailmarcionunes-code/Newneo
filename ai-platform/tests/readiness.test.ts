import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createDraft, parseDraft } from '../lib/launch';
import { readiness, productionBlockers } from '../lib/readiness';
import { handlePreview } from '../lib/preview-server';
test('navigation alone cannot increase production readiness', () => {
  const d = createDraft();
  assert.equal(readiness(d).percent, 0);
  d.step = 7;
  assert.equal(readiness(d).percent, 0);
  assert.ok(productionBlockers(d).length > 0);
});
test('validated stage completion survives backward navigation and reflects invalidation', () => {
  const d = {
    ...createDraft(),
    businessOwner: 'Support',
    successMetric: '70%',
    reviewedStages: [0, 1, 2, 3, 4, 5],
    step: 6,
  };
  assert.equal(readiness(d).percent, 75);
  d.step = 0;
  assert.equal(readiness(d).percent, 75);
  d.name = '';
  assert.equal(readiness(d).percent, 63);
});
test('legacy runtime migrates into independent domain decisions', () => {
  const { infrastructure, model, ...d } = createDraft();
  const migrated = parseDraft(
    JSON.stringify({
      ...d,
      runtime: { executionModel: 'hybrid', endpointId: 'demo-cloud-claude' },
    }),
    d.templateId,
  )!;
  assert.deepEqual(migrated.infrastructure, { kind: 'hybrid' });
  assert.deepEqual(migrated.model, { modelId: 'demo-cloud-claude' });
  assert.equal('runtime' in migrated, false);
});
test('production gate refuses unresolved evaluation and missing manifest approval', () => {
  const d = {
    ...createDraft(),
    businessOwner: 'Support',
    successMetric: '70%',
    productionApproved: true,
  };
  const run = handlePreview(
    { mode: 'preview', action: 'evaluate', draft: d },
    1000,
  );
  assert.ok('token' in run.data);
  const response = handlePreview(
    {
      mode: 'preview',
      action: 'deploy',
      draft: d,
      environment: 'Production',
      token: 'token' in run.data ? run.data.token : '',
    },
    2000,
  );
  assert.equal(response.status, 409);
  assert.match(
    String('error' in response.data && response.data.error),
    /failed evaluation/,
  );
});

test('Production requires manifest approval even after a passing reference evaluation', () => {
  const d = {
    ...createDraft(),
    businessOwner: 'Support',
    successMetric: '70%',
    evaluationRemediation: true,
    productionApproved: false,
  };
  const run = handlePreview(
    { mode: 'preview', action: 'evaluate', draft: d },
    1000,
  );
  assert.ok('token' in run.data);
  const input = {
    mode: 'preview',
    action: 'deploy',
    draft: d,
    environment: 'Production',
    token: 'token' in run.data ? run.data.token : '',
  };
  assert.equal(handlePreview(input, 2000).status, 409);
  assert.equal(
    handlePreview({ ...input, draft: { ...d, productionApproved: true } }, 2000)
      .status,
    200,
  );
});
