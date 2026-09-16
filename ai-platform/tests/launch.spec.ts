import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const next = async (page: import('@playwright/test').Page) =>
  page.getByRole('button', { name: 'Next →', exact: true }).last().click();

test('catalog filters and template entry points work', async ({ page }) => {
  await page.goto('/agents');
  await expect(
    page.getByRole('heading', { name: 'Agent Catalog', exact: true }),
  ).toBeVisible();
  await expect(page.locator('.agentCard')).toHaveCount(6);
  await page.getByRole('button', { name: 'Finance', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'No agents in this category' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Show all agents' }).click();
  await expect(page.locator('.agentCard')).toHaveCount(6);
  await page.getByRole('button', { name: 'IT', exact: true }).click();
  await expect(page.locator('.agentCard')).toHaveCount(1);
  await page
    .getByRole('link', { name: 'Get started with IT Support Agent' })
    .click();
  await expect(page.getByLabel('Agent name', { exact: true })).toHaveValue(
    'IT Support Agent',
  );
  await page.getByRole('link', { name: '← Back', exact: true }).click();
  await page.getByRole('link', { name: '+ Create Custom Agent' }).click();
  await expect(page.getByLabel('Agent name', { exact: true })).toBeEmpty();
  await next(page);
  await expect(page.getByLabel('Agent name', { exact: true })).toBeFocused();
});

test('use case, sources, actions and saved draft survive navigation and reload', async ({
  page,
}) => {
  await page.goto('/agents/launch');
  await page
    .getByLabel('Agent name', { exact: true })
    .fill('Acme Customer Care');
  await page
    .getByLabel('Description', { exact: true })
    .fill('Answer approved customer questions.');
  await page.getByLabel('Target users').selectOption('Partners');
  await next(page);
  await expect(
    page.getByRole('heading', { name: 'Connected sources (3)' }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Connect Google Drive', exact: true })
    .click();
  await page.getByRole('button', { name: 'Use source', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Connected sources (4)' }),
  ).toBeVisible();
  await next(page);
  await page
    .getByRole('button', { name: 'Connect Salesforce', exact: true })
    .click();
  await expect(
    page.getByRole('button', { name: 'Use selected actions' }),
  ).toBeDisabled();
  await page.getByRole('checkbox', { name: /Search records/ }).check();
  await page.getByRole('button', { name: 'Use selected actions' }).click();
  await expect(
    page.getByRole('heading', { name: 'Selected tools (3)' }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Connect ServiceNow', exact: true })
    .click();
  await expect(
    page.getByRole('checkbox', { name: /Close Incident/ }),
  ).toBeDisabled();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Save draft', exact: true }).click();
  await expect(page.getByRole('status')).toHaveText(
    'Draft saved on this device.',
  );
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Selected tools (3)' }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Use Case, completed', exact: true })
    .click();
  await expect(page.getByLabel('Agent name', { exact: true })).toHaveValue(
    'Acme Customer Care',
  );
  await expect(page.getByLabel('Target users')).toHaveValue('Partners');
  await next(page);
  await expect(
    page.getByRole('heading', { name: 'Connected sources (4)' }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Manage Google Drive', exact: true })
    .click();
  await page.getByRole('button', { name: 'Remove source' }).click();
  await expect(
    page.getByRole('heading', { name: 'Connected sources (3)' }),
  ).toBeVisible();
});

test('category filters, disclosure, empty selections and milestone boundary are usable', async ({
  page,
}) => {
  await page.goto('/agents/launch?template=custom');
  await page.getByLabel('Agent name', { exact: true }).fill('Custom support');
  await page
    .getByLabel('Description', { exact: true })
    .fill('Resolve approved support questions.');
  await next(page);
  await expect(
    page.getByText('No sources selected.', { exact: false }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Documents', exact: true }).click();
  await expect(page.locator('.integrationTile')).toHaveCount(4);
  await page
    .getByRole('button', { name: '+ Add more sources', exact: true })
    .click();
  await expect(page.locator('.integrationTile')).toHaveCount(8);
  await page
    .getByRole('button', { name: 'Connect SharePoint', exact: true })
    .click();
  await page
    .getByText('Source permissions and readiness', { exact: true })
    .click();
  await expect(
    page.getByText('Inherit source permissions', { exact: true }),
  ).toBeVisible();
  await page.keyboard.press('Escape');
  await next(page);
  await page
    .getByRole('button', { name: 'Communication', exact: true })
    .click();
  await expect(page.locator('.integrationTile')).toHaveCount(2);
  await next(page);
  await expect(
    page.getByRole('heading', { name: 'Organization Default · Recommended' }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Deploy, upcoming' }),
  ).toBeDisabled();
  await expect(
    page.getByRole('button', { name: 'Deploy to Production' }),
  ).toHaveCount(0);
});

test('corrupt or unavailable storage does not break the launch guide', async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      'newneo:launch:v1:acme-demo:customer-service-demo:customer-service',
      '{bad',
    );
  });
  await page.goto('/agents/launch');
  await expect(page.getByRole('status')).toContainText('could not be restored');
  await page.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new Error('storage unavailable');
    };
  });
  await page.getByRole('button', { name: 'Save draft', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('could not be saved');
  await next(page);
  await expect(
    page.getByRole('heading', {
      name: 'Connect knowledge sources',
      exact: true,
    }),
  ).toBeVisible();
});

for (const viewport of [
  { width: 1180, height: 740 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
]) {
  test(`visual and accessibility QA ${viewport.width}`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize(viewport);
    await page.goto('/agents');
    const check = async (name: string) => {
      if (await page.locator('.launchGuide').count())
        await expect(page.locator('.launchGuide')).toHaveAttribute(
          'aria-busy',
          'false',
        );
      await expect(page).toHaveTitle('Newneo AI Platform');
      await page.evaluate(() => document.fonts.ready);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
      // Preserve the explicitly approved Figma palette. Report its known contrast
      // debt separately; do not turn new accessibility failures into exemptions.
      const contrast = results.violations.filter(
        (item) => item.id === 'color-contrast',
      );
      const approvedColorPairs = new Set([
        '#ffffff|#6366f1',
        '#64748b|#eff6ff',
        '#64748b|#f1f5f9',
        '#16a34a|#ffffff',
        '#16a34a|#f8fafc',
        '#ffffff|#16a34a',
      ]);
      for (const violation of contrast)
        for (const node of violation.nodes)
          for (const check of node.any) {
            expect(
              approvedColorPairs.has(
                `${check.data.fgColor}|${check.data.bgColor}`,
              ),
              node.failureSummary,
            ).toBe(true);
          }
      await testInfo.attach(`${name}-reference-contrast`, {
        body: JSON.stringify(contrast, null, 2),
        contentType: 'application/json',
      });
      expect(
        results.violations
          .filter((item) => item.id !== 'color-contrast')
          .map((item) => ({
            id: item.id,
            nodes: item.nodes.map((node) => node.target),
          })),
      ).toEqual([]);
      const path = testInfo.outputPath(`${name}-${viewport.width}.png`);
      await page.evaluate(() => {
        window.scrollTo(0, 0);
        (document.activeElement as HTMLElement | null)?.blur();
      });
      await page.screenshot({ path, fullPage: true });
      await testInfo.attach(name, { path, contentType: 'image/png' });
      expect(
        await page
          .locator('img')
          .evaluateAll((images) =>
            images.every(
              (image) => (image as HTMLImageElement).naturalWidth > 0,
            ),
          ),
      ).toBe(true);
    };
    await check('catalog');
    await page
      .getByRole('link', { name: 'Get started with Customer Service Agent' })
      .click();
    await expect(page.locator('.launchGuide')).toHaveAttribute(
      'aria-busy',
      'false',
    );
    await check('use-case');
    await next(page);
    await check('knowledge');
    await next(page);
    await check('tools');
    await next(page);
    await check('infra');
    await next(page);
    await check('model');
    await next(page);
    await check('governance');
    await next(page);

    await expect(
      page.getByRole('meter', { name: 'Evaluation score', exact: true }),
    ).toHaveAttribute('aria-valuenow', '92');
    await check('evaluate');
    await next(page);
    await page
      .getByRole('radio', { name: /Production Live for end users/ })
      .check();
    await check('deploy');
    await page
      .getByRole('button', { name: 'Deploy to Production', exact: true })
      .click();
    await expect(
      page.getByRole('heading', { name: 'Your agent is live!', exact: true }),
    ).toBeVisible();
    await check('success');
    if (viewport.width === 390) {
      await page.getByRole('button', { name: 'Open navigation' }).click();
      await expect(
        page.getByRole('link', { name: 'FinOps', exact: true }),
      ).toBeVisible();
      await page
        .getByRole('button', { name: 'Close menu', exact: true })
        .click();
      await expect(
        page.getByRole('link', { name: 'FinOps', exact: true }),
      ).not.toBeVisible();
    } else {
      await expect(
        page
          .getByRole('navigation', { name: 'Main navigation' })
          .getByRole('link'),
      ).toHaveCount(11);
    }
  });
}

test('model selection, approval settings and evaluation boundary preserve the draft', async ({
  page,
}) => {
  await page.goto('/agents/launch');
  await expect(page.locator('.launchGuide')).toHaveAttribute(
    'aria-busy',
    'false',
  );
  await next(page);
  await next(page);
  await next(page);
  await expect(
    page.getByRole('heading', { name: 'Choose infrastructure', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: /Private AI Run approved/ }).click();
  await next(page);
  await expect(page.getByLabel('Approved model')).toBeDisabled();
  await expect(
    page.getByRole('button', { name: 'Next →', exact: true }),
  ).toBeDisabled();
  await page.getByRole('button', { name: '← Back', exact: true }).click();
  await page.getByRole('button', { name: 'Use organization default' }).click();
  await next(page);
  await expect(page.getByLabel('Approved model')).toHaveValue(
    'acme-cloud-gpt4o',
  );
  await page.getByRole('button', { name: /Anthropic \/ Claude/ }).click();
  await page.getByRole('button', { name: 'Select Claude preview' }).click();
  await expect(page.getByLabel('Approved model')).toHaveValue(
    'demo-cloud-claude',
  );
  await page.getByRole('button', { name: 'Save draft', exact: true }).click();
  await page.reload();
  await expect(page.getByLabel('Approved model')).toHaveValue(
    'demo-cloud-claude',
  );
  await next(page);
  await expect(page.getByLabel('Who can use this agent?')).toHaveValue(
    'everyone',
  );
  await expect(
    page.getByRole('checkbox', {
      name: 'Require approval for sensitive actions',
      exact: true,
    }),
  ).toBeChecked();
  await page
    .getByRole('checkbox', { name: 'HIPAA (if applicable)', exact: true })
    .check();
  await page
    .getByRole('checkbox', { name: 'Log all interactions', exact: true })
    .uncheck();
  await page.getByText('Access and approval summary', { exact: true }).click();
  await expect(page.locator('.governanceSummary')).toContainText('SharePoint');
  await page.getByRole('button', { name: 'Save draft', exact: true }).click();
  await page.reload();
  await expect(
    page.getByRole('checkbox', { name: 'HIPAA (if applicable)', exact: true }),
  ).toBeChecked();
  await expect(
    page.getByRole('checkbox', { name: 'Log all interactions', exact: true }),
  ).not.toBeChecked();
  await next(page);
  await expect(
    page.getByRole('heading', {
      name: 'Test your agent',
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Deploy, upcoming', exact: true }),
  ).toBeDisabled();
  await page.getByRole('button', { name: 'Save draft', exact: true }).click();
  await page.reload();
  await expect(
    page.getByRole('heading', {
      name: 'Test your agent',
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole('button', { name: '← Back', exact: true }).click();
  await expect(
    page.getByRole('checkbox', { name: 'HIPAA (if applicable)', exact: true }),
  ).toBeChecked();
});

test('evaluation retries, deliberate environment selection and simulated success are usable', async ({
  page,
  request,
}) => {
  await page.goto('/agents/launch');
  await expect(page.locator('.launchGuide')).toHaveAttribute(
    'aria-busy',
    'false',
  );
  await page.route(
    '**/api/launch/preview',
    (route) =>
      route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Temporary preview failure. Try again.',
        }),
      }),
    { times: 1 },
  );
  for (let step = 0; step < 6; step++) await next(page);
  await expect(page.locator('.evaluateStep').getByRole('alert')).toContainText(
    'Temporary preview failure',
  );
  await page
    .getByRole('button', { name: 'Load reference evaluation', exact: true })
    .click();
  await expect(
    page.getByRole('meter', { name: 'Evaluation score', exact: true }),
  ).toHaveAttribute('aria-valuenow', '92');
  await page
    .getByRole('button', { name: 'View all results →', exact: true })
    .click();
  await expect(
    page.getByRole('tab', { name: 'Evaluation Results', exact: true }),
  ).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('table')).toContainText('Failed');
  await page.getByRole('tab', { name: 'Test Chat', exact: true }).click();
  await page.getByLabel('Test message', { exact: true }).fill('Hello');
  await page.getByRole('button', { name: 'Send message', exact: true }).click();
  await expect(page.getByRole('log')).toContainText(
    'No model or connected system was called.',
  );
  await next(page);
  await expect(
    page.getByRole('button', { name: 'Deploy to environment', exact: true }),
  ).toBeDisabled();
  await page
    .getByRole('radio', { name: /Development For internal testing/ })
    .check();
  await page
    .getByRole('button', { name: 'Deploy to Development', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Your agent is live!', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(/would be deployed to development/),
  ).toBeVisible();
  await expect(page.getByText(/No live deployment occurred/)).toBeVisible();
  await page
    .getByRole('button', { name: 'Go to Agent Overview →', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Customer Service Agent', exact: true }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: '← Back to confirmation', exact: true })
    .click();
  await page.getByRole('button', { name: /Iterate and improve/ }).click();
  await expect(page.getByLabel('Agent name', { exact: true })).toHaveValue(
    'Customer Service Agent',
  );
  const denied = await request.post('/api/launch/deploy', {
    data: { environment: 'Production', approved: true, evaluationScore: 100 },
  });
  expect(denied.status()).toBe(503);
});

test('configuration changes automatically reload the preview evaluation', async ({
  page,
}) => {
  let evaluations = 0;
  page.on('request', (request) => {
    if (
      request.url().endsWith('/api/launch/preview') &&
      request.postDataJSON()?.action === 'evaluate'
    )
      evaluations++;
  });
  await page.goto('/agents/launch');
  await expect(page.locator('.launchGuide')).toHaveAttribute(
    'aria-busy',
    'false',
  );
  for (let step = 0; step < 6; step++) await next(page);

  await expect(
    page.getByRole('button', { name: 'Next →', exact: true }),
  ).toBeEnabled();
  await page
    .getByRole('button', { name: 'Governance, completed', exact: true })
    .click();
  await page
    .getByRole('checkbox', { name: 'HIPAA (if applicable)', exact: true })
    .check();
  await next(page);
  await expect(
    page.getByRole('button', { name: 'Next →', exact: true }),
  ).toBeEnabled();
  await expect(
    page.getByRole('meter', { name: 'Evaluation score', exact: true }),
  ).toHaveAttribute('aria-valuenow', '92');
  expect(evaluations).toBe(2);
});
