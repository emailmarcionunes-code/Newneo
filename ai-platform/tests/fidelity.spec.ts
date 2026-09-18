import { test, expect } from '@playwright/test';

test('Overview matches the supplied Command Center composition', async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const metrics = page.locator('.overviewReferenceMetrics article');
  await expect(metrics).toHaveCount(6);
  const first = await metrics.first().boundingBox();
  const last = await metrics.last().boundingBox();
  const content = await page.locator('main').boundingBox();
  await expect(
    page.getByRole('heading', { name: 'Command Center' }),
  ).toBeVisible();
  expect(first!.y).toBeGreaterThan(140);
  expect(first!.y).toBeLessThan(170);
  expect(first!.x - content!.x).toBe(24);
  expect(last!.y).toBe(first!.y);
  expect(first!.height).toBeLessThanOrEqual(112);
  const health = await page.locator('.overviewHealthPanel').boundingBox();
  const activity = await page.locator('.overviewActivityPanel').boundingBox();
  expect(health!.y).toBe(activity!.y);
  expect(health!.width / activity!.width).toBeCloseTo(2.05, 1);
  await expect(page.locator('.overviewAgentList li')).toHaveCount(5);
  await expect(page.locator('.overviewActivityPanel li')).toHaveCount(6);
  await expect(page.locator('.overviewSummaryPanels > section')).toHaveCount(3);
  await expect(metrics.first()).toContainText('4');
  await page.getByRole('button', { name: 'Refresh', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Preview refreshed');
  await page.screenshot({
    path: info.outputPath('overview-design.png'),
    fullPage: true,
  });
});

test('supporting frames retain recent tasks and environment summaries', async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 1180, height: 740 });
  await page.goto('/agents/customer-service');
  await expect(
    page.getByRole('heading', { name: 'Recent tasks', exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('tab')).toHaveCount(9);
  await page.screenshot({
    path: info.outputPath('agent-detail.png'),
    fullPage: true,
  });
  await page.goto('/deployments');
  const environments = page.locator('.environmentSummaryGrid article');
  await expect(environments).toHaveCount(3);
  const first = await environments.first().boundingBox();
  const last = await environments.last().boundingBox();
  expect(first!.y).toBe(last!.y);
  await page.screenshot({
    path: info.outputPath('deployments.png'),
    fullPage: true,
  });
  await page.goto('/settings');
  await expect(page.getByRole('tab')).toHaveCount(6);
  await expect(page.locator('.organizationFacts > div')).toHaveCount(6);
  await page.screenshot({
    path: info.outputPath('settings.png'),
    fullPage: true,
  });
});

test('settings summaries share preferences and edited profile values', async ({
  page,
}) => {
  await page.goto('/settings');
  await page
    .getByRole('switch', { name: 'Governance alerts', exact: true })
    .uncheck();
  await page.getByRole('tab', { name: 'Notifications', exact: true }).click();
  await expect(
    page.getByRole('switch', { name: 'Governance', exact: true }),
  ).not.toBeChecked();
  await expect(
    page.getByRole('switch', { name: 'Deployments', exact: true }),
  ).toBeChecked();
  await page.getByRole('tab', { name: 'Organization', exact: true }).click();
  await page.getByRole('button', { name: 'Edit profile' }).click();
  await page
    .getByLabel('Billing email', { exact: true })
    .fill('finance@acme.example');
  await page.getByRole('button', { name: 'Save profile' }).click();
  await page.getByRole('button', { name: 'Close editor' }).click();
  await expect(page.locator('.organizationFacts')).toContainText(
    'finance@acme.example',
  );
  await page.getByRole('tab', { name: 'Getting Started', exact: true }).click();
  await expect(
    page.getByRole('progressbar', { name: 'Onboarding progress' }),
  ).toHaveAttribute('max', '12');
  await page
    .getByRole('button', { name: 'Invite members', exact: true })
    .click();
  await expect(page.getByLabel('Work email', { exact: true })).toBeVisible();
  await page
    .getByRole('button', { name: 'Roles & permissions', exact: true })
    .click();
  await expect(
    page.getByRole('region', { name: 'Roles and permissions', exact: true }),
  ).toContainText('Read only');
});
