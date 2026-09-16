import { test, expect } from '@playwright/test';

test('MCP tab, source coverage and report export remain usable', async ({
  page,
}) => {
  await page.goto('/tools');
  await page.getByRole('button', { name: 'MCP Servers', exact: true }).click();
  await expect(
    page.getByText('Internal MCP Gateway', { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText('ITSM MCP Bridge', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Tools', exact: true }).click();
  await expect(
    page.getByRole('region', { name: 'Tool actions' }),
  ).toBeVisible();
  await page.goto('/knowledge');
  const coverage = page.getByRole('progressbar', {
    name: 'Confluence coverage',
    exact: true,
  });
  await expect(coverage).toHaveAttribute('value', '94');
  await expect(coverage.locator('..')).toContainText('94%');
  await page
    .getByRole('link', {
      name: 'Manage synchronization for Confluence',
      exact: true,
    })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Sync history' }),
  ).toBeVisible();
  await page.goto('/reports');
  const tasks = page.locator('[data-metric="Total Tasks"] strong');
  const seven = Number((await tasks.innerText()).replaceAll(',', ''));
  await page.getByRole('button', { name: 'Last 30 days', exact: true }).click();
  expect(Number((await tasks.innerText()).replaceAll(',', ''))).toBe(
    (seven / 7) * 30,
  );
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export CSV', exact: true }).click();
  expect((await download).suggestedFilename()).toBe(
    'newneo-performance-preview.csv',
  );
});

test('Playground suggestions and clearing preserve the selected agent', async ({
  page,
}) => {
  await page.goto('/playground');
  await page
    .getByRole('combobox', { name: 'Agent', exact: true })
    .selectOption('it-support');
  await page
    .getByRole('button', { name: 'VPN not working', exact: true })
    .click();
  await expect(page.getByRole('textbox', { name: 'Test message' })).toHaveValue(
    'VPN not working',
  );
  await page.getByRole('button', { name: 'Send test message' }).click();
  await expect(page.getByRole('log')).toContainText('VPN not working');
  await page.getByRole('button', { name: 'Clear', exact: true }).click();
  await expect(page.getByRole('log')).toContainText(
    'Send a message to start testing',
  );
  await expect(
    page.getByRole('combobox', { name: 'Agent', exact: true }),
  ).toHaveValue('it-support');
});
