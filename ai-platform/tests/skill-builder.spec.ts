import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
for (const width of [1440, 390])
  test(`build publish version configure upgrade remove Skill at ${width}`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/skills');
    await page
      .getByRole('button', { name: '+ Create Skill', exact: true })
      .click();
    await expect(
      page.getByRole('heading', {
        name: 'Organization Skill Library',
        exact: true,
      }),
    ).toHaveCount(0);
    const builder = page.getByRole('region', {
      name: 'Skill Builder',
      exact: true,
    });
    await builder
      .getByRole('textbox', { name: 'Skill name', exact: true })
      .fill('Explain IT policy');
    await builder
      .getByLabel('Business outcome')
      .fill('Explain approved IT policy to employees');
    await builder.getByLabel('Owner', { exact: true }).fill('IT Operations');
    await builder
      .getByRole('textbox', { name: 'Instructions', exact: true })
      .fill('Read request, explain policy and escalate ambiguous requests.');
    await builder.getByRole('button', { name: 'Save builder draft' }).click();
    await page.reload();
    await expect(
      builder.getByRole('textbox', { name: 'Skill name', exact: true }),
    ).toHaveValue('Explain IT policy');
    await builder.getByRole('button', { name: 'Next stage' }).click();
    await builder
      .getByLabel('Permission requirements', { exact: true })
      .fill('Read only workspace policy');
    await builder.getByRole('button', { name: 'Next stage' }).click();
    await builder
      .getByLabel('Data access boundary')
      .fill('Selected workspace only');
    await builder.getByRole('button', { name: 'Next stage' }).click();
    await builder
      .getByLabel('Expected result 1', { exact: true })
      .fill('Answer with approved policy');
    await builder
      .getByLabel('Expected result 2', { exact: true })
      .fill('Escalate safely without changes');
    await builder
      .getByRole('button', { name: 'Run preview evaluation', exact: true })
      .click();
    await expect(builder.getByRole('status')).toContainText(
      'Preview evaluation passed',
    );
    expect(
      (await new AxeBuilder({ page }).include('main').analyze()).violations,
    ).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: info.outputPath('builder.png'),
      fullPage: true,
    });
    await builder.getByRole('button', { name: 'Next stage' }).click();
    await builder
      .getByRole('combobox', { name: 'Maturity', exact: true })
      .selectOption('Validated');
    await builder
      .getByRole('button', { name: 'Publish to demo library' })
      .click();
    await page.goto('/agents/it-support');
    await page.getByRole('tab', { name: 'Skills', exact: true }).click();
    await page
      .getByRole('button', { name: '+ Add Skill', exact: true })
      .click();
    await page
      .getByRole('button', { name: 'Choose Explain IT policy', exact: true })
      .click();
    async function validateSave() {
      await page
        .getByLabel('Permission scope', { exact: true })
        .fill('IT employees');
      await page
        .getByLabel('Scoped permissions available', { exact: true })
        .check();
      await page
        .getByLabel('Governance policies compatible', { exact: true })
        .check();
      await page.getByRole('button', { name: 'Continue', exact: true }).click();
      await page
        .getByRole('button', {
          name: 'Run Skill tests and Agent regression preview',
        })
        .click();
      await page.getByRole('button', { name: 'Continue', exact: true }).click();
      await page
        .getByRole('button', { name: 'Save as Draft', exact: true })
        .click();
    }
    await validateSave();
    await page.goto('/skills');
    await page
      .getByRole('link', { name: 'Explain IT policy', exact: true })
      .click();
    await page
      .getByRole('button', { name: 'Create New Version', exact: true })
      .click();
    await builder
      .getByRole('textbox', { name: 'Instructions', exact: true })
      .fill('Explain updated policy with evidence.');
    for (let i = 0; i < 3; i++)
      await builder.getByRole('button', { name: 'Next stage' }).click();
    await builder
      .getByRole('button', { name: 'Run preview evaluation', exact: true })
      .click();
    await builder.getByRole('button', { name: 'Next stage' }).click();
    await builder
      .getByRole('button', { name: 'Publish to demo library' })
      .click();
    await page.goto('/agents/it-support');
    await page.getByRole('tab', { name: 'Skills', exact: true }).click();
    const card = page.locator('article').filter({
      has: page.getByRole('heading', {
        name: 'Explain IT policy',
        exact: true,
      }),
    });
    await expect(card).toContainText('v1.0');
    await card.getByRole('button', { name: 'Upgrade to v1.1' }).click();
    await validateSave();
    await expect(card).toContainText('v1.1');
    await card
      .getByRole('button', { name: 'Configure Explain IT policy' })
      .click();
    await validateSave();
    await card
      .getByRole('button', { name: 'Remove Explain IT policy' })
      .click();
    await page
      .getByRole('button', { name: 'Confirm removal from draft' })
      .click();
    await expect(card).toHaveCount(0);
    await expect(page.getByText(/Production v1.8 is unchanged/)).toBeVisible();
    await page.reload();
    await expect(card).toHaveCount(0);
    await page.getByRole('tab', { name: 'Versions', exact: true }).click();
    await expect(page.getByText(/Removed Explain IT policy/)).toBeVisible();
  });
