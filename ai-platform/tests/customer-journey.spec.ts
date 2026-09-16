import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
async function next(page: import('@playwright/test').Page) {
  await page
    .locator('.wizardActions')
    .getByRole('button', {
      name: /Continue to/,
    })
    .click();
}
test('launch creates a persistent workspace agent, release and monitoring record', async ({
  page,
}) => {
  await page.goto('/agents/launch?template=it-support');
  await page.getByLabel('Agent name', { exact: true }).fill('IT Journey Demo');
  await page.getByLabel('Business owner').fill('IT Operations');
  await page.getByLabel('Success metric').fill('70% autonomous');
  await next(page);
  await page
    .getByRole('button', { name: /Confluence Approved organization source/ })
    .click();
  await next(page);
  await page.getByRole('switch', { name: /Search Incident/ }).check();
  await next(page);
  await next(page);
  await next(page);
  await next(page);
  await page
    .getByRole('button', { name: 'Apply recommended fixes and rerun preview' })
    .click();
  await expect(
    page.getByRole('meter', { name: 'Evaluation score' }),
  ).toHaveAttribute('aria-valuenow', '96');
  await next(page);
  await page
    .getByRole('radio', { name: /Production Live for end users/ })
    .check();
  await page
    .getByRole('checkbox', {
      name: 'I reviewed the manifest and approve this production preview',
    })
    .check();
  await page
    .getByRole('button', { name: 'Deploy to Production', exact: true })
    .click();
  const href = await page
    .getByRole('link', { name: 'Open saved agent', exact: true })
    .getAttribute('href');
  await page
    .getByRole('link', { name: 'Open saved agent', exact: true })
    .click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'IT Journey Demo',
  );
  await page
    .getByRole('button', { name: 'Run sample task', exact: true })
    .click();
  await expect(page.getByRole('status')).toContainText('no external system');
  await page.screenshot({
    path: test.info().outputPath('created-agent-monitoring.png'),
    fullPage: true,
  });
  expect(
    (await new AxeBuilder({ page }).include('main').analyze()).violations,
  ).toEqual([]);
  await page.reload();
  await expect(
    page.getByRole('region', { name: 'Recent agent tasks' }),
  ).toContainText('Sample task completed');
  await page.getByRole('tab', { name: 'Knowledge', exact: true }).click();
  await expect(
    page.getByRole('region', { name: 'Agent knowledge' }),
  ).toContainText('Confluence');
  await page.getByRole('tab', { name: 'Tools', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Agent tools' })).toContainText(
    'Search Incident',
  );
  await page.goto('/agents');
  await page
    .getByRole('link', { name: 'IT Journey Demo', exact: true })
    .click();
  await expect(page).toHaveURL(new RegExp(href!));
  await page.goto('/agentops');
  await page.getByRole('tab', { name: 'Health', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'IT Journey Demo', exact: true }),
  ).toBeVisible();
  await page.goto('/deployments');
  await expect(
    page.locator('tbody tr').filter({ hasText: 'IT Journey Demo' }),
  ).toContainText('Active');
  // Disconnect an assigned source using the same session state as the source manager.
  await page.evaluate(() => {
    const key = 'newneo:customer-journeys:v1';
    const state = JSON.parse(sessionStorage.getItem(key)!);
    state.ui['resources:knowledge'] = [
      {
        id: 'confluence',
        name: 'Confluence',
        category: 'Wiki',
        provider: 'Confluence',
        connected: false,
        sync: 'Not synchronized',
      },
    ];
    sessionStorage.setItem(key, JSON.stringify(state));
  });
  await page.goto(href!);
  await page.reload();
  await page.getByRole('tab', { name: 'Evaluations', exact: true }).click();
  await page.getByRole('link', { name: 'Run evaluation', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Knowledge source unavailable' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Run evaluation preview' }).click();
  await expect(
    page.getByRole('link', { name: 'Review for deployment' }),
  ).toHaveCount(0);
  await page
    .getByRole('link', { name: 'Reconnect and synchronize sources →' })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Knowledge', exact: true }),
  ).toBeVisible();
});

test('failed evaluation, rejected approval and failed deployment have recovery paths', async ({
  page,
}) => {
  await page.goto('/evaluations?agent=it-support&version=v1.9&edit=1');
  await page.getByLabel('Evaluation scenario').selectOption('fail');
  await page.getByRole('button', { name: 'Run evaluation preview' }).click();
  await expect(
    page.getByRole('link', { name: 'Review for deployment' }),
  ).toHaveCount(0);
  await page.getByLabel('Evaluation scenario').selectOption('pass');
  await page.getByRole('button', { name: 'Run evaluation preview' }).click();
  await page.getByRole('link', { name: 'Review for deployment' }).click();
  await page
    .getByRole('button', { name: 'Request promotion', exact: true })
    .click();
  await page.getByRole('button', { name: 'Request promotion preview' }).click();
  await page.getByRole('link', { name: 'Open approval queue' }).click();
  await page.getByRole('button', { name: 'Review approvals' }).click();
  await page.getByLabel('Review note').fill('Revise the operating procedure');
  await page
    .getByRole('button', { name: 'Reject preview', exact: true })
    .click();
  await page.goto('/deployments?agent=it-support&edit=1');
  await expect(page.locator('main')).toContainText(
    'Revise the operating procedure',
  );
  await page.getByLabel('Deployment simulation').selectOption('failure');
  await page.getByRole('button', { name: 'Request promotion preview' }).click();
  await page.getByRole('link', { name: 'Open approval queue' }).click();
  await page.getByRole('button', { name: 'Review approvals' }).click();
  await page.getByLabel('Review note').fill('Approved for test');
  await page
    .getByRole('button', { name: 'Approve preview', exact: true })
    .click();
  await expect(page.getByRole('status')).toContainText('health check failed');
  await page.goto('/deployments?agent=it-support&edit=1');
  await expect(page.locator('main')).toContainText('Traffic was not switched');
  await page.getByLabel('Deployment simulation').selectOption('success');
  await page.getByRole('button', { name: 'Request promotion preview' }).click();
  await page.getByRole('link', { name: 'Open approval queue' }).click();
  await page.getByRole('button', { name: 'Review approvals' }).click();
  await page.getByLabel('Review note').fill('Health check fixed');
  await page
    .getByRole('button', { name: 'Approve preview', exact: true })
    .click();
  await expect(page.getByRole('status')).toContainText('release is active');
  await page.goto('/agents/it-support');
  await expect(page.locator('main')).toContainText('Version v1.8');
});

test('budget overrun is visible and can be corrected without applying a real limit', async ({
  page,
}) => {
  await page.goto('/finops');
  await page
    .getByRole('button', { name: 'Budget planning', exact: true })
    .click();
  await page.getByLabel('Saved budget (USD)').fill('100');
  await page.getByRole('button', { name: 'Save budget preview' }).click();
  await expect(
    page.getByRole('heading', { name: 'Workspace budget exceeded' }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Review budget and recommendations' })
    .click();
  await page.getByLabel('Saved budget (USD)').fill('3000');
  await page.getByRole('button', { name: 'Save budget preview' }).click();
  await expect(
    page.getByRole('heading', { name: 'Workspace budget exceeded' }),
  ).toHaveCount(0);
});
