import test from 'node:test';
import assert from 'node:assert/strict';
import {
  skillLibrary,
  emptyBinding,
  bindingFingerprint,
  validateBinding,
  addSkillToDraft,
  composition,
} from '../lib/skills';
const skill = skillLibrary[0];
function valid() {
  const b = {
    ...emptyBinding(skill),
    knowledge: 'IT KB',
    tools: Object.fromEntries(
      skill.toolRequirements.map((t) => [t, 'approved action']),
    ),
    permissions: true,
    scope: 'IT users',
    policies: true,
    humanApproval: true,
  };
  return {
    ...b,
    evaluated: true,
    validationFingerprint: bindingFingerprint(b),
  };
}
test('binding blocks unmet requirements and out-of-domain capabilities', () => {
  assert.ok(
    validateBinding(skill, emptyBinding(skill), 'IT').some(
      (c) => c.status === 'Blocking',
    ),
  );
  assert.ok(
    validateBinding(skill, valid(), 'Sales').some(
      (c) => c.name === 'Mission / domain boundary' && c.status === 'Blocking',
    ),
  );
});
test('Skill added to pinned draft without changing live identity or production composition', () => {
  const live = composition(undefined, 'it-support', 'v2.3');
  const result = addSkillToDraft(
    undefined,
    'it-support',
    'v2.3',
    skill,
    valid(),
  );
  assert.equal(result.version, 'v2.4');
  assert.deepEqual(composition(result.ui, 'it-support', 'v2.3'), live);
  assert.equal(
    composition(result.ui, 'it-support', 'v2.4').bindings.at(-1)?.skillVersion,
    '1.6',
  );
  assert.equal(result.count, 2);
  assert.throws(
    () => addSkillToDraft(result.ui, 'it-support', 'v2.3', skill, valid()),
    /already bound/,
  );
});
test('editing a binding invalidates scenario evidence', () => {
  const b = valid();
  b.scope = 'all enterprise users';
  assert.ok(
    validateBinding(skill, b, 'IT').some(
      (c) =>
        c.name === 'Skill scenarios and Agent regression' &&
        c.status === 'Blocking',
    ),
  );
  assert.throws(() =>
    addSkillToDraft(undefined, 'it-support', 'v2.3', skill, b),
  );
});
test('shared Skill definition supports distinct Agent bindings', () => {
  const ticket = skillLibrary.find((s) => s.id === 'create-ticket')!;
  assert.equal(
    composition(undefined, 'it-support', 'v1.0').bindings[0].skillId,
    ticket.id,
  );
  assert.equal(
    composition(undefined, 'customer-service', 'v1.0').bindings[0].skillId,
    ticket.id,
  );
  assert.equal(skillLibrary.filter((s) => s.id === ticket.id).length, 1);
});
