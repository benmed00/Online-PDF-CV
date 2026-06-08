const logger = require('./logger');
const { formatApiError } = require('./apiErrors');

const errorHandler = (err, req, res, next) => {
  logger.error(err.message, { stack: err.stack });

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong';

  const wantsJson =
    req.originalUrl.startsWith('/api/') || (req.accepts('json') && !req.accepts('html'));

  if (wantsJson) {
    return res.status(statusCode).json(formatApiError(err));
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const isOperational = err.isOperational !== false;
  const displayMessage =
    !isOperational && isProduction && statusCode === 500 ? 'Something went wrong' : message;

  res.status(statusCode);
  res.render('error', {
    title: `Error ${statusCode}`,
    message: displayMessage,
    error: process.env.NODE_ENV === 'development' ? err : { status: statusCode },
  });
};

module.exports = errorHandler;
