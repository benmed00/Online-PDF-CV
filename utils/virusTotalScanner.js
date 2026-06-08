const crypto = require('crypto');
const AppError = require('./AppError');
const logger = require('./logger');

const VT_API_BASE = 'https://www.virustotal.com/api/v3';
const POLL_INTERVAL_MS = 2000;
const POLL_MAX_ATTEMPTS = 20;
const MALICIOUS_BLOCK_THRESHOLD = 1;
const SUSPICIOUS_BLOCK_THRESHOLD = 3;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function isConfigured() {
  return Boolean(process.env.VIRUSTOTAL_API_KEY);
}

function evaluateVerdict(stats) {
  const malicious = stats.malicious || 0;
  const suspicious = stats.suspicious || 0;

  if (malicious >= MALICIOUS_BLOCK_THRESHOLD) return 'malicious';
  if (suspicious >= SUSPICIOUS_BLOCK_THRESHOLD) return 'suspicious';
  return 'clean';
}

function buildSecurityReport(hash, stats, meta = {}) {
  const verdict = evaluateVerdict(stats);
  const engines =
    (stats.harmless || 0) +
    (stats.undetected || 0) +
    (stats.malicious || 0) +
    (stats.suspicious || 0) +
    (stats.timeout || 0) +
    (stats.failure || 0);

  return {
    scanned: true,
    provider: 'virustotal',
    sha256: hash,
    verdict,
    stats: {
      malicious: stats.malicious || 0,
      suspicious: stats.suspicious || 0,
      harmless: stats.harmless || 0,
      undetected: stats.undetected || 0,
      timeout: stats.timeout || 0,
    },
    engines,
    ...meta,
  };
}

async function vtRequest(path, options = {}) {
  const apiKey = process.env.VIRUSTOTAL_API_KEY;
  const headers = { ...options.headers, 'x-apikey': apiKey };
  const response = await fetch(`${VT_API_BASE}${path}`, { ...options, headers });

  if (response.status === 429) {
    throw new AppError('VirusTotal rate limit reached. Please wait a minute and try again.', 503);
  }

  return response;
}

async function lookupByHash(hash) {
  const response = await vtRequest(`/files/${hash}`);
  if (response.status === 404) return null;
  if (!response.ok) {
    const detail = await response.text();
    logger.warn('VirusTotal hash lookup failed', { status: response.status, detail });
    throw new AppError('Security scan failed. Please try again in a moment.', 503);
  }

  const payload = await response.json();
  const stats = payload?.data?.attributes?.last_analysis_stats;
  if (!stats) {
    throw new AppError('Security scan returned incomplete results.', 503);
  }

  return buildSecurityReport(hash, stats, {
    source: 'cache',
    permalink: `https://www.virustotal.com/gui/file/${hash}`,
  });
}

async function uploadAndAnalyze(buffer, filename, hash) {
  const form = new FormData();
  form.append('file', new Blob([buffer]), filename || 'upload');

  const uploadResponse = await vtRequest('/files', { method: 'POST', body: form });
  if (!uploadResponse.ok) {
    const detail = await uploadResponse.text();
    logger.warn('VirusTotal upload failed', { status: uploadResponse.status, detail });
    throw new AppError('Security scan upload failed. Please try again.', 503);
  }

  const uploadPayload = await uploadResponse.json();
  const analysisId = uploadPayload?.data?.id;
  if (!analysisId) {
    throw new AppError('Security scan could not be started.', 503);
  }

  for (let attempt = 0; attempt < POLL_MAX_ATTEMPTS; attempt++) {
    const analysisResponse = await vtRequest(`/analyses/${analysisId}`);
    if (!analysisResponse.ok) {
      throw new AppError('Security scan failed while waiting for results.', 503);
    }

    const analysisPayload = await analysisResponse.json();
    const attributes = analysisPayload?.data?.attributes;
    const status = attributes?.status;

    if (status === 'completed') {
      const stats = attributes.stats;
      if (!stats) {
        throw new AppError('Security scan returned incomplete results.', 503);
      }
      return buildSecurityReport(hash, stats, {
        source: 'upload',
        analysisId,
        permalink: `https://www.virustotal.com/gui/file/${hash}`,
      });
    }

    if (status === 'queued' || status === 'in-progress') {
      await sleep(POLL_INTERVAL_MS);
      continue;
    }

    throw new AppError('Security scan ended in an unexpected state.', 503);
  }

  throw new AppError('Security scan timed out. Please try again.', 504);
}

function assertSafeToProcess(report) {
  if (report.verdict === 'malicious') {
    throw new AppError(
      `Upload blocked: ${report.stats.malicious} security engine(s) flagged this file as malicious. Do not open this file on your device.`,
      403
    );
  }

  if (report.verdict === 'suspicious') {
    throw new AppError(
      `Upload blocked: ${report.stats.suspicious} security engine(s) marked this file as suspicious. Export a clean PDF or paste text manually.`,
      403
    );
  }
}

/**
 * Scan an uploaded file with VirusTotal before processing.
 * Skips when VIRUSTOTAL_API_KEY is not set (local dev without key).
 * @param {Buffer} buffer
 * @param {string} filename
 * @returns {Promise<object>}
 */
async function scanUploadedFile(buffer, filename) {
  if (!isConfigured()) {
    logger.warn('VIRUSTOTAL_API_KEY not set — skipping upload security scan');
    return {
      scanned: false,
      skipped: true,
      reason: 'VirusTotal API key not configured on server',
    };
  }

  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new AppError('No file data to scan.', 400);
  }

  const hash = sha256(buffer);
  let report = await lookupByHash(hash);

  if (!report) {
    report = await uploadAndAnalyze(buffer, filename, hash);
  }

  assertSafeToProcess(report);
  return report;
}

module.exports = {
  scanUploadedFile,
  sha256,
  evaluateVerdict,
  isConfigured,
  MALICIOUS_BLOCK_THRESHOLD,
  SUSPICIOUS_BLOCK_THRESHOLD,
};
