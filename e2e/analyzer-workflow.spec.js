const { test, expect } = require('@playwright/test');
const fs = require('fs');
const {
  SAMPLE_RESUME,
  fixturePath,
  screenshotPath,
  mockAnalyzeResponse,
  mockConfigResponse,
  mockExtractResponse,
  collectConsoleErrors,
  expectStableLayout,
} = require('./helpers/analyzer-helpers');

test.describe.configure({ mode: 'serial', timeout: 120_000 });

test.describe('Resume Analyzer — full workflow', () => {
  test.beforeAll(async ({ request }) => {
    const health = await request.get('/api/analyzer/config');
    expect(health.ok()).toBeTruthy();
  });

  test('SEO, assets, and page shell', async ({ page }, testInfo) => {
    const consoleErrors = await collectConsoleErrors(page, async () => {
      const response = await page.goto('/analyzer');
      expect(response?.status()).toBe(200);
      await page.waitForLoadState('networkidle');
    });

    expect(consoleErrors.filter(e => !e.includes('favicon'))).toEqual([]);

    await test.step('document title and meta tags', async () => {
      await expect(page).toHaveTitle(/Resume Analyzer Tool/i);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute(
        'content',
        /analyze resume content/i
      );
      await expect(page.locator('meta[name="viewport"]')).toHaveAttribute(
        'content',
        /width=device-width/i
      );
      await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
        'content',
        /Resume Analyzer Tool/i
      );
      await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'website');
      await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
        'content',
        'summary_large_image'
      );
    });

    await test.step('stylesheets and scripts load', async () => {
      await expect(page.locator('link[href="/stylesheets/style.css"]')).toHaveCount(1);
      await expect(page.locator('link[href="/stylesheets/analyzer.css"]')).toHaveCount(1);
      await expect(page.locator('script[src="/javascripts/resume-analyzer.js"]')).toHaveCount(1);
      await expect(page.locator('script[src="/javascripts/analyzer-app.js"]')).toHaveCount(1);
    });

    await test.step('accessibility landmarks and heading hierarchy', async () => {
      await expect(page.getByRole('main')).toBeVisible();
      await expect(page.getByRole('banner')).toBeVisible();
      await expect(page.getByRole('contentinfo')).toBeVisible();
      await expect(page.getByRole('main').getByRole('heading', { level: 1 })).toContainText(
        'Resume Analyzer Tool'
      );
      await expect(page.getByRole('navigation')).toBeVisible();
    });

    await test.step('layout stability after load', async () => {
      await expectStableLayout(page, '#resume-text');
      await expectStableLayout(page, '.analyzer-toolbar');
    });

    await page.screenshot({ path: screenshotPath('01-seo-and-shell'), fullPage: true });
    await testInfo.attach('analyzer-seo-shell', {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png',
    });
  });

  test('config API and AI toggle visibility', async ({ page, request }) => {
    const config = await request.get('/api/analyzer/config');
    expect(config.ok()).toBeTruthy();
    const configBody = await config.json();
    expect(configBody).toHaveProperty('openAi');
    expect(configBody).toHaveProperty('virusTotal');
    expect(configBody.maxUploadMb).toBe(10);
    expect(Array.isArray(configBody.supportedUploads)).toBe(true);

    const configRequest = page.waitForResponse(
      r => r.url().includes('/api/analyzer/config') && r.status() === 200
    );
    await page.goto('/analyzer');
    const configResponse = await configRequest;
    const uiConfig = await configResponse.json();

    if (uiConfig.openAi) {
      await expect(page.locator('#ai-toggle-label')).toBeVisible();
      await expect(page.locator('#use-ai')).toBeChecked();
    } else {
      await expect(page.locator('#ai-toggle-label')).toBeHidden();
    }
  });

  test('live validation, sample, clear, and target role interactions', async ({ page }) => {
    await page.goto('/analyzer');

    await test.step('empty stats on load', async () => {
      await expect(page.locator('#stat-chars')).toContainText('0 characters');
      await expect(page.locator('#stat-status')).toContainText('Ready');
      await expect(page.locator('#results')).toBeHidden();
    });

    await test.step('typing updates live stats and hints', async () => {
      await page.locator('#resume-text').fill(SAMPLE_RESUME);
      await expect(page.locator('#stat-chars')).not.toContainText('0 characters');
      await expect(page.locator('#stat-words')).not.toContainText('0 words');
      await expect(page.locator('#stat-status')).toContainText(/Ready to analyze/i);
      await expect(page.locator('#live-hints')).not.toBeEmpty();
      await expectStableLayout(page, '#text-stats');
    });

    await test.step('short text shows validation warning', async () => {
      await page.locator('#resume-text').fill('Too short.');
      await expect(page.locator('#stat-status')).toContainText(/Need \d+ more chars/i);
      await expect(page.locator('#drop-zone')).toHaveClass(/has-error/);
    });

    await test.step('load sample restores valid content', async () => {
      await page.locator('#sample-btn').click();
      const value = await page.locator('#resume-text').inputValue();
      expect(value.length).toBeGreaterThan(80);
      await expect(page.locator('#stat-status')).toContainText(/Ready to analyze/i);
    });

    await test.step('target role selector changes value', async () => {
      await page.locator('#target-role').selectOption('engineering');
      await expect(page.locator('#target-role')).toHaveValue('engineering');
    });

    await test.step('clear resets form and hides results', async () => {
      await page.locator('#analyze-btn').click();
      await expect(page.locator('#results')).toBeVisible({ timeout: 15_000 });
      await page.locator('#clear-btn').click();
      await expect(page.locator('#resume-text')).toHaveValue('');
      await expect(page.locator('#results')).toBeHidden();
    });

    await page.screenshot({ path: screenshotPath('02-interactions'), fullPage: true });
  });

  test('empty analyze shows error alert', async ({ page }) => {
    await page.goto('/analyzer');
    await page.locator('#analyze-btn').click();
    await expect(page.locator('#alert-banner')).toHaveClass(/visible/);
    await expect(page.locator('#alert-message')).toContainText(/paste your resume/i);
    await page.getByRole('button', { name: 'Dismiss' }).click();
    await expect(page.locator('#alert-banner')).not.toHaveClass(/visible/);
  });

  test('upload .txt locally via file input', async ({ page }) => {
    await page.goto('/analyzer');
    await page.locator('#upload-btn').click();
    await page.locator('#file-upload').setInputFiles(fixturePath('sample-resume.txt'));
    await expect(page.locator('#resume-text')).not.toHaveValue('');
    await expect(page.locator('#upload-status')).toBeVisible();
    await expect(page.locator('#upload-status')).toContainText(/Imported from/i);
    await expect(page.locator('#drop-zone')).toHaveClass(/has-content/);
    await page.screenshot({ path: screenshotPath('03-upload-txt'), fullPage: true });
  });

  test('server upload flow: VirusTotal scan + extraction (mocked docx)', async ({ page }) => {
    let extractPayload;
    await page.route('**/api/extract-resume', async route => {
      extractPayload = mockExtractResponse();
      await route.fulfill({ status: 200, contentType: 'application/json', json: extractPayload });
    });

    await page.goto('/analyzer');

    const extractRequest = page.waitForRequest(r => r.url().includes('/api/extract-resume'));
    const extractResponse = page.waitForResponse(
      r => r.url().includes('/api/extract-resume') && r.status() === 200
    );

    await page.locator('#file-upload').setInputFiles({
      name: 'cv.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      buffer: Buffer.from('mock-docx-bytes'),
    });

    await extractRequest;
    await extractResponse;

    await expect(page.locator('#upload-status')).toContainText(/Imported from cv.docx/i);
    await expect(page.locator('#upload-status')).toContainText(/Security scan/i);
    await expect(page.locator('#resume-text')).toHaveValue(SAMPLE_RESUME);
    expect(extractPayload.security.verdict).toBe('clean');
  });

  test('analyze shows loading state then results with tab navigation', async ({ page }) => {
    let analyzeBody;
    await page.route('**/api/analyzer/config', async route => {
      await route.fulfill({ json: mockConfigResponse({ openAi: true }) });
    });
    await page.route('**/api/analyze', async route => {
      await new Promise(r => setTimeout(r, 600));
      analyzeBody = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: mockAnalyzeResponse(),
      });
    });

    await page.goto('/analyzer');
    await page.locator('#sample-btn').click();
    await page.locator('#target-role').selectOption('engineering');
    await expect(page.locator('#ai-toggle-label')).toBeVisible();

    const analyzeResponse = page.waitForResponse(
      r => r.url().includes('/api/analyze') && r.status() === 200
    );
    await page.locator('#analyze-btn').click();

    await expect(page.locator('#analyze-btn')).toBeDisabled();
    await expect(page.locator('#analyze-btn')).toHaveClass(/loading/);

    await analyzeResponse;
    await expect(page.locator('#analyze-btn')).toBeEnabled();
    await expect(page.locator('#results')).toBeVisible();
    await expect(page.locator('#overall-score')).not.toHaveText('0%');
    await expect(page.locator('#technical-score')).not.toHaveText('0%');

    expect(analyzeBody.useAi).toBe(true);
    expect(analyzeBody.targetRole).toBe('engineering');

    await test.step('scroll results into view and verify tabs', async () => {
      await page.locator('#results').scrollIntoViewIfNeeded();
      await expect(page.locator('#tab-checks')).toHaveClass(/active/);
      await expect(page.locator('#practices-grid .practice-check')).not.toHaveCount(0);

      await page.getByRole('tab', { name: 'Keywords' }).click();
      await expect(page.locator('#tab-keywords')).toHaveClass(/active/);
      await expect(page.locator('#technical-keywords .keyword')).not.toHaveCount(0);

      await page.getByRole('tab', { name: 'Suggestions' }).click();
      await expect(page.locator('#tab-suggestions')).toHaveClass(/active/);
      await expect(page.locator('#suggestions-list li')).not.toHaveCount(0);

      await page.getByRole('tab', { name: 'AI Coach' }).click();
      await expect(page.locator('#tab-ai')).toHaveClass(/active/);
      await expect(page.locator('#ai-insights-panel')).toContainText(/Solid engineering resume/i);
      await expect(page.locator('.ai-list.strengths li')).not.toHaveCount(0);
    });

    await page.screenshot({ path: screenshotPath('04-analyze-results-tabs'), fullPage: true });
  });

  test('AI toggle off sends useAi false', async ({ page }) => {
    let analyzeBody;
    await page.route('**/api/analyzer/config', async route => {
      await route.fulfill({ json: mockConfigResponse({ openAi: true }) });
    });
    await page.route('**/api/analyze', async route => {
      analyzeBody = route.request().postDataJSON();
      await route.fulfill({
        json: mockAnalyzeResponse({ aiInsights: { available: false, skipped: true } }),
      });
    });

    await page.goto('/analyzer');
    await page.locator('#sample-btn').click();
    await page.locator('#use-ai').uncheck();
    await page.locator('#analyze-btn').click();
    await expect(page.locator('#results')).toBeVisible({ timeout: 15_000 });
    expect(analyzeBody.useAi).toBe(false);
  });

  test('Ctrl+Enter keyboard shortcut triggers analyze', async ({ page }) => {
    await page.route('**/api/analyze', async route => {
      await route.fulfill({ json: mockAnalyzeResponse() });
    });
    await page.goto('/analyzer');
    await page.locator('#sample-btn').click();
    await page.locator('#resume-text').focus();
    await page.keyboard.press('Control+Enter');
    await expect(page.locator('#results')).toBeVisible({ timeout: 15_000 });
  });

  test('API error surfaces user-facing alert', async ({ page }) => {
    await page.route('**/api/analyze', async route => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        json: { success: false, error: 'Resume is too short (12 chars).' },
      });
    });

    await page.goto('/analyzer');
    await page.locator('#resume-text').fill('short text');
    await page.locator('#analyze-btn').click();
    await expect(page.locator('#alert-banner')).toHaveClass(/visible/);
    await expect(page.locator('#alert-message')).toContainText(/too short/i);
  });

  test('extract-resume API rejects unsupported file type', async ({ request }) => {
    const response = await request.post('/api/extract-resume', {
      multipart: {
        file: {
          name: 'malware.xyz',
          mimeType: 'application/octet-stream',
          buffer: Buffer.from('bad'),
        },
      },
    });
    expect(response.status()).toBe(400);
  });

  test('extract-resume API accepts txt upload', async ({ request }) => {
    test.setTimeout(90_000);
    const content = fs.readFileSync(fixturePath('sample-resume.txt'));
    const response = await request.post('/api/extract-resume', {
      multipart: {
        file: {
          name: 'resume.txt',
          mimeType: 'text/plain',
          buffer: content,
        },
      },
      timeout: 60_000,
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.text).toContain('JavaScript');
    expect(body.security).toBeDefined();
  });

  test('analyze API returns aiInsights field', async ({ request }) => {
    const response = await request.post('/api/analyze', {
      data: {
        text: SAMPLE_RESUME,
        targetRole: 'engineering',
        useAi: false,
      },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.results.technicalScore).toBeGreaterThan(0);
    expect(body.aiInsights).toBeDefined();
  });

  test('@live full analyze with real OpenAI when configured', async ({
    request,
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium-desktop', 'Live AI runs once on desktop project');

    const config = await request.get('/api/analyzer/config');
    const { openAi } = await config.json();
    test.skip(!openAi, 'OPENAI_API_KEY not set — skipping live AI test');

    await page.goto('/analyzer');
    await page.locator('#sample-btn').click();
    await page.locator('#target-role').selectOption('engineering');
    await expect(page.locator('#ai-toggle-label')).toBeVisible();

    const analyzeResponse = page.waitForResponse(
      r => r.url().includes('/api/analyze') && r.status() === 200,
      { timeout: 90_000 }
    );
    await page.locator('#analyze-btn').click();
    const response = await analyzeResponse;
    const body = await response.json();

    await expect(page.locator('#results')).toBeVisible();
    test.skip(
      !body.aiInsights?.available,
      `OpenAI insights unavailable: ${body.aiInsights?.error || body.aiInsights?.reason || 'unknown'}`
    );

    await expect(page.locator('#ai-tab-btn')).toBeVisible();
    await page.locator('#ai-tab-btn').click();
    await expect(page.locator('#tab-ai')).toHaveClass(/active/);
    await expect(page.locator('#ai-insights-panel .ai-summary-text')).not.toBeEmpty();
    await page.screenshot({ path: screenshotPath('05-live-ai-coach'), fullPage: true });
  });

  test('mobile scroll and interaction', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium-mobile', 'Mobile-only interaction test');

    await page.route('**/api/analyze', async route => {
      await route.fulfill({ json: mockAnalyzeResponse() });
    });

    await page.goto('/analyzer');
    await page.locator('#sample-btn').click();
    await page.locator('#analyze-btn').click();
    await expect(page.locator('#results')).toBeVisible({ timeout: 15_000 });

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(page.locator('#results')).toBeInViewport();
    await page.screenshot({ path: screenshotPath('06-mobile-results'), fullPage: true });
  });
});

test.describe('Resume Analyzer — edge cases', () => {
  test('drag-and-drop .txt file populates textarea', async ({ page }) => {
    await page.goto('/analyzer');
    const buffer = fs.readFileSync(fixturePath('sample-resume.txt'));

    const dataTransfer = await page.evaluateHandle(async () => new DataTransfer());
    await page.evaluate(
      async ({ dt, name, type, bytes }) => {
        const file = new File([new Uint8Array(bytes)], name, { type });
        dt.items.add(file);
      },
      {
        dt: dataTransfer,
        name: 'sample-resume.txt',
        type: 'text/plain',
        bytes: [...buffer],
      }
    );

    await page.locator('#drop-zone').dispatchEvent('drop', { dataTransfer });
    await expect(page.locator('#resume-text')).not.toHaveValue('');
    await expect(page.locator('#drop-zone')).toHaveClass(/has-content/);
  });

  test('unsupported file type shows alert without API call', async ({ page }) => {
    let apiCalled = false;
    await page.route('**/api/extract-resume', async route => {
      apiCalled = true;
      await route.continue();
    });

    await page.goto('/analyzer');
    await page.locator('#file-upload').setInputFiles({
      name: 'virus.exe',
      mimeType: 'application/octet-stream',
      buffer: Buffer.from('MZ'),
    });

    await expect(page.locator('#alert-banner')).toHaveClass(/visible/);
    await expect(page.locator('#alert-message')).toContainText(/unsupported file type/i);
    expect(apiCalled).toBe(false);
  });

  test('malicious VirusTotal verdict blocks upload (mocked)', async ({ page }) => {
    await page.route('**/api/extract-resume', async route => {
      await route.fulfill({
        status: 403,
        contentType: 'application/json',
        json: {
          success: false,
          error: 'Upload blocked: 3 security engine(s) flagged this file as malicious.',
        },
      });
    });

    await page.goto('/analyzer');
    await page.locator('#file-upload').setInputFiles({
      name: 'infected.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      buffer: Buffer.from('bad-docx'),
    });

    await expect(page.locator('#alert-banner')).toHaveClass(/visible/);
    await expect(page.locator('#alert-message')).toContainText(/blocked/i);
    await expect(page.locator('#upload-status')).toContainText(/blocked/i);
  });

  test('503 from extract-resume shows retry message', async ({ page }) => {
    await page.route('**/api/extract-resume', async route => {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        json: {
          success: false,
          error: 'VirusTotal rate limit reached. Please wait a minute and try again.',
        },
      });
    });

    await page.goto('/analyzer');
    await page.locator('#file-upload').setInputFiles({
      name: 'cv.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4 mock'),
    });

    await expect(page.locator('#alert-banner')).toHaveClass(/visible/);
    await expect(page.locator('#alert-message')).toContainText(/rate limit/i);
  });

  test('network failure falls back to local analysis', async ({ page }) => {
    await page.route('**/api/analyze', async route => route.abort('failed'));
    await page.goto('/analyzer');
    await page.locator('#sample-btn').click();
    await page.locator('#analyze-btn').click();

    await expect(page.locator('#results')).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('#technical-score')).not.toHaveText('0%');
    await expect(page.locator('#ai-tab-btn')).toBeHidden();
    await expect(page.locator('#alert-banner')).toHaveClass(/visible/);
    await expect(page.locator('#alert-message')).toContainText(/offline analysis/i);
  });

  test('tab switching keeps layout stable (no flicker jump)', async ({ page }) => {
    await page.route('**/api/analyze', async route => {
      await route.fulfill({ json: mockAnalyzeResponse() });
    });

    await page.goto('/analyzer');
    await page.locator('#sample-btn').click();
    await page.locator('#analyze-btn').click();
    await expect(page.locator('#results')).toBeVisible({ timeout: 15_000 });

    await page.locator('#ai-tab-btn').click();
    await expectStableLayout(page, '#results');

    await page.getByRole('tab', { name: 'Checks' }).click();
    await expectStableLayout(page, '.score-cards');
  });

  test('navigation links from analyzer preserve SEO structure', async ({ page }) => {
    await page.goto('/analyzer');
    await expect(page.getByRole('link', { name: 'View CV' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'API Docs' })).toHaveAttribute('href', '/docs');

    await page.getByRole('link', { name: 'API Docs' }).click();
    await expect(page).toHaveURL(/\/docs$/);
    await expect(page).toHaveTitle(/API Documentation/i);
  });

  test('analyze API rejects empty body', async ({ request }) => {
    const response = await request.post('/api/analyze', {
      data: { text: '', targetRole: 'engineering' },
    });
    expect(response.status()).toBe(400);
  });

  test('analyze API rejects invalid target role', async ({ request }) => {
    const response = await request.post('/api/analyze', {
      data: { text: SAMPLE_RESUME, targetRole: 'invalid-role' },
    });
    expect(response.status()).toBe(400);
  });
});
