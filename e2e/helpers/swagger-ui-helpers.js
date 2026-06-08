const { expect } = require('@playwright/test');

/**
 * Ensure Swagger UI targets the local Express server (not production).
 * @param {import('@playwright/test').Page} page
 */
async function selectLocalServer(page) {
  const serverSelect = page.locator('.servers select');
  if ((await serverSelect.count()) > 0) {
    await serverSelect.selectOption('/');
  }
}

/**
 * Expand a Swagger UI tag section (Versions, Analyzer, Resume).
 * @param {import('@playwright/test').Page} page
 * @param {string} tagName
 */
async function expandTagSection(page, tagName) {
  const section = page.locator('.opblock-tag-section').filter({
    has: page.locator('h3.opblock-tag', { hasText: tagName }),
  });
  await expect(section).toBeVisible({ timeout: 20000 });
  const isOpen = await section.evaluate(el => el.classList.contains('is-open'));
  if (!isOpen) {
    await section.locator('h3.opblock-tag').click();
  }
  await expect(section).toHaveClass(/is-open/);
}

/**
 * Open an operation by tag + operationId or HTTP method + path.
 * @param {import('@playwright/test').Page} page
 * @param {{ tag: string, operationId?: string, method?: string, path?: string }} target
 */
async function openSwaggerOperation(page, { tag, operationId, method, path: routePath }) {
  await expandTagSection(page, tag);

  let opblock;
  if (operationId) {
    opblock = page.locator(`[id="operations-${tag}-${operationId}"]`);
    if ((await opblock.count()) === 0) {
      opblock = page.locator(`[id*="${operationId}"]`).first();
    }
  } else {
    opblock = page
      .locator('.opblock')
      .filter({ has: page.locator('.opblock-summary-method', { hasText: method }) })
      .filter({ has: page.locator('.opblock-summary-path', { hasText: routePath }) })
      .first();
  }

  await expect(opblock).toBeVisible({ timeout: 20000 });
  await opblock.scrollIntoViewIfNeeded();
  const isOpen = await opblock.evaluate(el => el.classList.contains('is-open'));
  if (!isOpen) {
    await opblock.locator('.opblock-summary-control').click();
  }
  await expect(opblock).toHaveClass(/is-open/);
  return opblock;
}

/**
 * Click Try it out → fill optional JSON body → Execute.
 * @param {import('@playwright/test').Page} page
 * @param {import('@playwright/test').Locator} opblock
 * @param {{ requestBody?: string }} [options]
 */
async function tryOutAndExecute(page, opblock, options = {}) {
  const tryOut = opblock.locator('button.try-out__btn');
  await expect(tryOut).toBeVisible();
  await tryOut.click();

  if (options.requestBody) {
    const textarea = opblock.locator('textarea').first();
    await expect(textarea).toBeVisible({ timeout: 15000 });
    await textarea.fill(options.requestBody);
  }

  const execute = opblock.locator('button.btn.execute');
  await expect(execute).toBeEnabled();
  await execute.click();
}

/**
 * Assert Swagger UI shows a successful live response for the given operation.
 * @param {import('@playwright/test').Locator} opblock
 * @param {number} statusCode
 */
async function expectSwaggerResponse(opblock, statusCode) {
  const liveResponse = opblock.locator('.live-responses-table .response').first();
  await expect(liveResponse).toBeVisible({ timeout: 30000 });
  await expect(liveResponse.locator('.response-col_status')).toContainText(String(statusCode));
}

module.exports = {
  selectLocalServer,
  expandTagSection,
  openSwaggerOperation,
  tryOutAndExecute,
  expectSwaggerResponse,
};
