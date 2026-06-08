const request = require('supertest');
const { createApiApp } = require('../api-server');

describe('API server (Cloud Functions entry)', () => {
  const app = createApiApp();

  test('GET /api/analyzer/config returns JSON', async () => {
    const response = await request(app).get('/api/analyzer/config');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('maxUploadMb');
  });

  test('POST /api/analyze with empty text returns unified error shape', async () => {
    const response = await request(app).post('/api/analyze').send({ text: '' });
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBeTruthy();
    expect(response.body.validation).toBeDefined();
  });

  test('unknown API path returns 404 JSON', async () => {
    const response = await request(app).get('/api/unknown-endpoint');
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.statusCode).toBe(404);
  });

  test('malformed JSON returns 400', async () => {
    const response = await request(app)
      .post('/api/analyze')
      .set('Content-Type', 'application/json')
      .send('{ invalid json');

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('JSON');
  });
});
