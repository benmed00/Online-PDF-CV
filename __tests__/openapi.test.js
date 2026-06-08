const fs = require('fs');
const path = require('path');
const request = require('supertest');
const yaml = require('yaml');

const OPENAPI_PATH = path.join(__dirname, '..', 'openapi', 'openapi.yaml');
const PKG_PATH = path.join(__dirname, '..', 'package.json');

const EXPECTED_PATHS = [
  '/api/versions',
  '/api/openapi.yaml',
  '/api/analyzer/config',
  '/api/analyze',
  '/api/extract-resume',
  '/resume',
  '/resume/{version}',
];

describe('OpenAPI specification', () => {
  let spec;

  beforeAll(() => {
    spec = yaml.parse(fs.readFileSync(OPENAPI_PATH, 'utf8'));
  });

  test('parses as OpenAPI 3.1', () => {
    expect(spec.openapi).toMatch(/^3\.1\./);
    expect(spec.info.title).toBe('Online-PDF-CV API');
  });

  test('info.version matches package.json', () => {
    const pkgVersion = JSON.parse(fs.readFileSync(PKG_PATH, 'utf8')).version;
    expect(spec.info.version).toBe(pkgVersion);
  });

  test('documents all expected paths', () => {
    expect(Object.keys(spec.paths).sort()).toEqual(EXPECTED_PATHS.sort());
  });

  test('marks analyzer operations as Node-runtime (Express or Cloud Function)', () => {
    const analyzerOps = [
      spec.paths['/api/analyzer/config'].get,
      spec.paths['/api/analyze'].post,
      spec.paths['/api/extract-resume'].post,
    ];
    analyzerOps.forEach(op => {
      expect(op['x-node-runtime']).toBe(true);
    });
  });
});

describe('OpenAPI HTTP routes', () => {
  const app = require('../app');

  test('GET /api/openapi.yaml serves YAML spec', async () => {
    const response = await request(app).get('/api/openapi.yaml');
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/yaml/);
    expect(response.text).toContain('openapi: 3.1');
    expect(response.text).toContain('Online-PDF-CV API');
  });

  test('GET /api/docs serves Swagger UI', async () => {
    const response = await request(app).get('/api/docs/');
    expect(response.status).toBe(200);
    expect(response.text).toContain('swagger-ui');
  });
});
