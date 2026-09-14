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
    assert.equal(draft.description, template.objective);
  }
  assert.equal(createDraft('custom').description, '');
  assert.equal(getTemplate('unknown').id, 'customer-service');
  assert.equal(filterAgents('All').length, 6);
  assert.deepEqual(
    filterAgents('IT').map((agent) => agent.id),
    ['it-support'],
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
    { step: 7 },
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
