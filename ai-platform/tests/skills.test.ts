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

import {
  publishSkill,
  allSkills,
  latestSkills,
  definitionFingerprint,
  reviseSkillBinding,
  type Skill,
} from '../lib/skills';
const definition: Skill = {
  ...skill,
  id: 'custom-test',
  version: '1.0',
  permissionRequirements: 'Scoped read',
  dataAccess: 'Workspace only',
};
test('publishing preserves immutable versions and rejects stale evidence or unsupported maturity', () => {
  const evidence = definitionFingerprint(definition);
  const ui = publishSkill(undefined, definition, evidence);
  assert.equal(
    latestSkills(ui).find((s) => s.id === definition.id)?.version,
    '1.0',
  );
  assert.throws(() => publishSkill(ui, definition, evidence), /already exists/);
  assert.throws(
    () => publishSkill(ui, { ...definition, version: '1.1' }, evidence),
    /fresh/,
  );
  assert.throws(
    () =>
      publishSkill(
        undefined,
        { ...definition, maturity: 'Proven at Scale' },
        evidence,
      ),
    /Operational/,
  );
  const next = { ...definition, version: '1.1' };
  const revised = publishSkill(ui, next, definitionFingerprint(next));
  assert.equal(
    allSkills(revised).filter((s) => s.id === definition.id).length,
    2,
  );
  assert.equal(
    latestSkills(revised).find((s) => s.id === definition.id)?.version,
    '1.1',
  );
});
test('upgrading, configuring and removing a Skill only changes draft and records history', () => {
  const initial = addSkillToDraft(
    undefined,
    'it-support',
    'v2.3',
    skill,
    valid(),
  );
  const next = { ...skill, version: '1.7' };
  const b = { ...valid(), skillVersion: '1.7', scope: 'Support staff' };
  b.validationFingerprint = bindingFingerprint(b);
  const changed = reviseSkillBinding(initial.ui, 'it-support', 'v2.3', next, b);
  assert.equal(
    composition(changed.ui, 'it-support', 'v2.4').bindings.at(-1)?.skillVersion,
    '1.7',
  );
  assert.ok(
    composition(changed.ui, 'it-support', 'v2.4').changes.some(
      (c) => c.kind === 'Skill version changed',
    ),
  );
  const removed = reviseSkillBinding(
    changed.ui,
    'it-support',
    'v2.3',
    next,
    null,
  );
  assert.equal(removed.count, 1);
  assert.deepEqual(
    composition(removed.ui, 'it-support', 'v2.3'),
    composition(undefined, 'it-support', 'v2.3'),
  );
  assert.equal(
    composition(removed.ui, 'it-support', 'v2.4').changes.at(-1)?.kind,
    'Removed Skill',
  );
});

test('simulated failures and warnings limit maturity without being operational evidence', () => {
  const failed: Skill = {
    ...definition,
    maturity: 'Validated',
    evaluationSuite: definition.evaluationSuite.map((s, i) => ({
      ...s,
      previewResult: i === 0 ? 'Failed' : 'Passed',
    })),
  };
  assert.throws(
    () => publishSkill(undefined, failed, definitionFingerprint(failed)),
    /failing scenarios/,
  );
  const warned: Skill = {
    ...definition,
    maturity: 'Production Ready',
    evaluationSuite: definition.evaluationSuite.map((s, i) => ({
      ...s,
      previewResult: i === 0 ? 'Warning' : 'Passed',
    })),
  };
  assert.throws(
    () => publishSkill(undefined, warned, definitionFingerprint(warned)),
    /warnings/,
  );
  const experimental: Skill = { ...failed, maturity: 'Experimental' };
  assert.equal(
    latestSkills(publishSkill(undefined, experimental, '')).find(
      (s) => s.id === definition.id,
    )?.evaluationScore,
    null,
  );
});
