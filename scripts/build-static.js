#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const pug = require('pug');
const { getResumeVersions } = require('../utils/getResumeVersions');

const ROOT = path.join(__dirname, '..');
const VIEWS_DIR = path.join(ROOT, 'views');
const PUBLIC_DIR = path.join(ROOT, 'public');
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
}

buildStaticSite();
