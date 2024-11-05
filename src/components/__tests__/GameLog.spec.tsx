import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import GameLog from '@/components/GameLog';
import { generateLargeGame } from '@/game/dominion-lib-simulate';
import { useGameContext } from '@/components/GameContext';
import theme from '@/components/theme';
import { ThemeProvider } from '@mui/material';
import { TabViewHandle } from '@/components/TabView';

// Mock the game state with a large game
const largeGameState = generateLargeGame();

// Mock the useGameContext hook
jest.mock('@/components/GameContext', () => ({
  useGameContext: jest.fn(),
}));

// Mock window.getComputedStyle to return valid values
jest.spyOn(window, 'getComputedStyle').mockImplementation(() => {
  return {
    marginTop: '10px',
    marginBottom: '10px',
    paddingTop: '5px',
    paddingBottom: '5px',
    borderTopWidth: '1px',
    borderBottomWidth: '1px',
    // Add other properties as needed
  } as CSSStyleDeclaration;
});

describe('GameLog Performance Test', () => {
  it('renders GameLog with a large game state', () => {
    // Mock the return value of useGameContext
    (useGameContext as jest.Mock).mockReturnValue({
      gameState: largeGameState,
      setGameState: jest.fn(),
    });

    // Mock the tabViewRef to provide valid dimensions
    const tabViewRef = {
      current: {
        tabBar: {
          getBoundingClientRect: () => ({
            height: 56, // Provide a valid height for the tabBar
          }),
        },
      },
    } as React.RefObject<TabViewHandle>;

    const start = performance.now();
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        {' '}
        <GameLog tabViewRef={tabViewRef} />
      </ThemeProvider>
    );
    const end = performance.now();
    console.log(`GameLog render time: ${end - start}ms`);

    // Assert that the game log is rendered
    expect(getByText('Game Log')).toBeInTheDocument();
  });
});
