module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/node_modules/**',
    '!**/test/**',
    '!**/dist/**',
    '!**/coverage/**',
    '!**/*.module.ts',
    '!**/main.ts',
    '!**/index.ts'
  ],
  coverageDirectory: '../coverage',
  coverageReporters: ['text', 'lcov', 'clover', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^src/(.*)$': '<rootDir>/$1',
  },
  testTimeout: 30000,
  verbose: true,
  bail: true,
  detectOpenHandles: true,
  forceExit: true,
};
