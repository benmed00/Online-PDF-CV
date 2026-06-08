/**
 * Module dependencies.
 */
require('dotenv').config();

const express = require('express');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const logger = require('./utils/logger');
const AppError = require('./utils/AppError');
const errorHandler = require('./utils/errorHandler');
const { getResumeVersions, RESUMES_DIR } = require('./utils/getResumeVersions');
const { isValidVersion } = require('./utils/validateVersion');
const apiRouter = require('./routes/api');
const { multerErrorHandler } = require('./routes/api');
const indexRouter = require('./routes/index');
const { registerProcessHandlers } = require('./utils/processHandlers');

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
  if (req.path.startsWith('/api/')) return next();
  if (req.path.length > 1 && req.path.endsWith('/')) {
    return res.redirect(301, req.path.slice(0, -1));
  }
  next();
});

app.use((req, res, next) => {
  logger.http(`${req.method} ${req.url}`);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api', apiRouter);

app.use(multerErrorHandler);

app.get('/docs', function (req, res, next) {
  try {
    res.render('docs', {
      title: 'Resume API Documentation',
      versions: getResumeVersions(),
      metaDescription:
        'API documentation for accessing different versions of the resume in PDF format',
      metaKeywords: 'resume API, PDF API, resume versions, resume documentation',
      metaUrl: `${req.protocol}://${req.get('host')}/docs`,
    });
  } catch (err) {
    next(err);
  }
});

app.get('/analyzer', function (req, res) {
  res.render('analyzer', {
    title: 'Resume Analyzer Tool',
    metaDescription: 'Tool to analyze resume content and provide improvement suggestions',
    metaKeywords: 'resume analyzer, resume optimization, resume keywords, resume improvement',
    metaUrl: `${req.protocol}://${req.get('host')}/analyzer`,
  });
});

app.get('/compare', function (req, res, next) {
  try {
    res.render('compare', {
      title: 'Resume Comparison Tool',
      versions: getResumeVersions(),
      metaDescription: 'Tool to compare different versions of your resume side by side',
      metaKeywords: 'resume comparison, resume versions, compare resumes, resume tool',
      metaUrl: `${req.protocol}://${req.get('host')}/compare`,
    });
  } catch (err) {
    next(err);
  }
});

app.get('/validate', function (req, res) {
  res.redirect(301, '/analyzer#target');
});

function serveResume(req, res, next) {
  const version = req.params.version || 'default';

  if (!isValidVersion(version)) {
    return next(new AppError('Invalid resume version', 400));
  }

  const resumePath = path.join(RESUMES_DIR, `${version}.pdf`);
  const defaultPdf = path.join(__dirname, 'public', 'resume.pdf');

  const sendWithError = filePath => {
    res.sendFile(filePath, err => {
      if (err) next(err);
    });
  };

  if (fs.existsSync(resumePath)) {
    return sendWithError(resumePath);
  }

  if (fs.existsSync(defaultPdf)) {
    return sendWithError(defaultPdf);
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

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return next(new AppError('Invalid JSON body', 400));
  }
  next(err);
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
    console.log('🔍 Resume analyzer: http://localhost:' + port + '/analyzer');
    console.log('⚖️  Resume comparison: http://localhost:' + port + '/compare');
    console.log('📊 API versions: http://localhost:' + port + '/api/versions');
    console.log('');
    console.log('Press Ctrl+C to stop the server');
  });

  registerProcessHandlers(server);

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
