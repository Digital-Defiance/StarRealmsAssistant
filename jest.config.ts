module.exports = {
  displayName: 'dominion-assistant',
  preset: 'ts-jest', // Use 'ts-jest' preset for TypeScript support
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  setupFiles: ['jest-localstorage-mock'],
  collectCoverage: true,
  collectCoverageFrom: [
    '<rootDir>/src/**/*.{ts,tsx}',
    '!<rootDir>/src/**/*.d.ts',
    '!<rootDir>/src/**/*.test.{ts,tsx}',
    '!<rootDir>/src/**/*.spec.{ts,tsx}',
    '!<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
    '!<rootDir>/src/**/__mocks__/**',
  ],
  coverageDirectory: './coverage/dominion-assistant',
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  moduleDirectories: ['node_modules', 'src'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy', // Mock CSS imports
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.[jt]s?(x)',
    '<rootDir>/src/**/*(*.)@(spec|test).[jt]s?(x)',
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[tj]s?(x)',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/__fixtures__/', '/e2e/'],
  transform: {
    // Pass ts-jest options directly in the transformer
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.json' }],
    // Use babel-jest for JavaScript files (optional, if you have JS files)
    '^.+\\.(js|jsx)$': 'babel-jest',
    // Handle static assets and CSS modules
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
  },
  // Removed the deprecated 'globals' key
};
