import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createDraft, parseDraft } from '../lib/launch';
import { handlePreview } from '../lib/preview-server';
import { POST as liveDeploy } from '../app/api/launch/deploy/route';

const draft = () => ({ ...createDraft(), step: 5 });
function evaluate(value = draft(), now = 1000) {
  const response = handlePreview(
    { mode: 'preview', action: 'evaluate', draft: value },
    now,
  );
  assert.equal(response.status, 200);
  assert.ok('token' in response.data);
  return response.data.token;
}
test('reference receipt supports only a simulated confirmation for the same configuration', () => {
  const value = draft();
  const response = handlePreview(
    {
      mode: 'preview',
      action: 'deploy',
      draft: { ...value, step: 6 },
      environment: 'Production',
      token: evaluate(value),
    },
    2000,
  );
  assert.equal(response.status, 200);
  assert.deepEqual(response.data, {
    mode: 'preview',
    deployed: false,
    agentName: value.name,
    environment: 'Production',
  });
});
test('preview rejects absent, forged, expired and stale reference receipts', () => {
  const value = draft();
  const token = evaluate(value);
  for (const patch of [
    { token: undefined },
    { token: 'forged' },
    { token: `${token}x` },
    { draft: { ...value, name: 'Different agent' } },
    {
      draft: {
        ...value,
        governance: {
          ...value.governance,
          controls: { ...value.governance.controls, hipaa: true },
        },
      },
    },
  ]) {
    assert.equal(
      handlePreview(
        {
          mode: 'preview',
          action: 'deploy',
          draft: value,
          environment: 'Production',
          token,
          ...patch,
        },
        2000,
      ).status,
      409,
    );
  }
  assert.equal(
    handlePreview(
      {
        mode: 'preview',
        action: 'deploy',
        draft: value,
        environment: 'Production',
        token,
      },
      601001,
    ).status,
    409,
  );
});
test('invalid resources, runtime and scope cannot enter the preview flow', () => {
  for (const patch of [
    { organizationId: 'other' },
    { knowledge: ['unknown'] },
    { tools: { servicenow: ['close'] } },
    { runtime: { executionModel: 'private', endpointId: 'acme-cloud-gpt4o' } },
    { name: '' },
  ]) {
    assert.equal(
      handlePreview({
        mode: 'preview',
        action: 'evaluate',
        draft: { ...draft(), ...patch },
      }).status,
      400,
    );
  }
  assert.equal(
    handlePreview({
      mode: 'live',
      action: 'deploy',
      draft: draft(),
      approved: true,
    }).status,
    403,
  );
});
test('actual deployment fails closed even when a client claims approval', async () => {
  const response = await liveDeploy();
  assert.equal(response.status, 503);
});
test('saved environment is restored but preview evaluation and success are not trusted from storage', () => {
  const value = {
    ...draft(),
    step: 6,
    environment: 'Production',
    evaluation: { score: 100 },
    deployed: true,
  };
  const restored = parseDraft(JSON.stringify(value), value.templateId);
  assert.equal(restored?.step, 6);
  assert.equal(restored?.environment, 'Production');
  assert.equal('deployed' in restored!, false);
  assert.equal('evaluation' in restored!, false);
});
