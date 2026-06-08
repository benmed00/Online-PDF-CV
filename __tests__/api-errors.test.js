const AppError = require('../utils/AppError');
const { ValidationError, formatApiError } = require('../utils/apiErrors');

describe('apiErrors', () => {
  test('formatApiError returns unified shape for AppError', () => {
    const prev = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const err = new AppError('Not found', 404);
    const body = formatApiError(err);

    expect(body).toEqual({
      success: false,
      status: 'fail',
      statusCode: 404,
      message: 'Not found',
      error: 'Not found',
    });

    process.env.NODE_ENV = prev;
  });

  test('formatApiError includes validation payload', () => {
    const validation = { valid: false, errors: [{ message: 'Too short' }] };
    const err = new ValidationError('Too short', validation);
    const body = formatApiError(err);

    expect(body.validation).toEqual(validation);
    expect(body.statusCode).toBe(400);
  });

  test('formatApiError masks non-operational 500 in production', () => {
    const prev = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const err = new Error('database connection leaked');
    err.statusCode = 500;
    err.isOperational = false;
    const body = formatApiError(err);

    expect(body.message).toBe('Something went wrong');

    process.env.NODE_ENV = prev;
  });
});
