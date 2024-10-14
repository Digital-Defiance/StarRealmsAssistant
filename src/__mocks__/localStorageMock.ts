export const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    setItem: jest.fn((key, value) => {
      store[key] = typeof value === 'string' ? value : JSON.stringify(value);
    }),
    getItem: jest.fn((key) => {
      return store[key] || null;
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index) => {
      return Object.keys(store)[index] || null;
    }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });
