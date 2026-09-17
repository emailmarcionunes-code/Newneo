import assert from 'node:assert/strict';
import { test } from 'node:test';
import { agentTemplates, filterAgents, getTemplate } from '../lib/catalog';
import {
  approvedActions,
  createDraft,
  draftKey,
  parseDraft,
} from '../lib/launch';

test('every catalog launch retains its template and business defaults', () => {
  for (const template of agentTemplates) {
    const draft = createDraft(template.id);
    assert.equal(draft.templateId, template.id);
    assert.equal(draft.name, template.name);
    assert.equal(draft.description, template.defaultMission);
    assert.equal(draft.businessOwner, template.suggestedBusinessOwner);
    assert.equal(draft.criticality, template.defaultCriticality);
  }
  assert.equal(createDraft('custom').description, '');
  assert.equal(getTemplate('unknown').id, 'customer-service');
  assert.ok(filterAgents('All').length >= 20);
  assert.deepEqual(
    filterAgents('IT').map((agent) => agent.id),
    ['it-support', 'incident-response', 'access-requests'],
  );
});
test('saved drafts round-trip and do not cross organization, workspace or template', () => {
  const draft = { ...createDraft(), name: 'Acme support', step: 2 };
  assert.deepEqual(parseDraft(JSON.stringify(draft), draft.templateId), {
    ...draft,
    savedAt: undefined,
  });
  for (const patch of [
    { organizationId: 'another-org' },
    { workspaceId: 'another-workspace' },
    { schemaVersion: 2 },
    { step: 8 },
    { tools: [] },
    { name: null },
  ])
    assert.equal(
      parseDraft(JSON.stringify({ ...draft, ...patch }), draft.templateId),
      null,
    );
  assert.equal(parseDraft('{invalid', draft.templateId), null);
  assert.equal(parseDraft(JSON.stringify(draft), 'custom'), null);
  assert.notEqual(draftKey('custom'), draftKey('customer-service'));
});
test('unapproved actions cannot enter the draft and connectors grant nothing automatically', () => {
  assert.deepEqual(approvedActions('servicenow', []), []);
  assert.deepEqual(
    approvedActions('servicenow', ['close', 'create', 'create', 'delete']),
    ['create'],
  );
  assert.deepEqual(approvedActions('unknown', ['read']), []);
  const tampered = {
    ...createDraft(),
    knowledge: ['sharepoint', 'unknown'],
    tools: { servicenow: ['close', 'search'], unknown: ['write'] },
  };
  const restored = parseDraft(JSON.stringify(tampered), 'customer-service');
  assert.deepEqual(restored?.knowledge, ['sharepoint']);
  assert.deepEqual(restored?.tools, { servicenow: ['search'] });
});
test('incomplete drafts resume at Use Case instead of appearing completed', () => {
  assert.equal(
    parseDraft(
      JSON.stringify({ ...createDraft(), name: ' ', step: 3 }),
      'customer-service',
    )?.step,
    0,
  );
});

test('legacy drafts migrate without losing source or tool selections', () => {
  const { infrastructure, model, governance, ...legacy } = createDraft();
  const restored = parseDraft(
    JSON.stringify({ ...legacy, step: 3 }),
    legacy.templateId,
  );
  assert.deepEqual(restored?.infrastructure, infrastructure);
  assert.deepEqual(restored?.model, model);
  assert.deepEqual(restored?.governance, governance);
  assert.deepEqual(restored?.tools, legacy.tools);
  assert.deepEqual(restored?.knowledge, legacy.knowledge);
});

test('runtime and governance edits round-trip without coercing booleans', () => {
  const draft = createDraft();
  draft.step = 5;
  draft.infrastructure.kind = 'customer-cloud';
  draft.governance.controls.hipaa = true;
  draft.governance.controls.logInteractions = false;
  const restored = parseDraft(JSON.stringify(draft), draft.templateId);
  assert.deepEqual(restored, { ...draft, savedAt: undefined });
});

test('unapproved or incompatible endpoints cannot resume beyond model configuration', () => {
  for (const runtime of [
    { executionModel: 'customer-cloud', endpointId: 'unapproved' },
    { executionModel: 'unknown', endpointId: 'acme-cloud-gpt4o' },
    { executionModel: 'managed', endpointId: '' },
  ]) {
    const { infrastructure, model, ...base } = createDraft();
    const draft = { ...base, step: 5, runtime };
    const restored = parseDraft(JSON.stringify(draft), draft.templateId);
    assert.equal(restored?.step, 3);
  }
});

test('invalid governance settings resume at governance and restore safe defaults', () => {
  const draft = createDraft();
  const restored = parseDraft(
    JSON.stringify({
      ...draft,
      step: 5,
      governance: {
        ...draft.governance,
        controls: { ...draft.governance.controls, sensitiveApproval: 'false' },
      },
    }),
    draft.templateId,
  );
  assert.equal(restored?.step, 5);
  assert.equal(restored?.governance.controls.sensitiveApproval, true);
});

test('seven-step drafts migrate to matching eight-step screen', () => {
  const { journeyVersion, ...old } = createDraft();
  for (const [before, after] of [
    [3, 3],
    [4, 5],
    [5, 6],
    [6, 6],
  ]) {
    assert.equal(
      parseDraft(JSON.stringify({ ...old, step: before }), old.templateId)
        ?.step,
      after,
    );
  }
});
