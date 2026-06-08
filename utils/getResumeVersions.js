const fs = require('fs');
const path = require('path');

const RESUMES_DIR = path.join(__dirname, '..', 'public', 'resumes');

function getResumeVersions() {
  let versions = ['default'];

  if (fs.existsSync(RESUMES_DIR)) {
    const fileVersions = fs
      .readdirSync(RESUMES_DIR)
      .filter(file => file.toLowerCase().endsWith('.pdf'))
      .map(file => file.replace(/\.pdf$/i, ''));

    versions = [...new Set([...versions, ...fileVersions])];
  }

  return versions;
}

module.exports = { getResumeVersions, RESUMES_DIR };
