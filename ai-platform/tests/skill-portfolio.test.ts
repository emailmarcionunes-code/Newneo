import test from 'node:test';
import assert from 'node:assert/strict';
import { allSkills, definitionFingerprint } from '../lib/skills';
import {
  capabilityCores,
  domainPatterns,
  coreUsage,
  portfolioSkills,
  portfolioSuggestions,
  reuseOf,
} from '../lib/skill-portfolio';
test('portfolio metadata resolves to shared Cores and domain patterns without duplicating Skill IDs', () => {
  const skills = allSkills();
  assert.equal(
    new Set(skills.map((s) => `${s.id}:${s.version}`)).size,
    skills.length,
  );
  for (const s of skills) {
    const reuse = reuseOf(s)!;
    assert.ok(capabilityCores.some((c) => c.id === reuse.coreId));
    assert.ok(domainPatterns.some((d) => d.id === reuse.domainPatternId));
  }
  const scheduling = coreUsage(skills, 'scheduling');
  assert.equal(scheduling.skills.length, 3);
  assert.equal(scheduling.domains.length, 3);
  assert.ok(
    portfolioSuggestions('technical specialist scheduling').some(
      (c) => c.id === 'scheduling',
    ),
  );
  assert.equal(portfolioSuggestions('zzzzunknown').length, 0);
});
test('reuse metadata changes invalidate definition evidence and demo adaptations have no measured evaluation', () => {
  const s = portfolioSkills[0];
  assert.notEqual(
    definitionFingerprint(s),
    definitionFingerprint({ ...s, reuse: { ...s.reuse!, coreId: 'identity' } }),
  );
  assert.ok(portfolioSkills.every((s) => s.evaluationScore === null));
});
