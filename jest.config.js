module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|uuid)',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  setupFiles: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '@react-native-async-storage/async-storage':
      '<rootDir>/__mocks__/@react-native-async-storage/async-storage.js',
  },
  collectCoverage: true,
  collectCoverageFrom: [
    '<rootDir>/**/*.{ts,tsx}', // Include all .ts and .tsx files
    '!<rootDir>/**/*.d.ts', // Exclude TypeScript declaration files
    '!<rootDir>/**/*test.{ts,tsx}', // Exclude test files
    '!<rootDir>/dist/**', // Exclude dist folder
    '!<rootDir>/build/**', // Exclude build folder
    '!<rootDir>/node_modules/**', // Exclude node_modules folder
    '!<rootDir>/coverage/**', // Exclude coverage folder
    '!<rootDir>/.expo/**', // Exclude .expo folder
    '!<rootDir>/devcontainer/**', // Exclude devcontainer folder
    '!<rootDir>/.vscode/**', // Exclude .vscode folder
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  moduleDirectories: ['node_modules', '<rootDir>'],
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[tj]s?(x)'],
  // Explicitly exclude __fixtures__ from test matching
  testPathIgnorePatterns: ['/node_modules/', '/__fixtures__/'],
};
