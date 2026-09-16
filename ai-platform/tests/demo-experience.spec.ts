import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
async function controls(page: import('@playwright/test').Page) {
  await expect(page.locator('.demoControls > details')).toHaveCount(1);
  const summary = page.getByLabel(/Demo controls ·/);
  if (
    (await page.locator('.demoControls > details').getAttribute('open')) ===
    null
  )
    await summary.click();
}
async function role(page: import('@playwright/test').Page, name: string) {
  await controls(page);
  await page.getByLabel('Preview profile').selectOption(name);
  await page.getByLabel(/Demo controls ·/).click();
}

test('empty workspace, onboarding and sample restore are explicit and repeatable', async ({
  page,
}) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('unrelated-demo-test', 'preserve');
    localStorage.setItem(
      'newneo:launch:v1:acme-demo:customer-service-demo:it-support',
      'old draft',
    );
  });
  await controls(page);
  await page
    .getByRole('button', { name: 'Start empty workspace', exact: true })
    .click();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await page
    .getByRole('button', { name: 'Start empty workspace', exact: true })
    .click();
  await page.getByRole('button', { name: 'Confirm workspace reset' }).click();
  await page.getByLabel(/Demo controls ·/).click();
  await expect(
    page.getByRole('heading', { name: 'Welcome to your workspace' }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Create your first agent →' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss getting started' }).click();
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Welcome to your workspace' }),
  ).toHaveCount(0);
  await page.goto('/agents');
  await expect(
    page.getByRole('heading', { name: 'Create your first agent', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Customer Service Agent', exact: true }),
  ).toHaveCount(0);
  await page.getByLabel('Notifications', { exact: true }).click();
  await expect(page.locator('.notificationPopover')).toContainText(
    'All caught up',
  );
  await page.goto('/knowledge');
  await expect(page.getByRole('link', { name: /Confluence/ })).toHaveCount(0);
  await page.getByRole('button', { name: '+ Add Source' }).click();
  await expect(page.locator('.resourceCard')).toHaveCount(0);
  await page.goto('/reports');
  await expect(page.locator('main')).toContainText('No historical sample data');
  await page.reload();
  await expect(page.locator('main')).toContainText('No historical sample data');
  await controls(page);
  await page
    .getByRole('button', { name: 'Restore sample workspace', exact: true })
    .click();
  await page.getByRole('button', { name: 'Confirm workspace reset' }).click();
  await page.goto('/agents');
  await expect(
    page.getByRole('link', { name: 'Customer Service Agent', exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => localStorage.getItem('unrelated-demo-test')),
  ).toBe('preserve');
  expect(
    await page.evaluate(() =>
      localStorage.getItem(
        'newneo:launch:v1:acme-demo:customer-service-demo:it-support',
      ),
    ),
  ).toBeNull();
});

test('Creator, Approver and Operator expose different lifecycle actions', async ({
  page,
}) => {
  await page.goto('/agents/it-support');
  await role(page, 'Approver');
  await expect(
    page.getByRole('button', { name: 'Create New Version', exact: true }),
  ).toBeDisabled();
  await page.goto('/agents/launch?template=it-support');
  await expect(page.locator('main')).toContainText('cannot create');
  await role(page, 'Creator');
  await page.goto('/agents/it-support');
  await expect(
    page.getByRole('button', { name: 'Create New Version', exact: true }),
  ).toBeEnabled();
  await page.goto('/evaluations?agent=it-support&version=v1.9&edit=1');
  await page.getByRole('button', { name: 'Run evaluation preview' }).click();
  await page.getByRole('link', { name: 'Review for deployment' }).click();
  await page
    .getByRole('button', { name: 'Request promotion', exact: true })
    .click();
  await page.getByRole('button', { name: 'Request promotion preview' }).click();
  await page.getByRole('link', { name: 'Open approval queue' }).click();
  await page.getByRole('button', { name: 'Review approvals' }).click();
  await expect(page.getByLabel('Review note')).toBeDisabled();
  await role(page, 'Approver');
  await page.getByLabel('Review note').fill('Reviewed in Approver profile');
  await page
    .getByRole('button', { name: 'Approve preview', exact: true })
    .click();
  await page.goto('/deployments?edit=1');
  await expect(
    page.getByRole('button', { name: 'Pause preview', exact: true }),
  ).toBeDisabled();
  await role(page, 'Operator');
  await page
    .getByRole('button', { name: 'Pause preview', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Resume preview', exact: true }),
  ).toBeEnabled();
  await page.reload();
  await controls(page);
  await expect(page.getByLabel('Preview profile')).toHaveValue('Operator');
  await page.getByLabel(/Demo controls ·/).click();
  await page.goto('/settings');
  await expect(
    page.getByRole('button', { name: 'Edit profile' }),
  ).toBeDisabled();
  await role(page, 'Administrator');
  await expect(
    page.getByRole('button', { name: 'Edit profile' }),
  ).toBeEnabled();
});
for (const width of [1440, 390])
  test(`demo controls and onboarding remain accessible at ${width}`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await controls(page);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.getByRole('button', { name: 'Show getting started' }).click();
    await page.getByLabel(/Demo controls ·/).click();
    await expect(
      page.getByRole('heading', { name: 'Welcome to your workspace' }),
    ).toBeVisible();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    await page.screenshot({
      path: info.outputPath('getting-started.png'),
      fullPage: true,
    });
  });
