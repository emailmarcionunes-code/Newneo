import { test, expect } from '@playwright/test';
test('evaluation approval and deployment editors remain connected', async ({
  page,
}) => {
  await page.goto('/evaluations');
  await page
    .getByRole('button', { name: 'Run evaluation', exact: true })
    .click();
  await page.getByRole('button', { name: 'Run evaluation preview' }).click();
  await page.getByRole('link', { name: 'Review for deployment' }).click();
  await page
    .getByRole('button', { name: 'Request promotion', exact: true })
    .click();
  await page.getByRole('button', { name: 'Request promotion preview' }).click();
  await page.getByRole('link', { name: 'Open approval queue' }).click();
  await page.getByRole('button', { name: 'Review approvals' }).click();
  await page.getByLabel('Review note').fill('Passed sample regression');
  await page
    .getByRole('button', { name: 'Approve preview', exact: true })
    .click();
  await page.goto('/deployments');
  await page
    .getByRole('button', { name: 'Request promotion', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Pause preview', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Resume preview' }),
  ).toBeVisible();
});
test('playground conversations, audit filtering and CSV export', async ({
  page,
}) => {
  await page.goto('/playground');
  await page
    .getByRole('textbox', { name: 'Test message' })
    .fill('Find the current support policy');
  await page.getByRole('button', { name: 'Send test message' }).click();
  await expect(page.getByRole('log')).toContainText(
    'No real tool or model was called',
  );
  await page.goto('/audit-log');
  await page.getByLabel('Search audit events').fill('policy.edit');
  await expect(page.locator('tbody tr')).toHaveCount(1);
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export CSV' }).click();
  expect((await download).suggestedFilename()).toBe('newneo-audit-preview.csv');
});
