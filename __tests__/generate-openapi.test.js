const fs = require('fs');
const path = require('path');
const yaml = require('yaml');
const { generateOpenApiSpec, OUTPUT_PATH, JSDOC_ROUTES } = require('../scripts/generate-openapi');

const EXPECTED_PATHS = [
  '/api/versions',
  '/api/openapi.yaml',
  '/api/analyzer/config',
  '/api/analyze',
  '/api/extract-resume',
  '/resume',
  '/resume/{version}',
];

describe('generate-openapi script', () => {
  test('JSDoc routes file exists', () => {
    expect(fs.existsSync(JSDOC_ROUTES)).toBe(true);
  });

  test('generates openapi.yaml with all expected paths', () => {
    const spec = generateOpenApiSpec();
    expect(Object.keys(spec.paths).sort()).toEqual(EXPECTED_PATHS.sort());

    const written = yaml.parse(fs.readFileSync(OUTPUT_PATH, 'utf8'));
    expect(written.openapi).toMatch(/^3\.1\./);
    expect(written.components.schemas.ErrorResponse).toBeDefined();
  });

  test('generated GET /api/versions includes 4xx response for Redocly', () => {
    const spec = yaml.parse(fs.readFileSync(OUTPUT_PATH, 'utf8'));
    expect(spec.paths['/api/versions'].get.responses['404']).toBeDefined();
    expect(spec.paths['/api/analyzer/config'].get.responses['404']).toBeDefined();
  });
});
