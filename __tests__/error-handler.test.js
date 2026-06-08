const request = require('supertest');
const express = require('express');
const path = require('path');
const AppError = require('../utils/AppError');
const errorHandler = require('../utils/errorHandler');

function createTestApp() {
  const app = express();

  app.set('views', path.join(__dirname, '..', 'views'));
  app.set('view engine', 'pug');

  app.get('/trigger-error', (req, res, next) => {
    next(new AppError('Not found', 404));
  });

  app.get('/api/trigger-error', (req, res, next) => {
    next(new AppError('Not found', 404));
  });

  app.use((req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl}`, 404));
  });

  app.use(errorHandler);

  return app;
}

describe('Error Handler', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
  });

  test('should return JSON for API routes', async () => {
    const response = await request(app).get('/api/trigger-error');

    expect(response.status).toBe(404);
    expect(response.type).toMatch(/json/);
    expect(response.body.status).toBe('error');
    expect(response.body.message).toBe('Not found');
  });

  test('should render HTML error page for browser routes', async () => {
    const response = await request(app).get('/trigger-error');

    expect(response.status).toBe(404);
    expect(response.type).toMatch(/html/);
    expect(response.text).toContain('Not found');
    expect(response.text).toContain('Return to Home');
  });
});
