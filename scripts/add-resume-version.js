#!/usr/bin/env node

/**
 * Script to add a new resume version
 * Usage: node scripts/add-resume-version.js <source-pdf-path> <version-name>
 * Example: node scripts/add-resume-version.js ~/Documents/my-technical-resume.pdf technical
 */

const fs = require('fs');
const path = require('path');

// Get command line arguments
const args = process.argv.slice(2);

if (args.length !== 2) {
  console.error('Error: Incorrect number of arguments');
  console.log('Usage: node scripts/add-resume-version.js <source-pdf-path> <version-name>');
  console.log(
    'Example: node scripts/add-resume-version.js ~/Documents/my-technical-resume.pdf technical'
  );
  process.exit(1);
}

const sourcePath = args[0];
const versionName = args[1];

// Validate source file exists and is a PDF
if (!fs.existsSync(sourcePath)) {
  console.error(`Error: Source file "${sourcePath}" does not exist`);
  process.exit(1);
}

if (!sourcePath.toLowerCase().endsWith('.pdf')) {
  console.error('Error: Source file must be a PDF');
  process.exit(1);
}

// Validate version name
if (!/^[a-z0-9-]+$/.test(versionName)) {
  console.error('Error: Version name must contain only lowercase letters, numbers, and hyphens');
  process.exit(1);
}

// Create destination directory if it doesn't exist
const resumesDir = path.join(__dirname, '..', 'public', 'resumes');
if (!fs.existsSync(resumesDir)) {
  console.log(`Creating directory: ${resumesDir}`);
  fs.mkdirSync(resumesDir, { recursive: true });
}

// Copy the file
const destPath = path.join(resumesDir, `${versionName}.pdf`);
try {
  fs.copyFileSync(sourcePath, destPath);
  console.log(`Success! Resume version "${versionName}" added.`);
  console.log(`It will be available at: /resume/${versionName}`);
} catch (error) {
  console.error(`Error copying file: ${error.message}`);
  process.exit(1);
}
