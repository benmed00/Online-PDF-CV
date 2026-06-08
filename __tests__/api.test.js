const request = require('supertest');
const fs = require('fs');
const path = require('path');

jest.mock('../utils/virusTotalScanner', () => ({
  scanUploadedFile: jest.fn().mockResolvedValue({
    scanned: true,
    verdict: 'clean',
    provider: 'virustotal',
    stats: { malicious: 0, suspicious: 0, harmless: 70, undetected: 0 },
  }),
  isConfigured: jest.fn().mockReturnValue(false),
}));

jest.mock('../utils/openAiResumeInsights', () => ({
  getAiResumeInsights: jest.fn().mockResolvedValue({
    available: false,
    skipped: true,
    reason: 'test mock',
  }),
  isConfigured: jest.fn().mockReturnValue(false),
}));

const app = require('../app');

// Mock fs functions
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  existsSync: jest.fn(),
  readdirSync: jest.fn(),
}));

describe('API Endpoints', () => {
  describe('GET /api/versions', () => {
    beforeEach(() => {
      // Reset mocks before each test
      jest.clearAllMocks();
    });

    test('should return default version when no resumes directory exists', async () => {
      // Mock fs.existsSync to return false (directory doesn't exist)
      fs.existsSync.mockReturnValue(false);

      const response = await request(app).get('/api/versions');

      expect(response.status).toBe(200);
      expect(response.type).toBe('application/json');
      expect(response.body).toHaveProperty('versions');
      expect(response.body.versions).toEqual(['default']);
      expect(response.body.count).toBe(1);
      expect(response.body).toHaveProperty('baseUrl');
    });

    test('should return all available versions when resumes directory exists', async () => {
      // Mock fs.existsSync to return true (directory exists)
      fs.existsSync.mockReturnValue(true);

      // Mock fs.readdirSync to return sample files
      fs.readdirSync.mockReturnValue([
        'technical.pdf',
        'executive.pdf',
        'creative.pdf',
        'default.pdf',
        'README.txt', // This should be ignored as it's not a PDF
      ]);

      const response = await request(app).get('/api/versions');

      expect(response.status).toBe(200);
      expect(response.type).toBe('application/json');
      expect(response.body).toHaveProperty('versions');

      // Check that all PDF files are included and non-PDF files are excluded
      expect(response.body.versions).toContain('technical');
      expect(response.body.versions).toContain('executive');
      expect(response.body.versions).toContain('creative');
      expect(response.body.versions).toContain('default');
      expect(response.body.versions).not.toContain('README');

      // Check count matches the number of versions
      expect(response.body.count).toBe(response.body.versions.length);

      // Check baseUrl is present
      expect(response.body).toHaveProperty('baseUrl');
    });

    test('should add default version if not in directory', async () => {
      fs.existsSync.mockReturnValue(true);
      fs.readdirSync.mockReturnValue(['technical.pdf', 'executive.pdf']);

      const response = await request(app).get('/api/versions');

      expect(response.status).toBe(200);
      expect(response.body.versions).toContain('default');
      expect(response.body.versions).toContain('technical');
      expect(response.body.versions).toContain('executive');
      expect(response.body.count).toBe(3);
    });
  });

  describe('POST /api/analyze', () => {
    const validText =
      'Experienced software engineer with JavaScript, React, Node.js, AWS, Docker, and CI/CD. ' +
      'Strong leadership, communication, teamwork, and project management skills. ' +
      'Built scalable APIs and managed cross-functional teams from 2020 – Present.';

    test('should analyze valid resume text', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .send({ text: validText, targetRole: 'engineering' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.results.technicalScore).toBeGreaterThan(0);
      expect(response.body.suggestions.length).toBeGreaterThan(0);
      expect(response.body.aiInsights).toBeDefined();
    });

    test('GET /api/analyzer/config returns capability flags', async () => {
      const response = await request(app).get('/api/analyzer/config');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('openAi');
      expect(response.body).toHaveProperty('virusTotal');
      expect(response.body.maxUploadMb).toBe(10);
    });

    test('should reject empty text', async () => {
      const response = await request(app).post('/api/analyze').send({ text: '' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeTruthy();
    });

    test('should reject invalid target role', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .send({ text: validText, targetRole: 'invalid-role' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid target role');
    });

    test('should reject malformed JSON body', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .set('Content-Type', 'application/json')
        .send('{ not-json');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('JSON');
    });

    test('GET /api/unknown returns unified 404 JSON', async () => {
      const response = await request(app).get('/api/unknown-route');
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.statusCode).toBe(404);
    });
  });

  describe('POST /api/extract-resume', () => {
    test('should extract text from uploaded txt file', async () => {
      const content =
        'Senior engineer with JavaScript, React, Node, AWS, Docker, CI/CD, leadership, communication, and project management experience since 2020.';
      const response = await request(app)
        .post('/api/extract-resume')
        .attach('file', Buffer.from(content, 'utf8'), 'resume.txt');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.text).toContain('JavaScript');
      expect(response.body.source.filename).toBe('resume.txt');
      expect(response.body.security).toBeDefined();
      expect(response.body.security.verdict).toBe('clean');
    });

    test('should reject requests without a file', async () => {
      const response = await request(app).post('/api/extract-resume');
      expect(response.status).toBe(400);
    });

    test('should reject unsupported file types', async () => {
      const response = await request(app)
        .post('/api/extract-resume')
        .attach('file', Buffer.from('data'), 'resume.xyz');

      expect(response.status).toBe(400);
    });
  });
});
