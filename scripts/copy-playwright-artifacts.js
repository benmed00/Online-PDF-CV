#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SOURCE_DIR = path.join(ROOT, 'test-results');
const E2E_VIDEO_DIR = path.join(ROOT, 'e2e', 'artifacts', 'videos');
const E2E_SCREENSHOT_DIR = path.join(ROOT, 'e2e', 'artifacts', 'screenshots');
const DOCS_SCREENSHOT_DIR = path.join(ROOT, 'docs', 'assets', 'screenshots');
const DOCS_VIDEO_DIR = path.join(ROOT, 'docs', 'assets', 'videos');

const VIDEO_ALIASES = [
  {
    match: 'db81b-ewer-and-primary-navigation-chromium-desktop',
    dest: 'home-desktop.webm',
  },
  {
    match: 'c6291-pts-input-and-shows-results-chromium-desktop',
    dest: 'analyzer-desktop.webm',
  },
  {
    match: 'adad8-esume-versions-side-by-side-chromium-desktop',
    dest: 'compare-desktop.webm',
  },
  {
    match: 'cb22a-ow-across-all-main-sections-chromium-desktop',
    dest: 'navigation-desktop.webm',
  },
  {
    match: 'db81b-ewer-and-primary-navigation-chromium-mobile',
    dest: 'home-mobile.webm',
  },
  {
    match: 'cb22a-ow-across-all-main-sections-chromium-mobile',
    dest: 'navigation-mobile.webm',
  },
];

function copyVideos(dir) {
  if (!fs.existsSync(dir)) {
    return 0;
  }

  let copied = 0;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      copied += copyVideos(fullPath);
      continue;
    }

    if (entry.name !== 'video.webm') {
      continue;
    }

    const parentName = path.basename(dir);
    fs.mkdirSync(E2E_VIDEO_DIR, { recursive: true });
    fs.copyFileSync(fullPath, path.join(E2E_VIDEO_DIR, `${parentName}.webm`));
    copied += 1;
  }

  return copied;
}

function copyDirectoryFiles(sourceDir, destDir) {
  if (!fs.existsSync(sourceDir)) {
    return 0;
  }

  fs.mkdirSync(destDir, { recursive: true });
  let copied = 0;

  for (const file of fs.readdirSync(sourceDir)) {
    if (!file.endsWith('.png')) {
      continue;
    }

    fs.copyFileSync(path.join(sourceDir, file), path.join(destDir, file));
    copied += 1;
  }

  return copied;
}

function publishDocsVideos() {
  if (!fs.existsSync(E2E_VIDEO_DIR)) {
    return 0;
  }

  fs.mkdirSync(DOCS_VIDEO_DIR, { recursive: true });
  let copied = 0;

  for (const entry of fs.readdirSync(E2E_VIDEO_DIR)) {
    const alias = VIDEO_ALIASES.find(item => entry.includes(item.match));
    if (!alias) {
      continue;
    }

    fs.copyFileSync(path.join(E2E_VIDEO_DIR, entry), path.join(DOCS_VIDEO_DIR, alias.dest));
    copied += 1;
  }

  return copied;
}

const videoCount = copyVideos(SOURCE_DIR);
const screenshotCount = copyDirectoryFiles(E2E_SCREENSHOT_DIR, DOCS_SCREENSHOT_DIR);
const docsVideoCount = publishDocsVideos();

console.log(`Copied ${videoCount} Playwright video(s) to ${E2E_VIDEO_DIR}`);
console.log(`Published ${screenshotCount} screenshot(s) to ${DOCS_SCREENSHOT_DIR}`);
console.log(`Published ${docsVideoCount} documentation video(s) to ${DOCS_VIDEO_DIR}`);
