const path = require('path');
const { parseOffice } = require('officeparser');
const WordExtractor = require('word-extractor');
const Tesseract = require('tesseract.js');
const AppError = require('./AppError');

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const EXTENSION_MAP = {
  '.txt': { kind: 'plain' },
  '.md': { kind: 'officeparser', fileType: 'md' },
  '.markdown': { kind: 'officeparser', fileType: 'md' },
  '.html': { kind: 'officeparser', fileType: 'html' },
  '.htm': { kind: 'officeparser', fileType: 'html' },
  '.csv': { kind: 'officeparser', fileType: 'csv' },
  '.rtf': { kind: 'officeparser', fileType: 'rtf' },
  '.docx': { kind: 'officeparser', fileType: 'docx' },
  '.xlsx': { kind: 'officeparser', fileType: 'xlsx' },
  '.pptx': { kind: 'officeparser', fileType: 'pptx' },
  '.odt': { kind: 'officeparser', fileType: 'odt' },
  '.ods': { kind: 'officeparser', fileType: 'ods' },
  '.odp': { kind: 'officeparser', fileType: 'odp' },
  '.pdf': { kind: 'officeparser', fileType: 'pdf', ocr: true },
  '.doc': { kind: 'word-legacy' },
  '.xls': {
    kind: 'unsupported',
    message: 'Legacy .xls is not supported. Save as .xlsx and retry.',
  },
  '.ppt': {
    kind: 'unsupported',
    message: 'Legacy .ppt is not supported. Save as .pptx and retry.',
  },
  '.png': { kind: 'image' },
  '.jpg': { kind: 'image' },
  '.jpeg': { kind: 'image' },
  '.webp': { kind: 'image' },
  '.gif': { kind: 'image' },
  '.bmp': { kind: 'image' },
  '.tif': { kind: 'image' },
  '.tiff': { kind: 'image' },
};

const SUPPORTED_EXTENSIONS = Object.keys(EXTENSION_MAP);

const SUPPORTED_ACCEPT = SUPPORTED_EXTENSIONS.join(',');

function normalizeText(text) {
  return text
    .replace(/\r\n/g, '\n')
    .replaceAll('\0', '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

function getFormatInfo(filename) {
  const extension = path.extname(filename || '').toLowerCase();
  const format = EXTENSION_MAP[extension];
  if (!format) return null;
  return { extension, ...format };
}

async function extractWithOfficeParser(buffer, options) {
  const config = { fileType: options.fileType };
  if (options.ocr) config.ocr = true;
  const ast = await parseOffice(buffer, config);
  return typeof ast.toText === 'function' ? ast.toText() : String(ast);
}

async function extractFromWordLegacy(buffer) {
  const extractor = new WordExtractor();
  const doc = await extractor.extract(buffer);
  return [doc.getBody(), doc.getHeaders(), doc.getFootnotes()].filter(Boolean).join('\n\n');
}

async function extractFromImage(buffer) {
  const { data } = await Tesseract.recognize(buffer, 'eng', { logger: () => {} });
  return data.text || '';
}

/**
 * Extract plain text from an uploaded resume/CV file.
 * @param {Buffer} buffer
 * @param {string} originalname
 * @returns {Promise<{ text: string, source: object }>}
 */
async function extractResumeText(buffer, originalname) {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new AppError('No file uploaded.', 400);
  }

  if (buffer.length > MAX_FILE_SIZE) {
    throw new AppError(`File exceeds the ${MAX_FILE_SIZE / (1024 * 1024)} MB limit.`, 400);
  }

  const format = getFormatInfo(originalname);
  if (!format) {
    throw new AppError(
      `Unsupported file type. Supported formats: ${SUPPORTED_EXTENSIONS.join(', ')}`,
      400
    );
  }

  if (format.kind === 'unsupported') {
    throw new AppError(format.message, 400);
  }

  let text = '';

  try {
    switch (format.kind) {
      case 'plain':
        text = buffer.toString('utf8');
        break;
      case 'officeparser':
        text = await extractWithOfficeParser(buffer, format);
        break;
      case 'word-legacy':
        text = await extractFromWordLegacy(buffer);
        break;
      case 'image':
        text = await extractFromImage(buffer);
        break;
      default:
        throw new AppError('Unsupported file type.', 400);
    }
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(
      `Could not read this file (${format.extension}). Ensure it is not corrupted or password-protected.`,
      422
    );
  }

  text = normalizeText(text);

  if (text.length < 10) {
    throw new AppError(
      'Could not extract enough text from this file. Try a clearer document, export as .docx/.txt, or paste manually.',
      422
    );
  }

  return {
    text,
    source: {
      filename: originalname,
      extension: format.extension,
      kind: format.kind,
      fileType: format.fileType || format.extension.replace('.', ''),
      charCount: text.length,
    },
  };
}

module.exports = {
  extractResumeText,
  getFormatInfo,
  SUPPORTED_EXTENSIONS,
  SUPPORTED_ACCEPT,
  MAX_FILE_SIZE,
};
