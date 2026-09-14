import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const width of [1180, 768, 390])
  test(`workspace surfaces responsive ${width}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      'knowledge',
      'tools',
      'models',
      'evaluations',
      'deployments',
      'governance',
      'agentops',
      'finops',
      'settings',
    ]) {
      await page.goto(`/${route}`);
      await expect(page.locator('h1')).toBeVisible();
      if (route === 'settings')
        await expect(
          page.getByText('Server login is not configured.', { exact: false }),
        ).toBeVisible();
      const firstDetail = page
        .getByRole('button', { name: /^View .* details/ })
        .first();
      if (await firstDetail.count()) await firstDetail.click();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        route,
      ).toBe(true);
      const result = await new AxeBuilder({ page })
        .include('.surfacePage')
        .analyze();
      expect(result.violations, route).toEqual([]);
      if (['knowledge', 'agentops', 'finops'].includes(route))
        await page.screenshot({
          path: testInfo.outputPath(`${route}-${width}.png`),
          fullPage: true,
        });
    }
  });
test('registry filters, resource details, fleet inspection and budget calculator', async ({
  page,
}) => {
  await page.goto('/tools');
  await page.getByRole('button', { name: 'MCP Servers', exact: true }).click();
  await expect(page.locator('.surfaceCards .agentCard')).toHaveCount(1);
  await page
    .getByRole('button', { name: 'View Custom API / MCP details →' })
    .click();
  await expect(
    page.getByRole('complementary', { name: 'Selected resource details' }),
  ).toContainText('Authentication');
  await page.getByLabel('Search Tools & MCP').fill('no-match');
  await expect(
    page.getByRole('heading', { name: 'No matching results' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(page.locator('.surfaceCards .agentCard')).toHaveCount(6);
  await page.goto('/agentops');
  await page.getByRole('button', { name: 'Healthy', exact: true }).click();
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await page.getByRole('button', { name: 'Inspect IT Support Agent' }).click();
  await expect(
    page.getByText('No sample incidents for this agent.'),
  ).toBeVisible();
  await page.goto('/finops');
  await page.getByLabel('Monthly budget (USD)').fill('100');
  await expect(page.getByRole('status')).toContainText('240% used');
  await page.getByLabel('Monthly budget (USD)').fill('0');
  await expect(page.getByRole('status')).toContainText('greater than zero');
});
test('server routes fail closed without a verified session', async ({
  request,
}) => {
  const session = await request.get('/api/session');
  expect(await session.json()).toMatchObject({
    authenticated: false,
    configured: false,
  });
  expect((await request.get('/api/workspace/drafts')).status()).toBe(401);
  expect(
    (
      await request.post('/api/workspace/drafts', {
        data: { configuration: {} },
      })
    ).status(),
  ).toBe(403);
  expect(
    (
      await request.post('/api/workspace/select', {
        headers: { Origin: 'https://attacker.invalid' },
        data: { workspaceId: 'forged' },
      })
    ).status(),
  ).toBe(403);
  expect((await request.get('/api/auth/login')).status()).toBe(503);
});
