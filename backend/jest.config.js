module.exports = {
  testEnvironment: 'node',
  verbose: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/tests/**',
    '!src/app.js'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.js']
};