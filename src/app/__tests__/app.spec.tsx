import React from 'react';
import { render } from '@testing-library/react';

import App from '@/app/app';

// Mock the GameDebug component due to hljs issues
jest.mock('@/components/GameDebug', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="mock-game-debug">Mock Game Debug</div>,
  };
});

describe('App', () => {
  const originalWarn = console.warn;
  beforeAll(() => {
    // Suppress specific React Router future flag warnings during test run
    console.warn = (...args: unknown[]) => {
      const first = typeof args[0] === 'string' ? args[0] : '';
      if (
        first.includes('React Router Future Flag Warning') ||
        first.includes('Relative route resolution within Splat routes is changing') ||
        first.includes('will begin wrapping state updates in `React.startTransition`')
      ) {
        return; // swallow
      }
      originalWarn(...(args as Parameters<typeof console.warn>));
    };
  });

  afterAll(() => {
    console.warn = originalWarn;
  });
  it('should render successfully', () => {
    const { baseElement } = render(<App />);
    expect(baseElement).toBeTruthy();
  });

  it('should have a greeting as the title', () => {
    const { getByRole } = render(<App />);
    expect(getByRole('heading', { name: /Unofficial Star Realms Assistant/i })).toBeTruthy();
  });
});
