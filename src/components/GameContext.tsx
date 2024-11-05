import { saveGame } from '@/game/dominion-lib-load-save';
import { IGame } from '@/game/interfaces/game';
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
  useEffect,
  SetStateAction,
  Dispatch,
  FC,
} from 'react';
import { LocalStorageService } from '@/game/local-storage-service';
import { deepClone } from '@/game/utils';
import { AutoSaveGameSaveId, AutoSaveGameSaveName, EmptyGameState } from '@/game/constants';

// Define the shape of the context
interface GameContextProps {
  gameState: IGame;
  setGameState: Dispatch<SetStateAction<IGame>>;
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
export const GameProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [gameState, setGameState] = useState<IGame>(EmptyGameState);

  useEffect(() => {
    if (gameState.log.length === 0) {
      return;
    }
    const storageService = new LocalStorageService();
    // the saved game branches from the active game and has the save game entry at the top of the log
    // saveGame adds a new entry to the log
    const newState = deepClone<IGame>(gameState);
    saveGame(newState, AutoSaveGameSaveName, storageService, AutoSaveGameSaveId);
  }, [gameState]);

  // Stabilize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({ gameState, setGameState }), [gameState]);

  return <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>;
};
