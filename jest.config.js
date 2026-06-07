module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'app.js',
    'routes/index.js',
    'utils/**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**',
  ],
  coverageThreshold: {
    global: {
      statements: 75,
      branches: 50,
      functions: 75,
      lines: 75,
    },
  },
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  testPathIgnorePatterns: ['/node_modules/', '/coverage/', '/e2e/'],
};
