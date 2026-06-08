const request = require('supertest');
const app = require('../app');
const fs = require('fs');

// Mock fs functions
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  existsSync: jest.fn(),
  readdirSync: jest.fn(),
}));

describe('Resume Comparison Tool', () => {
  describe('GET /compare', () => {
    beforeEach(() => {
      // Reset mocks before each test
      jest.clearAllMocks();
    });

    test('should render compare page with default version when no resumes directory exists', async () => {
      // Mock fs.existsSync to return false (directory doesn't exist)
      fs.existsSync.mockReturnValue(false);

      const response = await request(app).get('/compare');

      expect(response.status).toBe(200);
      expect(response.text).toContain('Resume Comparison Tool');
      expect(response.text).toContain(
        'This tool allows you to compare different versions of your resume'
      );

      // Should contain default version in the select options
      expect(response.text).toContain('<option value="default">');
    });

    test('should render compare page with all available versions when resumes directory exists', async () => {
      // Mock fs.existsSync to return true (directory exists)
      fs.existsSync.mockReturnValue(true);

      // Mock fs.readdirSync to return sample files
      fs.readdirSync.mockReturnValue([
        'technical.pdf',
        'executive.pdf',
        'creative.pdf',
        'README.txt', // This should be ignored as it's not a PDF
      ]);

      const response = await request(app).get('/compare');

      expect(response.status).toBe(200);

      // Should contain all PDF versions in the select options
      expect(response.text).toContain('<option value="default">');
      expect(response.text).toContain('<option value="technical">');
      expect(response.text).toContain('<option value="executive">');
      expect(response.text).toContain('<option value="creative">');

      // Should not contain non-PDF files
      expect(response.text).not.toContain('<option value="README">');
    });
  });
});
