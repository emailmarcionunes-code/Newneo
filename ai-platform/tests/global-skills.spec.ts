import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
for (const width of [1440, 390])
  test(`global Skills navigation analytics filters and details ${width}`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/skills');
    await expect(page.getByRole('tab')).toHaveText([
      'List',
      'Pipeline',
      'Matrix',
      'Intelligence',
    ]);
    await expect(
      page.getByRole('tab', { name: 'Pipeline', exact: true }),
    ).toHaveAttribute('aria-selected', 'true');
    expect(
      await page
        .locator('.portfolioFilters label')
        .evaluateAll(
          (nodes) =>
            new Set(nodes.map((n) => Math.round(n.getBoundingClientRect().top)))
              .size,
        ),
    ).toBe(1);
    await expect(
      page.getByRole('heading', { name: 'Skills', exact: true }),
    ).toBeVisible();
    await page.getByRole('tab', { name: 'Intelligence', exact: true }).click();
    await expect(
      page.getByRole('heading', { name: 'Most Used Skill' }),
    ).toBeVisible();
    await page.getByRole('tab', { name: 'List', exact: true }).click();
    await expect(
      page.getByRole('table', { name: 'Organization Skills' }),
    ).toBeVisible();
    expect(
      await page
        .getByRole('region', { name: 'Organization Skills', exact: true })
        .evaluate((el) => el.scrollHeight > el.clientHeight),
    ).toBe(true);
    await page.getByRole('tab', { name: 'Pipeline', exact: true }).click();
    await page
      .getByRole('textbox', { name: 'Search Skills', exact: true })
      .fill('Reset Password');
    await expect(page.locator('.skillPipeline')).toContainText(
      'Reset Password',
    );
    await expect(page.locator('.skillPipeline')).not.toContainText(
      'Unlock User',
    );
    await page
      .getByRole('combobox', { name: 'Risk', exact: true })
      .selectOption('High');
    await expect(page.locator('.pipelineCard')).toHaveCount(0);
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
      .locator('.pipelineCard')
      .filter({ hasText: 'Create ServiceNow Ticket' })
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
    await page.getByRole('tab', { name: 'Pipeline', exact: true }).click();
    await page
      .getByRole('combobox', { name: 'Status', exact: true })
      .selectOption('Inactive');
    await expect(page.locator('.skillPipeline')).toContainText(
      'Create ServiceNow Ticket',
    );
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
