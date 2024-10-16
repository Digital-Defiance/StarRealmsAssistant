import { EmptyGameState } from '@/game/dominion-lib';
import { IGame } from '@/game/interfaces/game';
import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the shape of the context
interface GameContextProps {
  gameState: IGame;
  setGameState: React.Dispatch<React.SetStateAction<IGame>>;
}

// Create the context
const GameContext = createContext<GameContextProps | undefined>(undefined);

// Custom hook to use the GameContext
export const useGameContext = (): GameContextProps => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};

// Custom provider component
export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<IGame>(EmptyGameState);

  // Stabilize the context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(() => ({ gameState, setGameState }), [gameState]);

  return <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>;
};
