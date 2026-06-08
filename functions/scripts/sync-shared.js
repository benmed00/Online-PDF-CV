#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const DEST = path.join(__dirname, '..', 'shared');

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function copyDir(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return;
  fs.mkdirSync(destDir, { recursive: true });
  for (const entry of fs.readdirSync(srcDir)) {
    const srcPath = path.join(srcDir, entry);
    const destPath = path.join(destDir, entry);
    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFile(srcPath, destPath);
    }
  }
}

function syncShared() {
  if (fs.existsSync(DEST)) {
    fs.rmSync(DEST, { recursive: true, force: true });
  }

  copyFile(path.join(ROOT, 'api-server.js'), path.join(DEST, 'api-server.js'));
  copyDir(path.join(ROOT, 'routes'), path.join(DEST, 'routes'));
  copyDir(path.join(ROOT, 'utils'), path.join(DEST, 'utils'));
  copyFile(path.join(ROOT, 'openapi', 'openapi.yaml'), path.join(DEST, 'openapi', 'openapi.yaml'));

  console.log('Synced shared API code to functions/shared/');
}

syncShared();
