const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

describe('build-static script', () => {
  const publicDir = path.join(__dirname, '..', 'public');
  const builtFiles = [
    'index.html',
    path.join('docs', 'index.html'),
    path.join('analyzer', 'index.html'),
    path.join('compare', 'index.html'),
    path.join('validate', 'index.html'),
    '404.html',
    path.join('api', 'versions.json'),
    path.join('api', 'openapi.yaml'),
  ];

  beforeAll(() => {
    execSync('node scripts/build-static.js', { cwd: path.join(__dirname, '..') });
  });

  test.each(builtFiles)('should generate %s', relativePath => {
    expect(fs.existsSync(path.join(publicDir, relativePath))).toBe(true);
  });

  test('should generate home page with full-screen resume viewer', () => {
    const html = fs.readFileSync(path.join(publicDir, 'index.html'), 'utf8');
    expect(html).toContain('BEN-YAKOUB');
    expect(html).toContain('/resume');
    expect(html).toContain('resume-page');
    expect(html).not.toContain('main-header');
  });

  test('should generate versions API payload', () => {
    const payload = JSON.parse(
      fs.readFileSync(path.join(publicDir, 'api', 'versions.json'), 'utf8')
    );

    expect(payload.versions).toContain('default');
    expect(payload.count).toBeGreaterThan(0);
    expect(payload.baseUrl).toContain('/resume/');
  });

  test('should copy OpenAPI spec to public/api', () => {
    const spec = fs.readFileSync(path.join(publicDir, 'api', 'openapi.yaml'), 'utf8');
    expect(spec).toContain('openapi: 3.1');
    expect(spec).toContain('Online-PDF-CV API');
  });
});
