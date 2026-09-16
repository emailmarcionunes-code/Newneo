import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('add reusable Skill to draft, retain production and record history', async ({
  page,
}, info) => {
  await page.goto('/agents/it-support');
  await page.getByRole('tab', { name: 'Skills', exact: true }).click();
  await page.getByRole('button', { name: '+ Add Skill', exact: true }).click();
  await page
    .getByLabel('Search Skills', { exact: true })
    .fill('Reset Password');
  await page
    .getByRole('button', { name: 'Choose Reset Password', exact: true })
    .click();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Continue', exact: true }),
  ).toBeDisabled();
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await page
    .getByRole('combobox', { name: 'Required Knowledge', exact: true })
    .selectOption({ label: 'IT policy knowledge' });
  for (const t of ['Identity Provider', 'ServiceNow', 'User Directory'])
    await page
      .getByRole('combobox', { name: `${t} action`, exact: true })
      .selectOption({ label: `${t} approved demo action` });
  await page
    .getByLabel('Permission scope', { exact: true })
    .fill('Standard IT employees');
  await page
    .getByLabel('Scoped permissions available', { exact: true })
    .check();
  await page
    .getByLabel('Governance policies compatible', { exact: true })
    .check();
  await page
    .getByLabel('Human approval for privileged / high-risk actions', {
      exact: true,
    })
    .check();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page
    .getByRole('button', {
      name: 'Run Skill tests and Agent regression preview',
      exact: true,
    })
    .click();
  await expect(
    page.getByRole('button', { name: 'Continue', exact: true }),
  ).toBeEnabled();
  expect(
    (await new AxeBuilder({ page }).include('main').analyze()).violations,
  ).toEqual([]);
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page
    .getByRole('button', { name: 'Save as Draft', exact: true })
    .click();
  await expect(
    page.getByRole('heading', {
      name: 'Skill added successfully',
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByText(/Production v1.8 is unchanged/)).toBeVisible();
  await page.screenshot({
    path: info.outputPath('skill-added.png'),
    fullPage: true,
  });
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Reset Password', exact: true }),
  ).toBeVisible();
  await page.getByRole('tab', { name: 'Versions', exact: true }).click();
  await expect(page.getByText(/Added Reset Password v1.6/)).toBeVisible();
  await page.getByRole('tab', { name: 'Activity', exact: true }).click();
  await expect(
    page.getByText(/Reset Password v1.6 added to draft Agent Version/),
  ).toBeVisible();
  await page.getByRole('tab', { name: 'Skills', exact: true }).click();
  await page
    .getByRole('link', { name: 'Evaluate Version', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Run evaluation preview', exact: true })
    .click();
  await page.getByRole('link', { name: 'Review for deployment' }).click();
  for (const environment of ['Test', 'Production']) {
    await page
      .getByRole('button', { name: 'Request promotion', exact: true })
      .click();
    await page.getByLabel('Target environment').selectOption(environment);
    await page
      .getByRole('button', { name: 'Request promotion preview', exact: true })
      .click();
    await page.getByRole('link', { name: 'Open approval queue' }).click();
    await page
      .getByRole('button', { name: 'Review approvals', exact: true })
      .click();
    await page
      .getByLabel('Review note')
      .fill('Skill and Agent regression reviewed in ' + environment);
    await page
      .getByRole('button', { name: 'Approve preview', exact: true })
      .click();
    await page.goto('/deployments?agent=it-support');
  }
  await page.goto('/agents/it-support');
  await page.getByRole('tab', { name: 'Skills', exact: true }).click();
  await expect(
    page.getByText('Active version v1.9.', { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Reset Password', exact: true }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Create New Version', exact: true })
    .click();
  await page.getByRole('tab', { name: 'Skills', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Reset Password', exact: true }),
  ).toBeVisible();
});

for (const width of [1440, 390])
  test(`Skill library and binding accessible at ${width}`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/agents/it-support');
    await page.getByRole('tab', { name: 'Skills', exact: true }).click();
    await page
      .getByRole('button', { name: '+ Add Skill', exact: true })
      .click();
    for (const stage of ['library', 'binding']) {
      if (stage === 'binding')
        await page
          .getByRole('button', { name: 'Choose Reset Password', exact: true })
          .click();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      expect(
        (await new AxeBuilder({ page }).include('main').analyze()).violations,
      ).toEqual([]);
      await page.screenshot({
        path: info.outputPath(`${stage}-${width}.png`),
        fullPage: true,
      });
    }
  });
