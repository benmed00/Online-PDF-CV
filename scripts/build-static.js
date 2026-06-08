#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const pug = require('pug');
const prettier = require('prettier');
const { getResumeVersions } = require('../utils/getResumeVersions');

const ROOT = path.join(__dirname, '..');
const VIEWS_DIR = path.join(ROOT, 'views');
const PUBLIC_DIR = path.join(ROOT, 'public');
const OPENAPI_SOURCE = path.join(ROOT, 'openapi', 'openapi.yaml');
const SITE_URL = (process.env.SITE_URL || 'https://benyakoub-cv.firebaseapp.com').replace(
  /\/$/,
  ''
);

function writePage(outputRelativePath, viewFile, locals) {
  const html = pug.renderFile(path.join(VIEWS_DIR, viewFile), locals);
  const outputPath = path.join(PUBLIC_DIR, outputRelativePath);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, html, 'utf8');
  console.log(`Built ${outputRelativePath}`);
}

function buildStaticSite() {
  const versions = getResumeVersions();

  writePage('index.html', 'index.pug', {
    title: 'BEN-YAKOUB CV',
    metaDescription: 'Online resume in PDF format with multiple versions for different purposes',
    metaKeywords: 'resume, CV, PDF, online resume, professional resume',
    metaUrl: `${SITE_URL}/`,
  });

  writePage(path.join('docs', 'index.html'), 'docs.pug', {
    title: 'Resume API Documentation',
    versions,
    metaDescription:
      'API documentation for accessing different versions of the resume in PDF format',
    metaKeywords: 'resume API, PDF API, resume versions, resume documentation',
    metaUrl: `${SITE_URL}/docs`,
  });

  writePage(path.join('analyzer', 'index.html'), 'analyzer.pug', {
    title: 'Resume Analyzer Tool',
    metaDescription: 'Tool to analyze resume content and provide improvement suggestions',
    metaKeywords: 'resume analyzer, resume optimization, resume keywords, resume improvement',
    metaUrl: `${SITE_URL}/analyzer`,
  });

  writePage(path.join('compare', 'index.html'), 'compare.pug', {
    title: 'Resume Comparison Tool',
    versions,
    metaDescription: 'Tool to compare different versions of your resume side by side',
    metaKeywords: 'resume comparison, resume versions, compare resumes, resume tool',
    metaUrl: `${SITE_URL}/compare`,
  });

  const validateRedirectPath = path.join(PUBLIC_DIR, 'validate', 'index.html');
  fs.mkdirSync(path.dirname(validateRedirectPath), { recursive: true });
  fs.writeFileSync(
    validateRedirectPath,
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Redirecting to Resume Analyzer</title>
  <meta http-equiv="refresh" content="0;url=/analyzer#target">
  <link rel="canonical" href="${SITE_URL}/analyzer">
</head>
<body>
  <p>Job matching moved to the <a href="/analyzer#target">Resume Analyzer</a>.</p>
</body>
</html>
`,
    'utf8'
  );
  console.log('Built validate/index.html (redirect)');

  writePage('404.html', '404.pug', {
    title: 'Page Not Found',
    metaDescription: 'The requested page could not be found',
    metaUrl: `${SITE_URL}/404`,
  });

  const apiPayload = {
    versions,
    count: versions.length,
    baseUrl: `${SITE_URL}/resume/`,
  };

  const apiDir = path.join(PUBLIC_DIR, 'api');
  fs.mkdirSync(apiDir, { recursive: true });
  fs.writeFileSync(
    path.join(apiDir, 'versions.json'),
    `${JSON.stringify(apiPayload, null, 2)}\n`,
    'utf8'
  );
  console.log('Built api/versions.json');

  fs.copyFileSync(OPENAPI_SOURCE, path.join(apiDir, 'openapi.yaml'));
  console.log('Built api/openapi.yaml');

  return [
    'index.html',
    path.join('docs', 'index.html'),
    path.join('analyzer', 'index.html'),
    path.join('compare', 'index.html'),
    path.join('validate', 'index.html'),
    '404.html',
    path.join('api', 'versions.json'),
    path.join('api', 'openapi.yaml'),
  ];
}

async function formatBuiltOutputs(relativePaths) {
  for (const relativePath of relativePaths) {
    const filePath = path.join(PUBLIC_DIR, relativePath);
    const input = fs.readFileSync(filePath, 'utf8');
    const config = (await prettier.resolveConfig(filePath)) || {};
    const output = await prettier.format(input, { ...config, filepath: filePath });
    fs.writeFileSync(filePath, output, 'utf8');
  }
  console.log('Formatted static build outputs with Prettier');
}

async function main() {
  const outputs = buildStaticSite();
  await formatBuiltOutputs(outputs);
}

if (require.main === module) {
  main().catch(error => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = { buildStaticSite, formatBuiltOutputs, main };
