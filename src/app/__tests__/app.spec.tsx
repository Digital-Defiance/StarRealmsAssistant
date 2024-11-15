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
  it('should render successfully', () => {
    const { baseElement } = render(<App />);
    expect(baseElement).toBeTruthy();
  });

  it('should have a greeting as the title', () => {
    const { getByRole } = render(<App />);
    expect(getByRole('heading', { name: /Unofficial Dominion Assistant/i })).toBeTruthy();
  });
});
