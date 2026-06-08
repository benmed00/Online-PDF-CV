const AppError = require('./AppError');

class ValidationError extends AppError {
  constructor(message, validation) {
    super(message, 400);
    this.validation = validation;
  }
}

function formatApiError(err) {
  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';
  const isOperational = err.isOperational !== false;

  let message = err.message || 'Something went wrong';
  if (!isOperational && isProduction && statusCode === 500) {
    message = 'Something went wrong';
  }

  const body = {
    success: false,
    status: statusCode >= 400 && statusCode < 500 ? 'fail' : 'error',
    statusCode,
    message,
    error: message,
  };

  if (err.validation) {
    body.validation = err.validation;
  }

  if (!isProduction && err.stack) {
    body.stack = err.stack;
  }

  return body;
}

module.exports = {
  ValidationError,
  formatApiError,
};
