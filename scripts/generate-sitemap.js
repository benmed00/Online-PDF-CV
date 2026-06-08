#!/usr/bin/env node

/**
 * Script to generate a sitemap.xml file for the resume site
 * Usage: node scripts/generate-sitemap.js <base-url>
 * Example: node scripts/generate-sitemap.js https://resume.example.com
 */

const fs = require('fs');
const path = require('path');

// Get command line arguments
const args = process.argv.slice(2);

if (args.length !== 1) {
  console.error('Error: Please provide a base URL');
  console.log('Usage: node scripts/generate-sitemap.js <base-url>');
  console.log('Example: node scripts/generate-sitemap.js https://resume.example.com');
  process.exit(1);
}

const baseUrl = args[0].trim();

// Validate base URL
if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
  console.error('Error: Base URL must start with http:// or https://');
  process.exit(1);
}

// Remove trailing slash if present
const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

// Define the paths to include in the sitemap
const staticPaths = ['/', '/docs', '/analyzer', '/compare'];

// Get resume versions
const resumesDir = path.join(__dirname, '..', 'public', 'resumes');
let resumeVersions = [];

if (fs.existsSync(resumesDir)) {
  const files = fs.readdirSync(resumesDir);
  resumeVersions = files
    .filter(file => file.toLowerCase().endsWith('.pdf'))
    .map(file => `/resume/${file.replace('.pdf', '')}`);
}

// Always include default resume
if (!resumeVersions.includes('/resume/default')) {
  resumeVersions.push('/resume/default');
}

// Combine all paths
const allPaths = [...staticPaths, ...resumeVersions];

// Generate sitemap XML
const today = new Date().toISOString().split('T')[0];
let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

allPaths.forEach(path => {
  sitemap += `  <url>
    <loc>${normalizedBaseUrl}${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${path === '/' ? '1.0' : '0.8'}</priority>
  </url>
`;
});

sitemap += `</urlset>`;

// Write sitemap to file
const sitemapPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
fs.writeFileSync(sitemapPath, sitemap);

console.log(`Sitemap generated at: ${sitemapPath}`);
console.log(`Included ${allPaths.length} URLs in the sitemap`);
console.log('Remember to add the following to your robots.txt file:');
console.log(`Sitemap: ${normalizedBaseUrl}/sitemap.xml`);
