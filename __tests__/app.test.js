const request = require('supertest');
const app = require('../app');
const path = require('path');
const fs = require('fs');

describe('Express App', () => {
  test('GET / should serve the home page', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.type).toBe('text/html');
    expect(response.text).toContain('BEN-YAKOUB');
  });

  test('PDF file should exist in public directory', () => {
    const pdfPath = path.join(__dirname, '../public/resume.pdf');
    expect(fs.existsSync(pdfPath)).toBe(true);
  });

  test('GET /resume should serve the default PDF file', async () => {
    const response = await request(app).get('/resume');

    expect(response.status).toBe(200);
    expect(response.type).toBe('application/pdf');
  });

  test('GET /resume/:version should serve a specific version', async () => {
    const response = await request(app).get('/resume/default');

    expect(response.status).toBe(200);
    expect(response.type).toBe('application/pdf');
  });

  test('GET /resume/:version should reject invalid version names', async () => {
    const response = await request(app).get('/resume/Invalid-Version');

    expect(response.status).toBe(400);
  });

  test('GET /analyzer should render the analyzer page', async () => {
    const response = await request(app).get('/analyzer');

    expect(response.status).toBe(200);
    expect(response.text).toContain('Resume Analyzer');
  });

  test('GET /docs should render the documentation page', async () => {
    const response = await request(app).get('/docs');

    expect(response.status).toBe(200);
    expect(response.text).toContain('Resume API Documentation');
  });

  test('GET /validate should render the job matcher page', async () => {
    const response = await request(app).get('/validate');

    expect(response.status).toBe(200);
    expect(response.text).toContain('Resume Job Matcher');
  });

  test('GET /unknown should return 404', async () => {
    const response = await request(app).get('/does-not-exist');

    expect(response.status).toBe(404);
  });

  test('GET /analyzer/ should redirect to /analyzer', async () => {
    const response = await request(app).get('/analyzer/');
    expect(response.status).toBe(301);
    expect(response.headers.location).toBe('/analyzer');
  });
});
