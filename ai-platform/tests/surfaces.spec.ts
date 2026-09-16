import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
for (const width of [1440, 1180, 768, 390])
  test(`Hybrid v4 surfaces ${width}`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: width === 1180 ? 740 : 900 });
    for (const route of [
      '/',
      '/agents',
      '/agents/catalog',
      '/knowledge',
      '/tools',
      '/evaluations',
      '/deployments',
      '/agentops',
      '/finops',
      '/reports',
      '/playground',
      '/audit-log',
      '/governance',
      '/settings',
      '/login',
      '/knowledge/confluence',
      '/tools/servicenow',
      '/agents/customer-service',
      '/evaluations/customer-service',
      '/deployments/customer-service',
      '/agentops/incidents/inc-001',
      '/governance/policies/pii',
    ]) {
      await page.goto(route);
      await expect(
        page.locator('main h1:visible,main h2:visible').first(),
      ).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        route,
      ).toBe(true);
      const result = await new AxeBuilder({ page }).include('main').analyze();
      expect(result.violations, route).toEqual([]);
      if (width === 1440 || width === 1180)
        await page.screenshot({
          path: info.outputPath(
            `${route.replaceAll('/', '_') || 'overview'}.png`,
          ),
          fullPage: true,
        });
    }
  });
test('canonical shell groups, manual collapse and keyboard tooltip', async ({
  page,
}) => {
  await page.goto('/agents');
  await expect(page.locator('.sidebar')).toHaveCSS('width', '224px');
  await expect(
    page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link'),
  ).toHaveCount(12);
  await expect(
    page
      .getByRole('navigation', { name: 'Main navigation' })
      .getByRole('link', { name: 'Models' }),
  ).toHaveCount(0);
  await page.getByRole('button', { name: 'Collapse sidebar' }).click();
  await expect(page.locator('.sidebar')).toHaveCSS('width', '60px');
  await page.getByRole('link', { name: 'Knowledge', exact: true }).focus();
  await expect(
    page.getByRole('link', { name: 'Knowledge', exact: true }),
  ).toHaveAttribute('data-tooltip', 'Knowledge');
  await page.getByRole('link', { name: 'Knowledge', exact: true }).click();
  await expect(page).toHaveURL(/\/knowledge$/);
  await expect(page.locator('.sidebar')).toHaveCSS('width', '60px');
  await page.getByRole('link', { name: 'Agents', exact: true }).hover();
  await expect(page.locator('.sidebar')).toHaveCSS('width', '60px');
  await page.reload();
  await expect(page.locator('.sidebar')).toHaveCSS('width', '60px');
  await page.getByRole('button', { name: 'Expand sidebar' }).click();
  await expect(page.locator('.sidebar')).toHaveCSS('width', '224px');
});
test('server routes continue to fail closed without identity', async ({
  request,
}) => {
  expect((await request.get('/api/workspace/drafts')).status()).toBe(401);
  expect(
    (await request.post('/api/launch/deploy', { data: {} })).status(),
  ).toBe(503);
});
