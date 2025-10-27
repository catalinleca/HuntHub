module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@db/(.*)$': '<rootDir>/src/db/$1',
    '^@hunthub/shared/schemas$': '<rootDir>/../../packages/shared/src/schemas/index.ts',
    '^@hunthub/shared$': '<rootDir>/../../packages/shared/src/index.ts',
    '^@hunthub/shared/(.*)$': '<rootDir>/../../packages/shared/src/$1',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json',
      diagnostics: {
        ignoreCodes: [151002], // Suppress Node16 hybrid module warning
      },
    }],
    '^.+\\.m?js$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json',
    }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@faker-js|@hunthub)/)',
  ],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
  ],
  coverageDirectory: 'coverage',
  testTimeout: 30000, // 30s for first run (MongoDB binary download)
  setupFiles: ['<rootDir>/tests/setup/env.setup.ts'], // Load env vars before anything
  setupFilesAfterEnv: ['<rootDir>/tests/setup/jest.setup.ts'], // Load after Jest is set up
  verbose: true,
};
