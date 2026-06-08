const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const swaggerUi = require('swagger-ui-express');
const yaml = require('yaml');
const AppError = require('../utils/AppError');
const { ValidationError } = require('../utils/apiErrors');
const { getResumeVersions } = require('../utils/getResumeVersions');
const { analyzeResume, TARGET_ROLES } = require('../utils/resumeAnalyzer');
const {
  extractResumeText,
  MAX_FILE_SIZE,
  SUPPORTED_EXTENSIONS,
} = require('../utils/extractResumeText');
const {
  scanUploadedFile,
  isConfigured: isVirusTotalConfigured,
} = require('../utils/virusTotalScanner');
const {
  getAiResumeInsights,
  isConfigured: isOpenAiConfigured,
} = require('../utils/openAiResumeInsights');
const { extractHostedResumeVersion } = require('../utils/extractResumeVersion');
const { MAX_JOB_DESCRIPTION_CHARS } = require('../utils/jobDescriptionMatcher');

function detectApiMode() {
  if (process.env.K_SERVICE || process.env.FUNCTION_TARGET) return 'functions';
  return 'express';
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
});

const router = express.Router();

const OPENAPI_PATH = path.join(__dirname, '..', 'openapi', 'openapi.yaml');
const openapiDocument = yaml.parse(fs.readFileSync(OPENAPI_PATH, 'utf8'));

router.get('/openapi.yaml', function (req, res) {
  res.type('application/yaml').sendFile(OPENAPI_PATH);
});

router.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(openapiDocument, {
    customSiteTitle: 'Online-PDF-CV API',
  })
);

router.get('/versions', function (req, res, next) {
  try {
    const versions = getResumeVersions();
    res.json({
      versions,
      count: versions.length,
      baseUrl: `${req.protocol}://${req.get('host')}/resume/`,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/analyzer/config', function (req, res, next) {
  try {
    res.json({
      mode: detectApiMode(),
      openAi: isOpenAiConfigured(),
      virusTotal: isVirusTotalConfigured(),
      maxUploadMb: MAX_FILE_SIZE / (1024 * 1024),
      supportedUploads: SUPPORTED_EXTENSIONS,
      features: {
        uploadExtraction: true,
        hostedCvExtract: true,
        jobMatch: true,
        aiCoach: isOpenAiConfigured(),
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/analyze', async function (req, res, next) {
  try {
    const text = typeof req.body?.text === 'string' ? req.body.text : '';
    const targetRole = req.body?.targetRole;
    const useAi = req.body?.useAi !== false;
    const jobDescription =
      typeof req.body?.jobDescription === 'string' ? req.body.jobDescription.trim() : '';

    if (targetRole && !Object.prototype.hasOwnProperty.call(TARGET_ROLES, targetRole)) {
      return next(
        new AppError('Invalid target role. Use: engineering, management, or general.', 400)
      );
    }

    if (jobDescription.length > MAX_JOB_DESCRIPTION_CHARS) {
      return next(
        new AppError(
          `Job description exceeds ${MAX_JOB_DESCRIPTION_CHARS.toLocaleString()} characters.`,
          400
        )
      );
    }

    const analysis = analyzeResume(text, {
      targetRole: targetRole || 'general',
      jobDescription,
    });

    if (!analysis.success) {
      return next(
        new ValidationError(analysis.error || 'Invalid resume text', analysis.validation)
      );
    }

    let aiInsights = { available: false, skipped: true, reason: 'disabled' };
    if (useAi) {
      try {
        aiInsights = await getAiResumeInsights(text, targetRole || 'general', jobDescription);
      } catch (aiErr) {
        aiInsights = { available: false, error: aiErr.message };
      }
    }

    res.json({ ...analysis, aiInsights });
  } catch (err) {
    next(err);
  }
});

router.post('/extract-resume-version', async function (req, res, next) {
  try {
    const version = typeof req.body?.version === 'string' ? req.body.version.trim() : 'default';
    const hostingBaseUrl =
      req.body?.hostingBaseUrl ||
      process.env.HOSTING_URL ||
      process.env.SITE_URL ||
      `${req.protocol}://${req.get('host')}`;

    const payload = await extractHostedResumeVersion(version, { hostingBaseUrl });
    res.json(payload);
  } catch (err) {
    next(err);
  }
});

router.post('/extract-resume', upload.single('file'), async function (req, res, next) {
  try {
    if (!req.file) {
      return next(new AppError('No file uploaded.', 400));
    }

    const security = await scanUploadedFile(req.file.buffer, req.file.originalname);
    const result = await extractResumeText(req.file.buffer, req.file.originalname);

    res.json({ success: true, ...result, security });
  } catch (err) {
    next(err);
  }
});

function multerErrorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new AppError(`File exceeds the ${MAX_FILE_SIZE / (1024 * 1024)} MB limit.`, 400));
    }
    return next(new AppError(err.message, 400));
  }
  next(err);
}

module.exports = router;
module.exports.multerErrorHandler = multerErrorHandler;
