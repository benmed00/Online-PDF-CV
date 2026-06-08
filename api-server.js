/**
 * Minimal Express app exposing API routes only (for Cloud Functions and testing).
 */
require('dotenv').config();

const express = require('express');
const AppError = require('./utils/AppError');
const errorHandler = require('./utils/errorHandler');
const apiRouter = require('./routes/api');
const { multerErrorHandler } = require('./routes/api');

function createApiApp() {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use('/api', apiRouter);
  app.use(multerErrorHandler);

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

  return app;
}

module.exports = { createApiApp };
