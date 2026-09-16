import { test, expect } from '@playwright/test';
test('agent row opens details from any cell and retains keyboard name link', async ({
  page,
}) => {
  await page.goto('/agents');
  await page
    .getByRole('row')
    .filter({
      has: page.getByRole('link', { name: 'IT Support Agent', exact: true }),
    })
    .getByRole('cell')
    .nth(1)
    .click();
  await expect(page).toHaveURL(/\/agents\/it-support$/);
  await expect(
    page.getByRole('tab', { name: 'Skills', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('tab', { name: 'Configuration', exact: true }),
  ).toBeVisible();
  await page.goto('/agents');
  await page
    .getByRole('textbox', { name: 'Search agents', exact: true })
    .fill('Knowledge');
  await page
    .getByRole('row')
    .filter({
      has: page.getByRole('link', { name: 'Knowledge Assistant', exact: true }),
    })
    .getByRole('cell')
    .nth(5)
    .click();
  await expect(page).toHaveURL(/\/agents\/knowledge-assistant$/);
  await page.goto('/agents');
  await page
    .getByRole('textbox', { name: 'Search agents', exact: true })
    .fill('');
  const link = page.getByRole('link', {
    name: 'IT Support Agent',
    exact: true,
  });
  await link.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/agents\/it-support$/);
});
