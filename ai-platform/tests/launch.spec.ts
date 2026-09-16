import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
async function next(page: import('@playwright/test').Page) {
  await page
    .locator('.wizardActions')
    .getByRole('button', {
      name: /Continue to/,
    })
    .click();
}
test('catalog search, categories and custom entry retain template identity', async ({
  page,
}) => {
  await page.goto('/agents/catalog');
  await page.getByLabel('Search agent templates').fill('IT Support');
  await expect(page.locator('.agentCard')).toHaveCount(1);
  await page
    .getByRole('link', { name: 'Get started with IT Support Agent' })
    .click();
  await expect(page.getByLabel('Agent name', { exact: true })).toHaveValue(
    'IT Support Agent',
  );
  await expect(page.locator('.launchStepper li')).toHaveCount(8);
});
test('eight stages preserve mission, sources, actions, infrastructure and model', async ({
  page,
}, info) => {
  await page.goto('/agents/launch?template=it-support');
  await expect(page.locator('.neoMascot')).toHaveAttribute(
    'data-progress',
    '0',
  );
  await page.getByLabel('Business owner').fill('IT Operations');
  await page.getByLabel('Success metric').fill('70% autonomous');
  await next(page);
  await expect(page.locator('.neoMascot')).toHaveAttribute(
    'data-progress',
    '13',
  );
  await expect(page.locator('.neoMascot figcaption')).toHaveText(
    'Assembling: IT Support Agent',
  );
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.neoReveal')).toHaveCSS(
    'transition-duration',
    '0s',
  );
  await page
    .getByRole('button', { name: /Confluence Approved organization source/ })
    .click();
  await next(page);
  await page.getByRole('switch', { name: /Search Incident/ }).check();
  await next(page);
  await page.getByRole('button', { name: /Hybrid Flexible/ }).click();
  await next(page);
  await page.getByRole('button', { name: /Claude 3.5 Sonnet/ }).click();
  await page.getByRole('button', { name: 'Save draft', exact: true }).click();
  await page.reload();
  await expect(
    page.getByRole('button', { name: /Claude 3.5 Sonnet/ }),
  ).toHaveAttribute('aria-pressed', 'true');
  await expect(
    page.getByRole('complementary', { name: 'Agent Assembly' }),
  ).toContainText('50%');
  await next(page);
  await page.getByRole('switch', { name: /Audit logging/ }).check();
  await next(page);
  await expect(
    page.getByRole('meter', { name: 'Evaluation score' }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Apply recommended fixes and rerun preview' })
    .click();
  await expect(
    page.getByRole('meter', { name: 'Evaluation score' }),
  ).toHaveAttribute('aria-valuenow', '96');
  await next(page);
  await expect(
    page.getByRole('button', { name: 'Deploy to environment' }),
  ).toBeDisabled();
  await page
    .getByRole('radio', { name: /Production Live for end users/ })
    .check();
  await page
    .getByRole('checkbox', {
      name: 'I reviewed the manifest and approve this production preview',
    })
    .check();
  await page
    .getByRole('button', { name: 'Deploy to Production', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Agent Created', exact: true }),
  ).toBeVisible();
  await expect(page.getByText(/No live deployment/)).toBeVisible();
  await expect(page.locator('.neoMascot')).toHaveAttribute(
    'data-progress',
    '100',
  );
  await expect(page.locator('.neoReveal')).toHaveCSS(
    'clip-path',
    'inset(0% 0px 0px)',
  );
  await expect(
    page.getByRole('list', { name: 'Agent creation summary' }).locator('li'),
  ).toHaveCount(7);
  await expect(
    page.getByRole('img', {
      name: 'Neo, the NEWNEO companion, saluting to celebrate your agent creation',
    }),
  ).toBeVisible();
  await expect(page.locator('.neoImage')).toHaveJSProperty('complete', true);
  await expect(page.locator('.neoImage')).not.toHaveJSProperty(
    'naturalWidth',
    0,
  );
  await page.screenshot({
    animations: 'disabled',
    path: info.outputPath('launch-success.png'),
    fullPage: true,
  });
  await page
    .getByRole('button', { name: 'View Deployment', exact: false })
    .click();
  await expect(
    page.getByRole('heading', {
      name: 'IT Support Agent — Deployment preview',
    }),
  ).toBeVisible();
  await expect(
    page.getByText('Claude 3.5 Sonnet', { exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: '← Back to confirmation' }).click();
  await page.getByRole('button', { name: 'View Agent →' }).click();
  await expect(page.getByRole('tab')).toHaveCount(8);
  await page.getByRole('tab', { name: 'Knowledge', exact: true }).click();
  await expect(
    page.getByRole('region', { name: 'Version knowledge' }),
  ).toContainText('Confluence');
});
test('evaluation errors retry and configuration edits invalidate reference receipt', async ({
  page,
}) => {
  let fail = true;
  await page.route('**/api/launch/preview', async (route) => {
    if (fail) {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Preview unavailable' }),
      });
    } else await route.continue();
  });
  await page.goto('/agents/launch');
  for (let i = 0; i < 6; i++) await next(page);
  await expect(page.getByText('Preview unavailable')).toBeVisible();
  await expect(
    page
      .locator('.wizardActions')
      .getByRole('button', { name: 'Continue to Deploy →', exact: true }),
  ).toBeDisabled();
  fail = false;
  await page
    .getByRole('button', { name: /Load reference evaluation/ })
    .first()
    .click();
  await expect(
    page.getByRole('meter', { name: 'Evaluation score' }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Model, completed', exact: true })
    .click();
  await page.getByRole('button', { name: /Gemini 1.5 Pro/ }).click();
  await next(page);
  await next(page);
  await expect(
    page.getByRole('meter', { name: 'Evaluation score' }),
  ).toBeVisible();
});
test('corrupt draft recovers and unapproved actions remain unavailable', async ({
  page,
}) => {
  await page.goto('/agents/launch');
  await page.evaluate(() =>
    localStorage.setItem(
      'newneo:launch:v1:acme-demo:customer-service-demo:customer-service',
      '{broken',
    ),
  );
  await page.reload();
  await expect(page.getByLabel('Agent name', { exact: true })).toHaveValue(
    'Customer Service Agent',
  );
  await next(page);
  await next(page);
  await expect(
    page.getByRole('switch', { name: /Close Incident/ }),
  ).toBeDisabled();
});
for (const width of [1440, 1180, 768, 390])
  test(`Hybrid v4 launch visual and accessibility ${width}`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/agents/launch');
    for (let i = 0; i < 8; i++) {
      if (i === 6)
        await expect(
          page.getByRole('meter', { name: 'Evaluation score' }),
        ).toBeVisible();
      await expect(
        page.locator('.launchStepper [aria-current=step]'),
      ).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `stage ${i}`,
      ).toBe(true);
      const result = await new AxeBuilder({ page })
        .include('.hybridJourney')
        .analyze();
      expect(result.violations, `stage ${i}`).toEqual([]);
      await page.screenshot({
        path: info.outputPath(`stage-${i + 1}-${width}.png`),
        fullPage: true,
      });
      if (i < 7) {
        if (i === 6)
          await expect(
            page.getByRole('meter', { name: 'Evaluation score' }),
          ).toBeVisible();
        await next(page);
      }
    }
  });
