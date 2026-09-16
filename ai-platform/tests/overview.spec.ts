import { test, expect } from '@playwright/test';
test('overview drill downs and all agents filters', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'View all →', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'All Agents' })).toBeVisible();
  await page.getByRole('button', { name: 'Degraded', exact: true }).click();
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await page
    .getByRole('link', { name: 'Sales Assistant', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Sales Assistant', exact: true }),
  ).toBeVisible();
});
