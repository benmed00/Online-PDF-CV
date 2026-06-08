const fs = require('fs');
const path = require('path');
const { expect } = require('@playwright/test');

const FIXTURES_DIR = path.join(__dirname, '..', 'fixtures');
const ARTIFACTS_DIR = path.join(__dirname, '..', 'artifacts', 'screenshots', 'analyzer');

const SAMPLE_RESUME =
  'Experienced software engineer with JavaScript, React, Node.js, AWS, Docker, and CI/CD. ' +
  'Strong leadership, communication, teamwork, and project management skills since 2020. ' +
  'Built scalable APIs and led cross-functional teams with measurable outcomes.';

function fixturePath(name) {
  return path.join(FIXTURES_DIR, name);
}

function screenshotPath(name) {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
  return path.join(ARTIFACTS_DIR, `${name}.png`);
}

function mockAnalyzeResponse(overrides = {}) {
  return {
    success: true,
    results: {
      technicalScore: 45,
      softSkillsScore: 35,
      managementScore: 25,
      overallScore: 35,
      practicesScore: 72,
      grade: 'fair',
      practicesGrade: 'good',
      matches: {
        technical: ['javascript', 'react', 'aws', 'docker'],
        soft: ['leadership', 'communication', 'teamwork'],
        management: ['project management'],
      },
      charCount: 200,
      wordCount: 30,
    },
    checks: [
      {
        id: 'action-verbs',
        label: 'Action verbs',
        passed: true,
        score: 80,
        hint: 'Found strong verbs.',
      },
      {
        id: 'metrics',
        label: 'Quantified results',
        passed: false,
        score: 25,
        hint: 'Add numbers and percentages.',
      },
    ],
    suggestions: [
      { type: 'improvement', text: 'Highlight more technical skills.' },
      { type: 'practice', text: 'Add quantified achievements.' },
    ],
    validation: { valid: true, errors: [], warnings: [] },
    meta: { analyzedAt: new Date().toISOString(), targetRole: 'engineering' },
    aiInsights: {
      available: true,
      summary: 'Solid engineering resume with good keyword coverage and room to quantify impact.',
      strengths: ['Clear technical stack', 'Leadership mentioned'],
      improvements: ['Add more metrics', 'Expand cloud keywords'],
      atsTips: ['Use standard section headings', 'Keep bullet points concise'],
      missingKeywords: ['TypeScript', 'Kubernetes'],
      scoreEstimate: 78,
      model: 'gpt-4o-mini',
      targetRole: 'engineering',
      generatedAt: new Date().toISOString(),
    },
    ...overrides,
  };
}

function mockConfigResponse(overrides = {}) {
  return {
    mode: 'express',
    openAi: true,
    virusTotal: true,
    maxUploadMb: 10,
    supportedUploads: ['.txt', '.docx', '.pdf'],
    features: {
      uploadExtraction: true,
      hostedCvExtract: true,
      jobMatch: true,
      aiCoach: true,
    },
    ...overrides,
  };
}

/** Fill sample resume and open step 2 for analyze actions. */
async function goToAnalyzeStep(page) {
  await page.locator('#sample-btn').click();
  await page.locator('#goto-step-2').click();
  await expect(page.locator('#step-panel-2')).toBeVisible();
}

function mockExtractResponse(overrides = {}) {
  return {
    success: true,
    text: SAMPLE_RESUME,
    source: {
      filename: 'cv.docx',
      extension: '.docx',
      kind: 'officeparser',
      fileType: 'docx',
      charCount: SAMPLE_RESUME.length,
    },
    security: {
      scanned: true,
      provider: 'virustotal',
      verdict: 'clean',
      stats: { malicious: 0, suspicious: 0, harmless: 70, undetected: 3 },
      sha256: 'abc123',
      engines: 73,
      source: 'cache',
    },
    ...overrides,
  };
}

/** Collect console errors during a callback. */
async function collectConsoleErrors(page, callback) {
  const errors = [];
  const handler = msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  };
  page.on('console', handler);
  try {
    await callback();
  } finally {
    page.off('console', handler);
  }
  return errors;
}

/** Assert layout boxes stay stable (guards against visible flicker/jump). */
async function expectStableLayout(page, selector, waitMs = 400) {
  const locator = page.locator(selector);
  await expect(locator).toBeVisible();
  const first = await locator.boundingBox();
  await page.waitForTimeout(waitMs);
  const second = await locator.boundingBox();
  expect(first).not.toBeNull();
  expect(second).not.toBeNull();
  expect(first.width).toBeCloseTo(second.width, 0);
  expect(first.height).toBeCloseTo(second.height, 0);
}

module.exports = {
  SAMPLE_RESUME,
  FIXTURES_DIR,
  fixturePath,
  screenshotPath,
  mockAnalyzeResponse,
  mockConfigResponse,
  mockExtractResponse,
  collectConsoleErrors,
  expectStableLayout,
  goToAnalyzeStep,
};
