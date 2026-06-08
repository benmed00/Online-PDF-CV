const fs = require('fs');
const path = require('path');
const AppError = require('./AppError');
const { RESUMES_DIR } = require('./getResumeVersions');
const { isValidVersion } = require('./validateVersion');
const { extractResumeText } = require('./extractResumeText');
const { scanUploadedFile } = require('./virusTotalScanner');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const DEFAULT_PDF = path.join(PUBLIC_DIR, 'resume.pdf');

function resolveResumePdfPath(version) {
  const slug = version || 'default';
  const versionPath = path.join(RESUMES_DIR, `${slug}.pdf`);

  if (fs.existsSync(versionPath)) {
    return { filePath: versionPath, filename: `${slug}.pdf`, version: slug };
  }

  if (slug === 'default' && fs.existsSync(DEFAULT_PDF)) {
    return { filePath: DEFAULT_PDF, filename: 'resume.pdf', version: 'default' };
  }

  if (fs.existsSync(DEFAULT_PDF)) {
    return { filePath: DEFAULT_PDF, filename: 'resume.pdf', version: slug, fallback: true };
  }

  return null;
}

async function fetchResumePdfBuffer(version, hostingBaseUrl) {
  const slug = version || 'default';
  const base = hostingBaseUrl.replace(/\/$/, '');
  const urls = [
    `${base}/resumes/${slug}.pdf`,
    slug === 'default' ? `${base}/resume.pdf` : null,
    `${base}/resume.pdf`,
  ].filter(Boolean);

  let lastError;
  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (!response.ok) continue;
      const buffer = Buffer.from(await response.arrayBuffer());
      if (buffer.length > 0) {
        const filename = url.includes('/resumes/') ? `${slug}.pdf` : 'resume.pdf';
        return { buffer, filename, version: slug, source: 'hosting', url };
      }
    } catch (err) {
      lastError = err;
    }
  }

  throw new AppError(
    lastError
      ? `Could not fetch resume PDF from hosting: ${lastError.message}`
      : 'Resume PDF not found on hosting.',
    404
  );
}

async function loadResumeVersionBuffer(version, options = {}) {
  if (!isValidVersion(version || 'default')) {
    throw new AppError('Invalid resume version slug.', 400);
  }

  const resolved = resolveResumePdfPath(version);
  if (resolved) {
    const buffer = fs.readFileSync(resolved.filePath);
    return {
      buffer,
      filename: resolved.filename,
      version: resolved.version,
      source: 'filesystem',
      fallback: resolved.fallback || false,
    };
  }

  const hostingBaseUrl = options.hostingBaseUrl || process.env.HOSTING_URL || process.env.SITE_URL;
  if (!hostingBaseUrl) {
    throw new AppError('Resume version not found.', 404);
  }

  return fetchResumePdfBuffer(version, hostingBaseUrl);
}

async function extractHostedResumeVersion(version, options = {}) {
  const loaded = await loadResumeVersionBuffer(version, options);
  const security = await scanUploadedFile(loaded.buffer, loaded.filename);
  const result = await extractResumeText(loaded.buffer, loaded.filename);

  return {
    success: true,
    text: result.text,
    source: {
      version: loaded.version,
      filename: loaded.filename,
      kind: result.kind || result.source?.kind,
      fileType: result.fileType || result.source?.fileType,
      charCount: result.text.length,
      origin: loaded.source,
      fallback: loaded.fallback || false,
      url: loaded.url,
    },
    security,
  };
}

module.exports = {
  resolveResumePdfPath,
  loadResumeVersionBuffer,
  extractHostedResumeVersion,
  fetchResumePdfBuffer,
};
