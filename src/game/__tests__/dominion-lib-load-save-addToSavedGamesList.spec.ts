import { SaveGameStorageKey } from '@/game/constants';
import { addToSavedGamesList, getSavedGamesList } from '@/game/dominion-lib-load-save';
import { IStorageService } from '@/game/interfaces/storage-service';
import { ISavedGameMetadata } from '@/game/interfaces/saved-game-metadata';

describe('addToSavedGamesList', () => {
  let mockStorageService: jest.Mocked<IStorageService>;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    mockStorageService = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {
      /* do nothing */
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should add a game to an empty saved games list', () => {
    mockStorageService.getItem.mockReturnValue(null); // No saved games initially

    const newGame = { id: 'game1', name: 'Game 1', savedAt: new Date() };
    addToSavedGamesList(newGame, mockStorageService);

    expect(mockStorageService.setItem).toHaveBeenCalledWith(
      SaveGameStorageKey,
      JSON.stringify([newGame])
    );
  });

  it('should add a game to the end of an existing saved games list', () => {
    const existingGame = { id: 'game1', name: 'Game 1', savedAt: new Date(2023, 0, 1) };
    mockStorageService.getItem.mockReturnValue(JSON.stringify([existingGame]));

    const newGame = { id: 'game2', name: 'Game 2', savedAt: new Date(2023, 0, 2) };
    addToSavedGamesList(newGame, mockStorageService);

    expect(mockStorageService.setItem).toHaveBeenCalledWith(
      SaveGameStorageKey,
      JSON.stringify([existingGame, newGame])
    );
  });

  it('should update an existing game and keep it in its original position', () => {
    const game1 = { id: 'game1', name: 'Game 1', savedAt: new Date(2023, 0, 1) };
    const game2 = { id: 'game2', name: 'Game 2', savedAt: new Date(2023, 0, 2) };
    const game3 = { id: 'game3', name: 'Game 3', savedAt: new Date(2023, 0, 3) };

    mockStorageService.getItem.mockReturnValue(JSON.stringify([game1, game2, game3]));

    const updatedGame2 = { id: 'game2', name: 'Updated Game 2', savedAt: new Date(2023, 0, 4) };
    addToSavedGamesList(updatedGame2, mockStorageService);

    expect(mockStorageService.setItem).toHaveBeenCalledWith(
      SaveGameStorageKey,
      JSON.stringify([game1, updatedGame2, game3]) // game2 stays in its original position
    );
  });

  it('should maintain the correct order when adding multiple games', () => {
    const savedGames: ISavedGameMetadata[] = []; // Manually update the mock return value
    mockStorageService.getItem.mockImplementation(() => JSON.stringify(savedGames));

    const game1 = { id: 'game1', name: 'Game 1', savedAt: new Date(2023, 0, 1) };
    const game2 = { id: 'game2', name: 'Game 2', savedAt: new Date(2023, 0, 2) };
    const game3 = { id: 'game3', name: 'Game 3', savedAt: new Date(2023, 0, 3) };

    // Add game1
    savedGames.push(game1);
    addToSavedGamesList(game1, mockStorageService);
    expect(mockStorageService.setItem).toHaveBeenCalledWith(
      SaveGameStorageKey,
      JSON.stringify([game1])
    );

    // Add game2
    savedGames.push(game2);
    addToSavedGamesList(game2, mockStorageService);
    expect(mockStorageService.setItem).toHaveBeenCalledWith(
      SaveGameStorageKey,
      JSON.stringify([game1, game2])
    );

    // Add game3
    savedGames.push(game3);
    addToSavedGamesList(game3, mockStorageService);
    expect(mockStorageService.setItem).toHaveBeenCalledWith(
      SaveGameStorageKey,
      JSON.stringify([game1, game2, game3])
    );
  });

  it('should handle adding a game when storageService throws an error', () => {
    mockStorageService.setItem.mockImplementation(() => {
      throw new Error('storageService is full');
    });

    const newGame = { id: 'game1', name: 'Game 1', savedAt: new Date() };
    addToSavedGamesList(newGame, mockStorageService);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error updating saved games list:',
      expect.any(Error)
    );
  });

  it('should handle getSavedGamesList error', () => {
    mockStorageService.getItem.mockImplementation(() => {
      throw new Error('Failed to get saved games');
    });

    const savedGames = getSavedGamesList(mockStorageService);

    expect(savedGames).toEqual([]); // Should return an empty array on error
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error getting saved games list:',
      expect.any(Error)
    );
  });
});
