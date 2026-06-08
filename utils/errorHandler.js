const logger = require('./logger');

const errorHandler = (err, req, res, next) => {
  logger.error(err.message, { stack: err.stack });

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong';

  const wantsJson =
    req.originalUrl.startsWith('/api/') || (req.accepts('json') && !req.accepts('html'));

  if (wantsJson) {
    return res.status(statusCode).json({
      status: 'error',
      statusCode,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
  }

  res.status(statusCode);
  res.render('error', {
    title: `Error ${statusCode}`,
    message,
    error: process.env.NODE_ENV === 'development' ? err : { status: statusCode },
  });
};

module.exports = errorHandler;
