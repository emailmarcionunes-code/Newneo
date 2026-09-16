import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
for (const width of [1440, 390])
  test(`global Skills navigation analytics filters and details ${width}`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/skills');
    await expect(
      page.getByRole('heading', { name: 'Skills', exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Most Used Skill' }),
    ).toBeVisible();
    await page
      .getByRole('textbox', { name: 'Search Skills', exact: true })
      .fill('Reset Password');
    await expect(
      page.getByRole('table', { name: 'Organization Skills', exact: true }),
    ).toContainText('Reset Password');
    await expect(
      page.getByRole('table', { name: 'Organization Skills', exact: true }),
    ).not.toContainText('Unlock User');
    await page
      .getByRole('combobox', { name: 'Risk', exact: true })
      .selectOption('High');
    await expect(
      page.getByText('No matching records.', { exact: false }),
    ).toBeVisible();
    await page
      .getByRole('combobox', { name: 'Risk', exact: true })
      .selectOption('All');
    await page
      .getByRole('textbox', { name: 'Search Skills', exact: true })
      .fill('');
    expect(
      (await new AxeBuilder({ page }).include('main').analyze()).violations,
    ).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: info.outputPath('global-skills.png'),
      fullPage: true,
    });
    await page
      .getByRole('table')
      .getByRole('link', { name: 'Create ServiceNow Ticket', exact: true })
      .click();
    for (const name of [
      'Overview',
      'Configuration',
      'Tools',
      'Knowledge',
      'Governance',
      'Evaluations',
      'Versions',
      'Usage',
    ]) {
      await page.getByRole('tab', { name, exact: true }).click();
      await expect(
        page.getByRole('tabpanel', { name, exact: true }),
      ).toBeVisible();
    }
    await expect(
      page.getByRole('table', { name: 'Skill usage by Agent' }),
    ).toContainText('IT Support Agent');
    expect(
      (await new AxeBuilder({ page }).include('main').analyze()).violations,
    ).toEqual([]);
    await page.getByRole('tab', { name: 'Configuration', exact: true }).click();
    await page
      .getByRole('button', { name: 'Deactivate library Skill' })
      .click();
    await page.goto('/skills');
    await page
      .getByRole('combobox', { name: 'Status', exact: true })
      .selectOption('Inactive');
    await expect(
      page.getByRole('table', { name: 'Organization Skills', exact: true }),
    ).toContainText('Create ServiceNow Ticket');
    await page.goto('/agents/it-support');
    await page.getByRole('tab', { name: 'Skills', exact: true }).click();
    await page
      .getByRole('button', { name: '+ Add Skill', exact: true })
      .click();
    await expect(
      page.getByRole('heading', { name: 'Add Skill to IT Support Agent' }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Create New Skill', exact: true }),
    ).toHaveCount(0);
    await page.getByRole('link', { name: /Can’t find the Skill/ }).click();
    await expect(page).toHaveURL(/\/skills\/new\?agent=it-support/);
    await expect(
      page.getByRole('region', { name: 'Skill Builder' }),
    ).toBeVisible();
  });
