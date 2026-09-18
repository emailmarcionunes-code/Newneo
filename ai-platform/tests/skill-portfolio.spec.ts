import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
for (const width of [1440, 390])
  test(`portfolio matrix and reusable builder patterns ${width}`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/skills');
    await expect(
      page.getByRole('tabpanel', { name: 'Pipeline', exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Skill Matrix', exact: true }),
    ).toHaveCount(0);
    expect(
      (await new AxeBuilder({ page }).include('main').analyze()).violations,
    ).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: info.outputPath('pipeline.png'),
      fullPage: true,
    });
    await page.getByRole('tab', { name: 'Intelligence', exact: true }).click();
    await expect(
      page.getByRole('heading', { name: 'Portfolio Intelligence' }),
    ).toBeVisible();
    await page.getByRole('tab', { name: 'Matrix', exact: true }).click();
    const matrix = page.getByRole('region', { name: /Skill Matrix —/ });
    await expect(
      matrix.getByRole('link', { name: /Patient Appointment Scheduling/ }),
    ).toBeVisible();
    await page
      .getByRole('button', { name: 'Show all domains & capabilities' })
      .click();
    await matrix
      .getByRole('button', {
        name: 'Opportunity: Scheduling × Retail',
        exact: true,
      })
      .click();
    await expect(page.getByRole('status')).toContainText(
      'No Skill exists yet for Scheduling × Retail',
    );
    await expect(
      page.getByRole('heading', { name: 'Skills', exact: true }),
    ).toBeVisible();
    expect(
      (await new AxeBuilder({ page }).include('main').analyze()).violations,
    ).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.getByRole('button', { name: 'Representative view' }).click();
    await page.screenshot({
      path: info.outputPath('portfolio.png'),
      fullPage: true,
    });
    await matrix
      .getByRole('link', { name: /Patient Appointment Scheduling/ })
      .click();
    await expect(
      page.getByRole('heading', { name: 'Built from' }),
    ).toBeVisible();
    await expect(
      page.getByText('Scheduling Core', { exact: true }),
    ).toBeVisible();
    await page
      .getByRole('link', { name: 'Technical Specialist Scheduling →' })
      .click();
    await expect(
      page.getByRole('heading', {
        name: 'Technical Specialist Scheduling',
        exact: true,
      }),
    ).toBeVisible();
    await page.goto('/skills/new');
    await page
      .getByLabel('Skill name', { exact: true })
      .fill('Technical Specialist Scheduling');
    await page
      .getByRole('button', { name: 'Reuse Scheduling pattern', exact: true })
      .click();
    await expect(page.getByRole('status')).toContainText(
      'Reusable pattern selected',
    );
    await expect(
      page.getByRole('button', { name: 'Pattern selected' }),
    ).toHaveAttribute('aria-pressed', 'true');
    await page
      .getByRole('button', { name: 'Save builder draft', exact: true })
      .click();
    await page.reload();
    await expect(
      page.getByRole('button', { name: 'Pattern selected' }),
    ).toBeVisible();
    expect(
      (await new AxeBuilder({ page }).include('main').analyze()).violations,
    ).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
