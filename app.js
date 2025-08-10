var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// Note: Routes from ./routes/index and ./routes/users are not used
// due to the wildcard route below that serves the PDF directly

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint for resume versions
app.get('/api/versions', function (req, res) {
  const fs = require('fs');
  const path = require('path');

  const resumesDir = path.join(__dirname, 'public/resumes');
  let versions = [];

  // Check if the directory exists
  if (fs.existsSync(resumesDir)) {
    // Read all files in the directory
    const files = fs.readdirSync(resumesDir);

    // Filter for PDF files and extract version names
    versions = files
      .filter(file => file.toLowerCase().endsWith('.pdf'))
      .map(file => file.replace('.pdf', ''));
  }

  // Always include default version
  if (!versions.includes('default')) {
    versions.unshift('default');
  }

  // Return JSON response
  res.json({
    versions: versions,
    count: versions.length,
    baseUrl: `${req.protocol}://${req.get('host')}/resume/`,
  });
});

// Documentation route
app.get('/docs', function (req, res) {
  // Get versions dynamically
  const fs = require('fs');
  const path = require('path');

  const resumesDir = path.join(__dirname, 'public/resumes');
  let versions = ['default'];

  if (fs.existsSync(resumesDir)) {
    const files = fs.readdirSync(resumesDir);
    const fileVersions = files
      .filter(file => file.toLowerCase().endsWith('.pdf'))
      .map(file => file.replace('.pdf', ''));

    // Combine versions, ensuring default is first and no duplicates
    versions = [...new Set([...versions, ...fileVersions])];
  }

  res.render('docs', {
    title: 'Resume API Documentation',
    versions: versions,
    metaDescription:
      'API documentation for accessing different versions of the resume in PDF format',
    metaKeywords: 'resume API, PDF API, resume versions, resume documentation',
    metaUrl: `${req.protocol}://${req.get('host')}/docs`,
  });
});

// Resume analyzer route
app.get('/analyzer', function (req, res) {
  res.render('analyzer', {
    title: 'Resume Analyzer Tool',
    metaDescription: 'Tool to analyze resume content and provide improvement suggestions',
    metaKeywords: 'resume analyzer, resume optimization, resume keywords, resume improvement',
    metaUrl: `${req.protocol}://${req.get('host')}/analyzer`,
  });
});

// Resume comparison tool route
app.get('/compare', function (req, res) {
  // Get versions dynamically
  const fs = require('fs');
  const path = require('path');

  const resumesDir = path.join(__dirname, 'public/resumes');
  let versions = ['default'];

  if (fs.existsSync(resumesDir)) {
    const files = fs.readdirSync(resumesDir);
    const fileVersions = files
      .filter(file => file.toLowerCase().endsWith('.pdf'))
      .map(file => file.replace('.pdf', ''));

    // Combine versions, ensuring default is first and no duplicates
    versions = [...new Set([...versions, ...fileVersions])];
  }

  res.render('compare', {
    title: 'Resume Comparison Tool',
    versions: versions,
    metaDescription: 'Tool to compare different versions of your resume side by side',
    metaKeywords: 'resume comparison, resume versions, compare resumes, resume tool',
    metaUrl: `${req.protocol}://${req.get('host')}/compare`,
  });
});

// Serve different resume versions based on URL parameter
app.get('/resume/:version?', function (req, res) {
  const version = req.params.version || 'default';
  const resumePath = path.join(__dirname, `public/resumes/${version}.pdf`);

  // Check if the requested version exists
  const fs = require('fs');
  if (fs.existsSync(resumePath)) {
    res.sendFile(resumePath);
  } else {
    // Fallback to default resume if requested version doesn't exist
    res.sendFile(path.join(__dirname, 'public/resume.pdf'));
  }
});

// Serve the default PDF for the root route and any other routes
app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, 'public/resume.pdf'));
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

// If this file is run directly (not required), start the server
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

  // Handle server errors
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
