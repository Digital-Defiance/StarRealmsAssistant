import '@testing-library/jest-dom';

// Mock timers to prevent resource leaks in tests
beforeEach(() => {
  jest.clearAllTimers();
});

afterEach(() => {
  jest.clearAllTimers();
});
