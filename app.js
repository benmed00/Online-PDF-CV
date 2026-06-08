/**
 * Module dependencies.
 */
require('dotenv').config();

const express = require('express');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const yaml = require('yaml');
const logger = require('./utils/logger');
const AppError = require('./utils/AppError');
const errorHandler = require('./utils/errorHandler');
const { getResumeVersions, RESUMES_DIR } = require('./utils/getResumeVersions');
const { isValidVersion } = require('./utils/validateVersion');
const { analyzeResume, TARGET_ROLES } = require('./utils/resumeAnalyzer');
const {
  extractResumeText,
  MAX_FILE_SIZE,
  SUPPORTED_EXTENSIONS,
} = require('./utils/extractResumeText');
const {
  scanUploadedFile,
  isConfigured: isVirusTotalConfigured,
} = require('./utils/virusTotalScanner');
const {
  getAiResumeInsights,
  isConfigured: isOpenAiConfigured,
} = require('./utils/openAiResumeInsights');
const indexRouter = require('./routes/index');

const OPENAPI_PATH = path.join(__dirname, 'openapi', 'openapi.yaml');
const openapiDocument = yaml.parse(fs.readFileSync(OPENAPI_PATH, 'utf8'));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
});

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
        frameSrc: ["'self'"],
      },
    },
  })
);

app.use((req, res, next) => {
  logger.http(`${req.method} ${req.url}`);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get('/api/versions', function (req, res) {
  const versions = getResumeVersions();

  res.json({
    versions,
    count: versions.length,
    baseUrl: `${req.protocol}://${req.get('host')}/resume/`,
  });
});

app.get('/api/analyzer/config', function (req, res) {
  res.json({
    openAi: isOpenAiConfigured(),
    virusTotal: isVirusTotalConfigured(),
    maxUploadMb: MAX_FILE_SIZE / (1024 * 1024),
    supportedUploads: SUPPORTED_EXTENSIONS,
  });
});

app.post('/api/analyze', async function (req, res, next) {
  try {
    const text = typeof req.body?.text === 'string' ? req.body.text : '';
    const targetRole = req.body?.targetRole;
    const useAi = req.body?.useAi !== false;

    if (targetRole && !Object.prototype.hasOwnProperty.call(TARGET_ROLES, targetRole)) {
      return next(
        new AppError('Invalid target role. Use: engineering, management, or general.', 400)
      );
    }

    const analysis = analyzeResume(text, { targetRole: targetRole || 'general' });

    if (!analysis.success) {
      return res.status(400).json({
        success: false,
        error: analysis.error,
        validation: analysis.validation,
      });
    }

    let aiInsights = { available: false, skipped: true, reason: 'disabled' };
    if (useAi) {
      try {
        aiInsights = await getAiResumeInsights(text, targetRole || 'general');
      } catch (aiErr) {
        aiInsights = { available: false, error: aiErr.message };
      }
    }

    res.json({ ...analysis, aiInsights });
  } catch (err) {
    next(err);
  }
});

app.post('/api/extract-resume', upload.single('file'), function (req, res, next) {
  if (!req.file) {
    return next(new AppError('No file uploaded.', 400));
  }

  scanUploadedFile(req.file.buffer, req.file.originalname)
    .then(security =>
      extractResumeText(req.file.buffer, req.file.originalname).then(result => ({
        result,
        security,
      }))
    )
    .then(({ result, security }) => {
      res.json({ success: true, ...result, security });
    })
    .catch(next);
});

app.get('/api/openapi.yaml', function (req, res) {
  res.type('application/yaml').sendFile(OPENAPI_PATH);
});

app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(openapiDocument, {
    customSiteTitle: 'Online-PDF-CV API',
  })
);

app.use(function (err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new AppError(`File exceeds the ${MAX_FILE_SIZE / (1024 * 1024)} MB limit.`, 400));
    }
    return next(new AppError(err.message, 400));
  }
  next(err);
});

app.get('/docs', function (req, res) {
  res.render('docs', {
    title: 'Resume API Documentation',
    versions: getResumeVersions(),
    metaDescription:
      'API documentation for accessing different versions of the resume in PDF format',
    metaKeywords: 'resume API, PDF API, resume versions, resume documentation',
    metaUrl: `${req.protocol}://${req.get('host')}/docs`,
  });
});

app.get('/analyzer', function (req, res) {
  res.render('analyzer', {
    title: 'Resume Analyzer Tool',
    metaDescription: 'Tool to analyze resume content and provide improvement suggestions',
    metaKeywords: 'resume analyzer, resume optimization, resume keywords, resume improvement',
    metaUrl: `${req.protocol}://${req.get('host')}/analyzer`,
  });
});

app.get('/compare', function (req, res) {
  res.render('compare', {
    title: 'Resume Comparison Tool',
    versions: getResumeVersions(),
    metaDescription: 'Tool to compare different versions of your resume side by side',
    metaKeywords: 'resume comparison, resume versions, compare resumes, resume tool',
    metaUrl: `${req.protocol}://${req.get('host')}/compare`,
  });
});

function serveResume(req, res, next) {
  const version = req.params.version || 'default';

  if (!isValidVersion(version)) {
    return next(new AppError('Invalid resume version', 400));
  }

  const resumePath = path.join(RESUMES_DIR, `${version}.pdf`);
  const defaultPdf = path.join(__dirname, 'public', 'resume.pdf');

  if (fs.existsSync(resumePath)) {
    return res.sendFile(resumePath);
  }

  if (fs.existsSync(defaultPdf)) {
    return res.sendFile(defaultPdf);
  }

  next(new AppError('Resume not found', 404));
}

app.get('/resume', serveResume);
app.get('/resume/:version', serveResume);

app.use('/', indexRouter);

app.use(express.static(path.join(__dirname, 'public'), { index: false }));

app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorHandler);

module.exports = app;

/* istanbul ignore next */
if (require.main === module) {
  const port = process.env.PORT || 3000;

  console.log('🚀 Starting server directly from app.js...');
  console.log('📦 Application: benyakoub-cv');
  console.log('🔧 Environment:', process.env.NODE_ENV || 'development');
  console.log('🌐 Port:', port);

  const server = app.listen(port, function () {
    console.log('✅ Server successfully started!');
    console.log('🌍 Local URL: http://localhost:' + port);
    console.log('📄 Your resume is available at: http://localhost:' + port);
    console.log('📚 API documentation: http://localhost:' + port + '/docs');
    console.log('📋 OpenAPI spec: http://localhost:' + port + '/api/openapi.yaml');
    console.log('🔧 Swagger UI: http://localhost:' + port + '/api/docs');
    console.log('🔍 Resume analyzer: http://localhost:' + port + '/analyzer');
    console.log('⚖️  Resume comparison: http://localhost:' + port + '/compare');
    console.log('📊 API versions: http://localhost:' + port + '/api/versions');
    console.log('');
    console.log('Press Ctrl+C to stop the server');
  });

  server.on('error', function (error) {
    if (error.code === 'EADDRINUSE') {
      console.error('🚫 Error: Port ' + port + ' is already in use');
      console.error('💡 Try using a different port: SET PORT=3001 && npm run dev');
    } else {
      console.error('❌ Server error:', error.message);
    }
    process.exit(1);
  });
}
