import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('evaluation, approval, release lifecycle persists across navigation', async ({
  page,
}) => {
  await page.goto('/evaluations');
  await page.getByLabel('Evaluation scenario').selectOption('fail');
  await page.getByRole('button', { name: 'Run evaluation preview' }).click();
  await expect(
    page.getByText('Promotion is blocked for this failed run.'),
  ).toBeVisible();
  await page.goto('/deployments');
  await expect(
    page.getByText('No passed evaluations available.', { exact: false }),
  ).toBeVisible();
  await page.goto('/evaluations');
  await page.getByRole('button', { name: 'Run evaluation preview' }).click();
  await page.getByRole('link', { name: 'Review for deployment' }).click();
  await page.getByRole('button', { name: 'Request promotion preview' }).click();
  await page.getByRole('link', { name: 'Open approval queue' }).click();
  await page.getByLabel('Review note').fill('Passed the sample regression');
  await page
    .getByRole('button', { name: 'Approve preview', exact: true })
    .click();
  await page.goto('/deployments');
  await page
    .getByRole('button', { name: 'Pause preview', exact: true })
    .click();
  await page.reload();
  await page.getByRole('button', { name: 'Resume preview' }).click();
  await page.getByLabel('Target environment').selectOption('Production');
  await expect(
    page.getByRole('button', { name: 'Request promotion preview' }),
  ).toBeEnabled();
  await page
    .getByRole('button', { name: 'Roll back to baseline preview' })
    .click();
  await expect(
    page.getByRole('button', { name: 'Request promotion preview' }),
  ).toBeDisabled();
});
test('model configuration, governance and operations controls', async ({
  page,
}, info) => {
  await page.goto('/models');
  await page.getByRole('button', { name: 'Add endpoint' }).click();
  await page.getByLabel('Model name').fill('Sample endpoint');
  await page.getByLabel('Provider', { exact: true }).fill('Example provider');
  await page.getByLabel('Region', { exact: true }).fill('US East');
  await page.getByRole('button', { name: 'Review →', exact: true }).click();
  await expect(
    new AxeBuilder({ page })
      .include('.journeyDialog')
      .analyze()
      .then((r) => r.violations),
  ).resolves.toEqual([]);
  await page.getByRole('button', { name: 'Save endpoint preview' }).click();
  await page.getByRole('button', { name: 'Test connection preview' }).click();
  await expect(page.getByRole('status')).toContainText('succeeded');
  await page.goto('/governance');
  await page.getByRole('tab', { name: 'Users & roles' }).click();
  await page.getByRole('button', { name: 'Invite user preview' }).click();
  await page.getByLabel('Email', { exact: true }).fill('demo@example.com');
  await page.getByRole('button', { name: 'Simulate invitation' }).click();
  await expect(
    page.getByText('Invitation simulated', { exact: true }),
  ).toBeVisible();
  await page.goto('/agentops');
  await page.getByRole('button', { name: 'Inspect task trace' }).click();
  await expect(page.getByRole('dialog')).toContainText('Quality check failed');
  await page.getByRole('button', { name: 'Close dialog' }).click();
  await page
    .getByRole('button', { name: 'Investigate Customer Service Agent' })
    .click();
  await page.getByLabel('Investigation status').selectOption('Investigating');
  await page.getByRole('button', { name: 'Close dialog' }).click();
  await page.goto('/finops');
  await page.getByLabel('Saved budget (USD)').fill('500');
  await page.getByRole('button', { name: 'Save budget preview' }).click();
  await page.reload();
  await expect(page.getByLabel('Saved budget (USD)')).toHaveValue('500');
  await page.screenshot({
    path: info.outputPath('finops-complete.png'),
    fullPage: true,
  });
});
