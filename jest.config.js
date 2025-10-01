module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.tsx',
    '!src/setupTests.ts',
    '!src/**/__tests__/**',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    // Stricter thresholds for critical services
    './src/services/': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  // MAANG standards: Fast, isolated, deterministic tests
  testTimeout: 10000,
  maxWorkers: '50%',
  // Fail fast on first error in CI
  bail: process.env.CI ? 1 : 0,
  // Clear mocks between tests
  clearMocks: true,
  restoreMocks: true,
  // Verbose output for debugging
  verbose: process.env.CI ? false : true,
};
