import { test, expect } from '@playwright/test';
test('agent detail opens source, tool, evaluation and deployment details', async ({
  page,
}) => {
  await page.goto('/agents/customer-service');
  await page.getByRole('tab', { name: 'Knowledge', exact: true }).click();
  await page.getByRole('link', { name: 'Confluence →' }).click();
  await expect(
    page.getByRole('heading', { name: 'Confluence', exact: true }),
  ).toBeVisible();
  await page.getByRole('tab', { name: 'Sync', exact: true }).click();
  await page.getByRole('button', { name: 'Run sync preview' }).click();
  await expect(page.getByRole('status')).toContainText(
    'synchronization completed',
  );
  await page.goto('/tools/servicenow');
  await page.getByRole('button', { name: 'Test tool' }).click();
  await expect(page.getByRole('status')).toContainText('no external action');
  await page.goto('/deployments/customer-service');
  await page.getByRole('button', { name: 'Rollback', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Rollback', exact: true }),
  ).toBeDisabled();
  await page.goto('/agentops/incidents/inc-001');
  await page.getByRole('button', { name: 'Resolve', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Resolved', exact: true }),
  ).toBeDisabled();
});
