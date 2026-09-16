import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('header search and five notification categories navigate to real details', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByLabel('Search workspace').fill('Confluence');
  await page
    .locator('#global-search-results')
    .getByRole('link', { name: /Confluence/ })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Confluence', exact: true }),
  ).toBeVisible();
  await page.getByLabel('Notifications', { exact: true }).click();
  for (const category of [
    'Incident',
    'Deployment',
    'Evaluation',
    'Governance',
    'Knowledge sync',
  ])
    await expect(
      page
        .locator('.notificationPopover .categoryBadge')
        .getByText(category, { exact: true }),
    ).toBeVisible();
  await page
    .getByRole('button', { name: 'Mark all notifications as read' })
    .click();
  await expect(page.locator('.notificationPopover')).toContainText(
    'All caught up',
  );
  expect(
    (await new AxeBuilder({ page }).include('.topbar').analyze()).violations,
  ).toEqual([]);
});
test('catalog proves scale and every category has multiple working templates', async ({
  page,
}) => {
  await page.goto('/agents/catalog');
  await expect(page.locator('.agentCard')).toHaveCount(20);
  for (const name of [
    'HR',
    'Finance',
    'Marketing',
    'IT',
    'Operations',
    'Sales',
    'Customer Service',
  ]) {
    await page.getByRole('button', { name, exact: true }).click();
    expect(await page.locator('.agentCard').count()).toBeGreaterThanOrEqual(2);
  }
  await page.getByLabel('Search agent templates').fill('nothing-matches');
  await expect(
    page.getByRole('heading', { name: 'No agents in this category' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Show all agents' }).click();
  await page
    .getByRole('link', { name: 'Get started with Employee Onboarding Agent' })
    .click();
  await expect(page.getByLabel('Agent name', { exact: true })).toHaveValue(
    'Employee Onboarding Agent',
  );
});
test('agent versions isolate changes from Production and all eight tabs have content', async ({
  page,
}, info) => {
  await page.goto('/agents/it-support');
  await expect(page.getByRole('tab')).toHaveCount(8);
  await page.getByRole('tab', { name: 'Configuration', exact: true }).click();
  await expect(page.getByLabel('Business mission')).toBeDisabled();
  await page
    .getByRole('button', { name: 'Create New Version', exact: true })
    .click();
  await page
    .getByLabel('Business mission')
    .fill('Resolve approved IT incidents');
  await page.getByRole('button', { name: 'Save draft version' }).click();
  await page.getByRole('tab', { name: 'Versions', exact: true }).click();
  await expect(
    page.getByRole('region', { name: 'Agent versions' }),
  ).toContainText('v1.9');
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
    await expect(page.getByRole('tabpanel')).not.toBeEmpty();
    await page.screenshot({
      path: info.outputPath(`agent-${name}.png`),
      fullPage: true,
    });
    expect(
      (await new AxeBuilder({ page }).include('main').analyze()).violations,
    ).toEqual([]);
  }
});
test('all Settings tabs support demo interactions without external effects', async ({
  page,
}, info) => {
  await page.goto('/settings');
  for (const name of [
    'Organization',
    'Team & Roles',
    'API & Webhooks',
    'Integrations',
    'Notifications',
    'Getting Started',
  ]) {
    await page.getByRole('tab', { name, exact: true }).click();
    await page.screenshot({
      path: info.outputPath(`settings-${name.replaceAll(' ', '-')}.png`),
      fullPage: true,
    });
    expect(
      (await new AxeBuilder({ page }).include('main').analyze()).violations,
    ).toEqual([]);
  }
  await page.getByRole('tab', { name: 'API & Webhooks', exact: true }).click();
  await page
    .getByRole('button', { name: '+ New API key', exact: true })
    .click();
  await page.getByLabel('Key name', { exact: true }).fill('Audit test');
  await page.getByRole('button', { name: 'Create key preview' }).click();
  await expect(page.getByRole('region', { name: 'API keys' })).toContainText(
    'Audit test',
  );
  await page.getByRole('button', { name: 'Webhooks', exact: true }).click();
  await page.getByLabel('HTTPS endpoint').fill('https://example.com/events');
  await page.getByRole('button', { name: 'Add webhook preview' }).click();
  await expect(page.getByRole('status')).toContainText('No request was sent');
  await page.getByRole('tab', { name: 'Notifications', exact: true }).click();
  await page.getByRole('switch', { name: 'Knowledge sync' }).check();
  await page.getByRole('button', { name: 'Save preferences' }).click();
  await expect(page.getByRole('status')).toContainText(
    'no notifications are sent',
  );
});
test('empty operational states and login entry remain navigable', async ({
  page,
}) => {
  await page.goto('/login');
  await page.getByRole('link', { name: 'Explore preview →' }).click();
  await page.getByRole('link', { name: 'Agents', exact: true }).click();
  await page
    .getByRole('link', { name: 'Customer Service Agent', exact: true })
    .click();
  await page.getByRole('tab', { name: 'AgentOps', exact: true }).click();
  await page.getByRole('link', { name: 'Open AgentOps', exact: true }).click();
  await page.getByRole('tab', { name: 'Incidents', exact: true }).click();
  await page.getByLabel('Incident status').selectOption('Resolved');
  await expect(page.getByText(/No incidents match/)).toBeVisible();
  await page.goto('/deployments');
  await page.getByRole('button', { name: 'Development', exact: true }).click();
  await expect(
    page.getByText(/No deployments in this environment/),
  ).toBeVisible();
});
