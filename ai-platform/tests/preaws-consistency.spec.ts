import { test, expect } from '@playwright/test';
test('created sample telemetry stays consistent across overview, reports and AgentOps', async ({
  page,
}) => {
  await page.goto('/agents');
  // Wait for the complete persisted state before adding the telemetry fixture.
  await page.waitForFunction(() => {
    const raw = sessionStorage.getItem('newneo:customer-journeys:v1');
    return raw && JSON.parse(raw).version === 1;
  });
  await page.evaluate(() => {
    const key = 'newneo:customer-journeys:v1';
    const state = JSON.parse(sessionStorage.getItem(key) || '{}');
    state.ui = {
      ...state.ui,
      'workspace:agents': [
        {
          id: 'preview-audit',
          name: 'Audit Agent',
          model: 'Sample',
          tasks: '100',
          success: '100%',
          score: 95,
          cost: 10,
          budget: 100,
          status: 'Staging',
          latency: '1s',
        },
      ],
    };
    sessionStorage.setItem(key, JSON.stringify(state));
  });
  await page.goto('/');
  await expect(
    page.locator('.overviewFidelity a[href="/agents/preview-audit"]'),
  ).toBeVisible();
  const overview = await page
    .locator('.overviewReferenceMetrics article')
    .filter({
      has: page.getByRole('heading', { name: 'Success rate', exact: true }),
    })
    .locator('strong')
    .innerText();
  await page.goto('/agentops');
  await expect(page.locator('[data-metric="Success rate"] strong')).toHaveText(
    overview,
  );
  await page.goto('/reports');
  await expect(
    page.locator('[data-metric="Avg Success Rate"] strong'),
  ).toHaveText(overview);
});
