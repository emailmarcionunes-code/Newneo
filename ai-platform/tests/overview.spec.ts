import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('Overview demo, drill-down and empty-state navigation', async ({
  page,
}) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Overview', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText('Illustrative data only.', { exact: false }),
  ).toBeVisible();
  await page.getByText('Quality', { exact: true }).click();
  await expect(
    page.getByText('One agent has evaluation cases requiring review.'),
  ).toBeVisible();
  await page.getByText('Recommended action', { exact: true }).first().click();
  await expect(
    page.getByText('Review the failed cases before promoting a new version.'),
  ).toBeVisible();
  await page.getByRole('button', { name: 'No agents', exact: true }).click();
  await expect(
    page.getByRole('heading', {
      name: 'Launch your first enterprise AI use case.',
    }),
  ).toBeVisible();
  await expect(page.getByRole('region', { name: 'Key metrics' })).toHaveCount(
    0,
  );
  await page
    .getByRole('link', { name: 'Browse Agent Catalog', exact: true })
    .click();
  await expect(page).toHaveURL(/\/agents$/);
});
for (const width of [1180, 768, 390]) {
  test(`Overview layout at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.locator('.overviewMetric')).toHaveCount(8);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const cards = await page
      .locator('.overviewMetric')
      .evaluateAll((elements) =>
        elements.map((e) => e.getBoundingClientRect().height),
      );
    expect(cards.every((height) => height >= 220)).toBe(true);
    const results = await new AxeBuilder({ page }).include('.overview').analyze();
    expect(results.violations).toEqual([]);
    await page.screenshot({
      path: testInfo.outputPath(`overview-${width}.png`),
      fullPage: true,
    });
  });
}
