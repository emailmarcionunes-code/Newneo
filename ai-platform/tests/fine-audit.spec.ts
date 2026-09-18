import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('agent draft survives reload and carries its identity into evaluation', async ({
  page,
}) => {
  await page.goto('/agents/it-support');
  await page
    .getByRole('button', { name: 'Create New Version', exact: true })
    .click();
  await page
    .getByLabel('Business mission')
    .fill('Resolve approved IT requests with evidence');
  await page.getByRole('button', { name: 'Save draft version' }).click();
  await page.reload();
  await expect(page.getByLabel('Business mission')).toHaveValue(
    'Resolve approved IT requests with evidence',
  );
  await page
    .getByRole('link', { name: 'Review evaluation requirements' })
    .click();
  await expect(page).toHaveURL(/agent=it-support/);
  await expect(page.getByLabel('Candidate version')).toHaveValue('v1.9');
  await page.getByRole('button', { name: 'Run evaluation preview' }).click();
  await page.getByRole('link', { name: 'Review for deployment' }).click();
  await page
    .getByRole('button', { name: 'Request promotion', exact: true })
    .click();
  await expect(page.locator('main')).toContainText('IT Support Agent');
  await page.getByRole('button', { name: 'Request promotion preview' }).click();
  await page.goto('/agents/it-support');
  await page.getByRole('tab', { name: 'Configuration', exact: true }).click();
  await page
    .getByLabel('Business mission')
    .fill('A changed configuration needs another evaluation');
  await page.getByRole('button', { name: 'Save draft version' }).click();
  await page.goto('/governance');
  await page.getByRole('button', { name: 'Review approvals' }).click();
  await page.getByLabel('Review note').fill('Check configuration freshness');
  await page
    .getByRole('button', { name: 'Approve preview', exact: true })
    .click();
  await expect(page.getByRole('status')).toContainText('Run a new evaluation');
});

test('incident resolution and deployment rollback stay consistent with lists', async ({
  page,
}) => {
  await page.goto('/agentops/incidents/inc-001');
  await page.getByRole('button', { name: 'Resolve', exact: true }).click();
  await page.goto('/agentops');
  await page.getByRole('tab', { name: 'Incidents', exact: true }).click();
  await page.getByLabel('Incident status').selectOption('Resolved');
  await expect(page.locator('tbody')).toContainText('INC-001');
  await page.goto('/deployments/it-support?release=DEP-198');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('v1.8');
  page.once('dialog', (d) => d.accept());
  await page.getByRole('button', { name: 'Rollback', exact: true }).click();
  await page.goto('/deployments');
  await expect(
    page.locator('tbody tr').filter({ hasText: 'IT Support Agent' }),
  ).toContainText('Rolled back');
});

test('evaluation records differ and unavailable sources have no indexed documents', async ({
  page,
}) => {
  await page.goto('/evaluations/it-support?run=EV-204');
  const latest = await page.locator('.evaluationScore strong').innerText();
  await page.goto('/evaluations/it-support?run=EV-198');
  await expect(page.locator('.evaluationScore strong')).not.toHaveText(latest);
  await expect(page.locator('main')).toContainText('EV-198');
  await page.goto('/knowledge/google-drive');
  await page.getByRole('tab', { name: 'Documents', exact: true }).click();
  await expect(page.locator('main')).toContainText(
    'Restore access and synchronize',
  );
});

test('settings and report schedules persist and cancellation preserves saved schedule', async ({
  page,
}) => {
  await page.goto('/settings');
  await page.getByRole('tab', { name: 'Notifications', exact: true }).click();
  await page
    .getByRole('switch', { name: 'Knowledge sync', exact: true })
    .check();
  await page.getByRole('button', { name: 'Save preferences' }).click();
  await page.reload();
  await expect(
    page.getByRole('switch', { name: 'Knowledge sync', exact: true }),
  ).toBeChecked();
  await page.goto('/reports?schedule=1');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByLabel('Recipient email').fill('reports@example.com');
  await page.getByRole('button', { name: 'Save report schedule' }).click();
  await page.reload();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(page.locator('.reportSchedule')).toContainText(
    'reports@example.com',
  );
  await page.getByRole('button', { name: 'Edit schedule' }).click();
  await page.getByLabel('Recipient email').fill('cancel@example.com');
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(page.locator('.reportSchedule')).not.toContainText(
    'cancel@example.com',
  );
});

test('friendly authentication failure, branded missing page and official favicon', async ({
  page,
  request,
}) => {
  await page.goto('/api/auth/login');
  await expect(page).toHaveURL(/login\?reason=unavailable/);
  await expect(page.getByRole('status')).toContainText(
    'not available in this preview',
  );
  await page.goto('/does-not-exist');
  await expect(page.locator('main')).toContainText('404');
  const icon = await request.get('/icon.svg');
  expect(await icon.text()).toContain('viewBox="252 304 296 296"');
});

for (const width of [1343, 390])
  test(`operational subt screens reflow and accessibility ${width}`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height: 900 });
    for (const path of [
      '/models',
      '/evaluations?agent=it-support&version=v1.9&edit=1',
      '/reports',
    ]) {
      await page.goto(path);
      await expect(page.locator('main h1')).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      expect(
        (await new AxeBuilder({ page }).include('main').analyze()).violations,
      ).toEqual([]);
      await page.screenshot({
        path: info.outputPath(path.split('?')[0].slice(1) + '.png'),
        fullPage: true,
      });
    }
  });

test('evaluated IT draft promotes through review to Production without changing another agent', async ({
  page,
}) => {
  await page.goto('/agents/it-support');
  await page
    .getByRole('button', { name: 'Create New Version', exact: true })
    .click();
  await page
    .getByLabel('Business mission')
    .fill('IT service mission approved for this release');
  await page.getByRole('button', { name: 'Save draft version' }).click();
  await page
    .getByRole('link', { name: 'Review evaluation requirements' })
    .click();
  await page.getByRole('button', { name: 'Run evaluation preview' }).click();
  await page.getByRole('link', { name: 'Review for deployment' }).click();
  for (const environment of ['Test', 'Production']) {
    await page
      .getByRole('button', { name: 'Request promotion', exact: true })
      .click();
    await page.getByLabel('Target environment').selectOption(environment);
    await page
      .getByRole('button', { name: 'Request promotion preview' })
      .click();
    await page.getByRole('link', { name: 'Open approval queue' }).click();
    await page.getByRole('button', { name: 'Review approvals' }).click();
    await page
      .getByLabel('Review note')
      .fill('Verified IT release in ' + environment);
    await page
      .getByRole('button', { name: 'Approve preview', exact: true })
      .click();
    await expect(page.getByRole('status')).toContainText('release is active');
    await page.goto('/deployments?agent=it-support');
  }
  await page.goto('/agents/it-support');
  await expect(page.locator('main')).toContainText('Version v1.9');
  await page.getByRole('tab', { name: 'Versions', exact: true }).click();
  await page.getByRole('link', { name: 'View deployment →' }).click();
  await expect(page).toHaveURL(/release=/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('v1.9');
  await page.goto('/agents/it-support');
  await expect(
    page.getByRole('button', { name: 'Create New Version', exact: true }),
  ).toBeEnabled();
  await page
    .getByRole('button', { name: 'Create New Version', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Draft version v1.10', exact: true }),
  ).toBeVisible();
  await page.goto('/agents/customer-service');
  await expect(page.locator('main')).toContainText('Version v2.4');
});
