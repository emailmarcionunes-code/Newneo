import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('agent detail navigation, version safety and test preview', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'View agent' }).click();
  await expect(page).toHaveURL(/agents\/customer-service$/);
  await page.getByRole('tab', { name: 'Configuration', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Current configuration · v1.2' }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Create New Version', exact: true })
    .first()
    .click();
  await expect(page.getByRole('status')).toContainText(
    'production reference is unchanged',
  );
  await expect(
    page.getByRole('button', { name: 'Promote', exact: true }),
  ).toBeDisabled();
  await page.getByRole('button', { name: 'Test', exact: true }).click();
  await page
    .getByRole('button', { name: 'How can I get help with an order?' })
    .click();
  await expect(page.getByRole('dialog')).toContainText('Sample response');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.reload();
  await page.getByRole('tab', { name: 'Versions', exact: true }).click();
  await expect(
    page.getByText('New version draft prepared', { exact: false }),
  ).toHaveCount(0);
  await page
    .getByRole('tab', { name: 'Versions', exact: true })
    .press('ArrowRight');
  await expect(
    page.getByRole('tab', { name: 'Activity', exact: true }),
  ).toHaveAttribute('aria-selected', 'true');
});
for (const width of [1180, 768, 390])
  test(`agent detail responsive tabs ${width}`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/agents/customer-service');
    for (const name of [
      'Overview',
      'Configuration',
      'Knowledge',
      'Tools',
      'Evaluations',
      'Versions',
      'Activity',
      'AgentOps',
    ]) {
      await page.getByRole('tab', { name, exact: true }).click();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      const result = await new AxeBuilder({ page })
        .include('.agentDetail')
        .analyze();
      expect(result.violations).toEqual([]);
    }
    await page.getByRole('tab', { name: 'Knowledge', exact: true }).click();
    await page.screenshot({
      path: testInfo.outputPath(`knowledge-${width}.png`),
      fullPage: true,
    });
  });
