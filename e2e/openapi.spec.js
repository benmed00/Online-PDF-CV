const { test, expect } = require('@playwright/test');
const {
  selectLocalServer,
  openSwaggerOperation,
  tryOutAndExecute,
  expectSwaggerResponse,
} = require('./helpers/swagger-ui-helpers');

const SAMPLE_RESUME_TEXT = JSON.stringify({
  text:
    'Experienced software engineer with JavaScript, React, Node.js, AWS, Docker, and CI/CD. ' +
    'Strong leadership, communication, teamwork, and project management skills. ' +
    'Built scalable APIs and managed cross-functional teams from 2020 – Present.',
  targetRole: 'engineering',
  useAi: false,
});

test.describe('OpenAPI documentation', () => {
  test('GET /api/openapi.yaml returns valid OpenAPI YAML', async ({ request }) => {
    const response = await request.get('/api/openapi.yaml');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toMatch(/yaml/);

    const body = await response.text();
    expect(body).toContain('openapi: 3.1');
    expect(body).toContain('Online-PDF-CV API');
    expect(body).toContain('/api/versions');
    expect(body).toContain('/api/analyze');
  });

  test('GET /api/docs loads Swagger UI', async ({ page }) => {
    const response = await page.goto('/api/docs');
    expect(response?.status()).toBe(200);
    await expect(page.locator('.swagger-ui.swagger-container')).toBeVisible();
    await expect(page).toHaveTitle(/Online-PDF-CV API/);
  });

  test('Swagger UI executes GET /api/versions (Try it out → Execute)', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('/api/docs');
    await selectLocalServer(page);

    const opblock = await openSwaggerOperation(page, {
      tag: 'Versions',
      method: 'GET',
      path: '/api/versions',
    });

    const [response] = await Promise.all([
      page.waitForResponse(
        res =>
          /\/api\/versions\/?$/.test(new URL(res.url()).pathname) &&
          res.request().method() === 'GET',
        { timeout: 30000 }
      ),
      tryOutAndExecute(page, opblock),
    ]);
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty('versions');
    expect(body).toHaveProperty('count');
    expect(body).toHaveProperty('baseUrl');

    await expectSwaggerResponse(opblock, 200);
    await expect(opblock.locator('.live-responses-table')).toContainText('versions');
  });

  test('Swagger UI executes POST /api/analyze with filled body', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('/api/docs');
    await selectLocalServer(page);

    const opblock = await openSwaggerOperation(page, {
      tag: 'Analyzer',
      method: 'POST',
      path: '/api/analyze',
    });

    const [response] = await Promise.all([
      page.waitForResponse(
        res =>
          /\/api\/analyze\/?$/.test(new URL(res.url()).pathname) &&
          res.request().method() === 'POST',
        { timeout: 30000 }
      ),
      tryOutAndExecute(page, opblock, { requestBody: SAMPLE_RESUME_TEXT }),
    ]);
    expect(response.status()).toBe(200);
    expect(response.request().postDataJSON()).toMatchObject({
      targetRole: 'engineering',
      useAi: false,
    });

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.results).toBeDefined();

    await expectSwaggerResponse(opblock, 200);
    await expect(opblock.locator('.live-responses-table')).toContainText('success');
  });
});
