const request = require('supertest');
const app = require('../app');
const fs = require('fs');
const path = require('path');

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
    });
  });
});
