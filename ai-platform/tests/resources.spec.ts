import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
async function add(page: import('@playwright/test').Page, tool = false) {
  await page.goto(tool ? '/tools' : '/knowledge');
  await page
    .getByRole('button', {
      name: tool ? 'Add Tool' : 'Connect Source',
      exact: false,
    })
    .click();
  await page
    .getByRole('button', {
      name: tool ? '+ Add connector' : '+ Add source',
      exact: true,
    })
    .click();
  await page
    .getByRole('radio', {
      name: tool ? 'ServiceNow' : 'SharePoint',
      exact: true,
    })
    .check();
  await page.getByRole('button', { name: 'Continue →', exact: true }).click();
  await page
    .getByLabel(tool ? 'Connector name' : 'Source name', { exact: true })
    .fill(tool ? 'Support tickets' : 'Support policies');
  await page.getByRole('button', { name: 'Continue →', exact: true }).click();
  if (tool)
    await page
      .getByRole('checkbox', { name: 'Search Incident · Read', exact: true })
      .check();
  await page.getByRole('button', { name: 'Continue →', exact: true }).click();
  await page.getByRole('button', { name: 'Save preview', exact: true }).click();
  await expect(
    page.getByRole('heading', {
      name: tool ? 'Support tickets' : 'Support policies',
      exact: true,
    }),
  ).toBeVisible();
}
test('source creation, sync failure/retry, content, editing and reload persistence', async ({
  page,
}) => {
  await add(page);
  await page.getByRole('tab', { name: 'Sync history', exact: true }).click();
  await page.getByLabel('Preview outcome').selectOption('failure');
  await page.getByRole('button', { name: 'Run sync preview' }).click();
  await expect(page.getByRole('status')).toContainText('authorization expired');
  await page.getByLabel('Preview outcome').selectOption('success');
  await page.getByRole('button', { name: 'Run sync preview' }).click();
  await expect(page.getByRole('status')).toContainText(
    'completed successfully',
  );
  await page.getByRole('tab', { name: 'Content', exact: true }).click();
  await expect(
    page.getByText('Support handbook', { exact: true }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Edit configuration', exact: true })
    .click();
  await page
    .getByLabel('Source name', { exact: true })
    .fill('Updated policies');
  await page.getByRole('button', { name: 'Continue →', exact: true }).click();
  await page.getByRole('button', { name: 'Continue →', exact: true }).click();
  await page.getByRole('button', { name: 'Save preview', exact: true }).click();
  await page.reload();
  await page.getByRole('button', { name: /Connect Source|Add Tool/ }).click();
  await expect(
    page.getByRole('heading', { name: 'Updated policies', exact: true }),
  ).toBeVisible();
  await expect(page.locator('.resourceConnected')).toContainText(
    'Updated policies',
  );
});
test('connector creation and action-level selection remain local', async ({
  page,
}) => {
  await add(page, true);
  await page.getByRole('tab', { name: 'Actions', exact: true }).click();
  const search = page.getByRole('article').filter({
    has: page.getByRole('heading', { name: 'Search Incident', exact: true }),
  });
  await expect(search.getByRole('checkbox')).toBeChecked();
  await search.getByRole('checkbox').uncheck();
  await page.getByRole('tab', { name: 'Permissions', exact: true }).click();
  await expect(
    page.getByRole('checkbox', {
      name: 'Require human approval for selected actions',
    }),
  ).toBeChecked();
  await page.getByRole('tab', { name: 'Health', exact: true }).click();
  await page.getByRole('button', { name: 'Test connection preview' }).click();
  await expect(page.getByRole('status')).toContainText(
    'No external system was contacted',
  );
});
for (const width of [1180, 768, 390])
  test(`resource dialogs and details at ${width}`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    for (const tool of [false, true]) {
      await add(page, tool);
      for (const name of tool
        ? [
            'Overview',
            'Connection',
            'Actions',
            'Permissions',
            'Health',
            'Usage',
          ]
        : [
            'Overview',
            'Connection',
            'Content',
            'Sync history',
            'Permissions',
            'Quality',
            'Usage',
          ]) {
        await page.getByRole('tab', { name, exact: true }).click();
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
        expect(
          (
            await new AxeBuilder({ page })
              .include('.resourceExperience')
              .analyze()
          ).violations,
        ).toEqual([]);
      }
      await page
        .getByRole('button', { name: 'Edit configuration', exact: true })
        .click();
      expect(
        (await new AxeBuilder({ page }).include('.resourceDialog').analyze())
          .violations,
      ).toEqual([]);
      await page.screenshot({
        path: testInfo.outputPath(
          `${tool ? 'tools' : 'knowledge'}-${width}.png`,
        ),
        fullPage: true,
      });
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog')).not.toBeVisible();
    }
  });

test('preview storage errors recover and disconnect preserves configuration', async ({
  page,
}) => {
  await page.addInitScript(() =>
    sessionStorage.setItem(
      'newneo:resource-preview:v1:knowledge',
      JSON.stringify([{ id: 'broken', name: 'Invalid' }]),
    ),
  );
  await page.goto('/knowledge');
  await page
    .getByRole('button', { name: 'Connect Source', exact: false })
    .click();
  await expect(
    page.getByText('Saved preview unavailable.', { exact: false }),
  ).toBeVisible();
  await expect(page.locator('.surfaceCards .agentCard')).toHaveCount(8);
  await add(page, true);
  await page.getByRole('tab', { name: 'Connection', exact: true }).click();
  await page
    .getByRole('button', { name: 'Disconnect preview', exact: true })
    .click();
  await expect(page.getByRole('status')).toContainText(
    'configuration is retained',
  );
  await page.getByRole('tab', { name: 'Health', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Test connection preview' }),
  ).toBeDisabled();
});
