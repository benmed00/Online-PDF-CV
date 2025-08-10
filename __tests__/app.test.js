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
    // Mock the sendFile method since we can't actually send a PDF in the test
    const mockSendFile = jest.fn();
    const req = { params: {} }; // Add params object
    const res = { sendFile: mockSendFile };

    // Get the route handler
    const routeHandler = app._router.stack
      .filter(layer => layer.route && layer.route.path === '/resume/:version?')
      .map(layer => layer.route.stack[0].handle)[0];

    // Call the route handler with mock req/res
    routeHandler(req, res);

    // Check that sendFile was called
    expect(mockSendFile).toHaveBeenCalled();
  });

  test('GET /resume/version should serve the specific version if it exists', async () => {
    // Mock the fs and sendFile methods
    const originalExistsSync = fs.existsSync;
    const mockSendFile = jest.fn();

    // Mock existsSync to return true for a specific version
    fs.existsSync = jest.fn(path => {
      if (path.includes('technical.pdf')) {
        return true;
      }
      return originalExistsSync(path);
    });

    // Get the route handler
    const routeHandler = app._router.stack
      .filter(layer => layer.route && layer.route.path === '/resume/:version?')
      .map(layer => layer.route.stack[0].handle)[0];

    // Call the route handler with mock req/res
    const req = { params: { version: 'technical' } };
    const res = { sendFile: mockSendFile };
    routeHandler(req, res);

    // Check that sendFile was called with the correct path
    expect(mockSendFile).toHaveBeenCalled();
    expect(mockSendFile.mock.calls[0][0]).toContain('technical.pdf');

    // Restore the original existsSync
    fs.existsSync = originalExistsSync;
  });
});
