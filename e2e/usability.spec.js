const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = path.join(__dirname, 'artifacts', 'screenshots');

function screenshotPath(name) {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
  return path.join(ARTIFACTS_DIR, `${name}.png`);
}

test.describe('Online PDF CV usability', () => {
  test('home page displays full-screen resume viewer', async ({ page }, testInfo) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/BEN-YAKOUB CV/i);
    await expect(page.locator('#resume-frame')).toBeVisible();
    await expect(page.locator('#resume-frame')).toHaveAttribute('src', /\/resume/);
    await expect(page.locator('.main-header')).toHaveCount(0);
    await expect(page.locator('.main-footer')).toHaveCount(0);

    const viewport = page.locator('.resume-viewport');
    await expect(viewport).toBeVisible();

    const box = await viewport.boundingBox();
    const viewportSize = page.viewportSize();
    expect(box.width).toBeCloseTo(viewportSize.width, 0);
    expect(box.height).toBeCloseTo(viewportSize.height, 0);

    await page.screenshot({
      path: screenshotPath('01-home-desktop'),
      fullPage: false,
    });

    await testInfo.attach('home-page', {
      body: await page.screenshot({ fullPage: false }),
      contentType: 'image/png',
    });
  });

  test('API documentation page explains resume endpoints', async ({ page }, testInfo) => {
    await page.goto('/docs');
    await expect(page.getByRole('main').getByRole('heading', { level: 1 })).toContainText(
      'Resume API Documentation'
    );
    await expect(page.getByText('GET /resume', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('GET /api/versions', { exact: true })).toBeVisible();

    await page.screenshot({
      path: screenshotPath('02-docs-page'),
      fullPage: true,
    });

    await testInfo.attach('docs-page', {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png',
    });
  });

  test('resume analyzer accepts input and shows results', async ({ page }, testInfo) => {
    await page.goto('/analyzer');
    await expect(page.getByRole('main').getByRole('heading', { level: 1 })).toContainText(
      'Resume Analyzer Tool'
    );

    const sampleResume =
      'Experienced software engineer with JavaScript, React, Node.js, AWS, Docker, and CI/CD. ' +
      'Strong leadership, communication, teamwork, and project management skills.';

    await page.locator('#resume-text').fill(sampleResume);
    await page.screenshot({
      path: screenshotPath('03-analyzer-before'),
      fullPage: true,
    });

    await page.locator('#goto-step-2').click();
    await page.locator('#analyze-btn').click();
    await expect(page.locator('#results')).toBeVisible();
    await expect(page.locator('#technical-score')).not.toHaveText('0%');
    await expect(page.locator('#suggestions-list li')).not.toHaveCount(0);

    await page.screenshot({
      path: screenshotPath('04-analyzer-results'),
      fullPage: true,
    });

    await testInfo.attach('analyzer-results', {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png',
    });
  });

  test('compare tool loads resume versions side by side', async ({ page }, testInfo) => {
    await page.goto('/compare');
    await expect(page.getByRole('main').getByRole('heading', { level: 1 })).toContainText(
      'Resume Comparison Tool'
    );
    await expect(page.locator('#version1')).toBeVisible();
    await expect(page.locator('#version2')).toBeVisible();

    await page.screenshot({
      path: screenshotPath('05-compare-before'),
      fullPage: true,
    });

    const version2Count = await page.locator('#version2 option').count();
    if (version2Count < 2) {
      test.skip(true, 'Need at least two resume versions to compare');
    }
    if (
      (await page.locator('#version1').inputValue()) ===
      (await page.locator('#version2').inputValue())
    ) {
      await page.locator('#version2').selectOption({ index: 1 });
    }

    await page.locator('#compare-btn').click();
    await expect(page.locator('#comparison')).toBeVisible();
    await expect(page.locator('#pdf1-frame')).toBeVisible();
    await expect(page.locator('#pdf2-frame')).toBeVisible();

    await page.screenshot({
      path: screenshotPath('06-compare-side-by-side'),
      fullPage: true,
    });

    await testInfo.attach('compare-view', {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png',
    });
  });

  test('versions API returns JSON payload', async ({ request }) => {
    const response = await request.get('/api/versions');
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.versions).toContain('default');
    expect(body.count).toBeGreaterThan(0);
    expect(body.baseUrl).toContain('/resume/');
  });

  test('resume PDF endpoints are reachable', async ({ request, page }, testInfo) => {
    const resumeResponse = await request.get('/resume');
    expect(resumeResponse.ok()).toBeTruthy();
    expect(resumeResponse.headers()['content-type']).toContain('pdf');

    const versionResponse = await request.get('/resume/default');
    expect(versionResponse.ok()).toBeTruthy();
    expect(versionResponse.headers()['content-type']).toContain('pdf');

    await page.goto('/');
    await page.screenshot({
      path: screenshotPath('07-resume-endpoints-verified'),
      fullPage: true,
    });

    await testInfo.attach('resume-endpoint', {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png',
    });
  });

  test('helper pages navigation and return to CV', async ({ page }, testInfo) => {
    await page.goto('/docs');
    await expect(page.getByRole('link', { name: 'View CV' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'API Docs' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Resume Analyzer' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Compare Versions' })).toBeVisible();
    await page.screenshot({ path: screenshotPath('08-nav-docs'), fullPage: true });

    await page.getByRole('link', { name: 'Resume Analyzer' }).click();
    await expect(page).toHaveURL(/\/analyzer$/);
    await page.screenshot({ path: screenshotPath('09-nav-analyzer'), fullPage: true });

    await page.getByRole('link', { name: 'Compare Versions' }).click();
    await expect(page).toHaveURL(/\/compare$/);
    await page.screenshot({ path: screenshotPath('10-nav-compare'), fullPage: true });

    await page.getByRole('link', { name: 'View CV' }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('.main-header')).toHaveCount(0);
    await page.screenshot({ path: screenshotPath('11-nav-home'), fullPage: false });

    await testInfo.attach('navigation-flow-final', {
      body: await page.screenshot({ fullPage: false }),
      contentType: 'image/png',
    });
  });
});
