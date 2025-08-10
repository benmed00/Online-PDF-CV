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
      // Mock fs.existsSync to return true (directory exists)
      fs.existsSync.mockReturnValue(true);

      // Mock fs.readdirSync to return sample files without default
      fs.readdirSync.mockReturnValue(['technical.pdf', 'executive.pdf']);

      const response = await request(app).get('/api/versions');

      expect(response.status).toBe(200);
      expect(response.body.versions).toContain('default');
      expect(response.body.versions).toContain('technical');
      expect(response.body.versions).toContain('executive');
      expect(response.body.count).toBe(3);
    });
  });
});
