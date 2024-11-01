import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import GameLog from '@/components/GameLog';
import { generateLargeGame } from '@/game/dominion-lib-simulate';
import { useGameContext } from '@/components/GameContext';
import theme from '@/components/theme';
import { ThemeProvider } from '@mui/material';

// Mock the game state with a large game
const largeGameState = generateLargeGame();

// Mock the useGameContext hook
jest.mock('@/components/GameContext', () => ({
  useGameContext: jest.fn(),
}));

describe('GameLog Performance Test', () => {
  it('renders GameLog with a large game state', () => {
    // Mock the return value of useGameContext
    (useGameContext as jest.Mock).mockReturnValue({
      gameState: largeGameState,
      setGameState: jest.fn(),
    });

    const start = performance.now();
    const { getByText } = render(
      <ThemeProvider theme={theme}>
        {' '}
        <GameLog />
      </ThemeProvider>
    );
    const end = performance.now();
    console.log(`GameLog render time: ${end - start}ms`);

    // Assert that the game log is rendered
    expect(getByText('Game Log')).toBeInTheDocument();
  });
});
