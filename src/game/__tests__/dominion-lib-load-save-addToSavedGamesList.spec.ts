import { SaveGameStorageKey } from '@/game/constants';
import { addToSavedGamesList, getSavedGamesList } from '@/game/dominion-lib-load-save';
import { localStorageMock } from '@/__mocks__/localStorageMock';

describe('addToSavedGamesList', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  it('should add a game to an empty saved games list', () => {
    const newGame = { id: 'game1', name: 'Game 1', savedAt: new Date() };
    addToSavedGamesList(newGame);

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      SaveGameStorageKey,
      JSON.stringify([newGame])
    );
  });

  it('should add a game to the beginning of an existing saved games list', () => {
    const existingGame = { id: 'game1', name: 'Game 1', savedAt: new Date(2023, 0, 1) };
    localStorageMock.setItem(SaveGameStorageKey, JSON.stringify([existingGame]));

    const newGame = { id: 'game2', name: 'Game 2', savedAt: new Date(2023, 0, 2) };
    addToSavedGamesList(newGame);

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      SaveGameStorageKey,
      JSON.stringify([newGame, existingGame])
    );
  });

  it('should handle adding a game with the same ID as an existing game', () => {
    const existingGame = { id: 'game1', name: 'Game 1', savedAt: new Date(2023, 0, 1) };
    localStorageMock.setItem(SaveGameStorageKey, JSON.stringify([existingGame]));

    const updatedGame = { id: 'game1', name: 'Updated Game 1', savedAt: new Date(2023, 0, 2) };
    addToSavedGamesList(updatedGame);

    expect(localStorageMock.setItem).toHaveBeenLastCalledWith(
      SaveGameStorageKey,
      JSON.stringify([updatedGame])
    );

    const savedGames = getSavedGamesList();
    expect(savedGames).toEqual([updatedGame]);
  });

  it('should maintain the correct order when adding multiple games', () => {
    const game1 = { id: 'game1', name: 'Game 1', savedAt: new Date(2023, 0, 1) };
    const game2 = { id: 'game2', name: 'Game 2', savedAt: new Date(2023, 0, 2) };
    const game3 = { id: 'game3', name: 'Game 3', savedAt: new Date(2023, 0, 3) };

    addToSavedGamesList(game1);
    addToSavedGamesList(game2);
    addToSavedGamesList(game3);

    const savedGames = getSavedGamesList();
    expect(savedGames).toEqual([game3, game2, game1]);
  });

  it('should handle adding a game with a future date', () => {
    const existingGame = { id: 'game1', name: 'Game 1', savedAt: new Date(2023, 0, 1) };
    localStorageMock.setItem(SaveGameStorageKey, JSON.stringify([existingGame]));

    const futureGame = { id: 'game2', name: 'Future Game', savedAt: new Date(2025, 0, 1) };
    addToSavedGamesList(futureGame);

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      SaveGameStorageKey,
      JSON.stringify([futureGame, existingGame])
    );
  });

  it('should handle adding a game when localStorage throws an error', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('localStorage is full');
    });

    const newGame = { id: 'game1', name: 'Game 1', savedAt: new Date() };
    addToSavedGamesList(newGame);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error updating saved games list:',
      expect.any(Error)
    );
    consoleErrorSpy.mockRestore();
  });
});
