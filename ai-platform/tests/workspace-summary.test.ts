import { test } from 'node:test';
import assert from 'node:assert/strict';
import { workspaceSummary, percent } from '../lib/workspace-summary';
test('workspace totals weight measured tasks and exclude missing telemetry', () => {
  const summary = workspaceSummary([
    { tasks: '1,000', success: '90%', score: 80, cost: 20 },
    { tasks: '100', success: '100%', score: 100, cost: 5 },
    { tasks: '—', success: '—', score: 90, cost: 0 },
  ]);
  assert.equal(summary.tasks, 1100);
  assert.equal(summary.successfulTasks, 1000);
  assert.equal(percent(summary.successRate), '90.9%');
  assert.equal(summary.spend, 25);
  assert.equal(summary.readiness, 90);
});
test('empty telemetry does not report a fabricated zero-percent success', () => {
  assert.equal(percent(workspaceSummary([]).successRate), '—');
  assert.equal(workspaceSummary([]).readiness, null);
});
