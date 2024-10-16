import { saveGame } from '@/game/dominion-lib-load-save';
import { IGame } from '@/game/interfaces/game';
import { v4 as uuidv4 } from 'uuid';
import { createMockGame } from '@/__fixtures__/dominion-lib-fixtures';
import { faker } from '@faker-js/faker';
import { SaveGameStorageKey, SaveGameStorageKeyPrefix } from '@/game/constants';

// Import and set up the localStorageMock
import { localStorageMock } from '@/__mocks__/localStorageMock';

jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

jest.spyOn(console, 'error').mockImplementation(() => {
  return;
});

describe('saveGame', () => {
  const mockGame: IGame = createMockGame(2);
  let mockUUID: string;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    mockUUID = faker.string.uuid();
    (uuidv4 as jest.Mock).mockReturnValue(mockUUID);
    (console.error as jest.Mock).mockClear();
  });

  it('should default to empty saveGames json list if no saved games', () => {
    const result = saveGame(mockGame, 'Test Game');

    expect(result).toBe(true);
    expect(localStorageMock.setItem).toHaveBeenCalledTimes(2);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(SaveGameStorageKey, expect.any(String));
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      `${SaveGameStorageKeyPrefix}${mockUUID}`,
      expect.any(String)
    );
  });

  it('should save a new game successfully', () => {
    const mockGame = createMockGame(2);
    const result = saveGame(mockGame, 'Test Game');

    expect(result).toBe(true);
    expect(localStorageMock.setItem).toHaveBeenCalledTimes(2);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      `${SaveGameStorageKeyPrefix}${mockUUID}`,
      expect.any(String)
    );
    expect(localStorageMock.setItem).toHaveBeenCalledWith(SaveGameStorageKey, expect.any(String));
  });

  it('should update an existing game successfully', () => {
    const existingGameId = 'existing-game-id';
    const mockGame = createMockGame(2);
    const result = saveGame(mockGame, 'Updated Game', existingGameId);

    expect(result).toBe(true);
    expect(localStorageMock.setItem).toHaveBeenCalledTimes(2);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      `${SaveGameStorageKeyPrefix}${existingGameId}`,
      expect.any(String)
    );
    expect(localStorageMock.setItem).toHaveBeenCalledWith(SaveGameStorageKey, expect.any(String));
  });

  it('should handle empty game log and no players', () => {
    const emptyGame = { ...mockGame, players: [], log: [] };
    const result = saveGame(emptyGame, 'Empty Game');

    expect(result).toBe(true);
    expect(localStorageMock.setItem).toHaveBeenCalledTimes(2);
    const savedGameArg = (localStorageMock.setItem as jest.Mock).mock.calls[0][1];
    const parsedGame = JSON.parse(savedGameArg);
    expect(parsedGame.log).toEqual([]);
    expect(parsedGame.players).toEqual([]);
  });

  it('should handle errors when saving game', () => {
    localStorageMock.setItem.mockImplementationOnce(() => {
      throw new Error('Storage error');
    });
    const result = saveGame(mockGame, 'Error Game');

    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalledWith('Error saving game:', expect.any(Error));
    expect(localStorageMock.setItem).toHaveBeenCalledTimes(1);
  });

  it('should handle game with complex data structures', () => {
    const complexGame = createMockGame(2);
    const result = saveGame(complexGame, 'Complex Game');

    expect(result).toBe(true);
    expect(localStorageMock.setItem).toHaveBeenCalledTimes(2);
    const savedGameArg = (localStorageMock.setItem as jest.Mock).mock.calls[0][1];
    const parsedSavedGame = JSON.parse(savedGameArg);

    const expectedGame = JSON.parse(
      JSON.stringify(complexGame, (key, value) => {
        if (key === 'timestamp' && value instanceof Date) {
          return value.toISOString();
        }
        return value;
      })
    );

    expect(parsedSavedGame).toMatchObject(expectedGame);
  });

  it('should handle saving game with very long name', () => {
    const longName = 'A'.repeat(1000);
    const result = saveGame(mockGame, longName);

    expect(result).toBe(true);
    expect(localStorageMock.setItem).toHaveBeenCalledTimes(2);
    const savedGamesListArg = (localStorageMock.setItem as jest.Mock).mock.calls[1][1];
    expect(JSON.parse(savedGamesListArg)[0].name).toBe(longName);
  });

  it('should handle saving multiple games', () => {
    // Initial mock return value with one existing game
    localStorageMock.getItem.mockReturnValueOnce(
      JSON.stringify([
        { id: 'existing-id', name: 'Existing Game', savedAt: new Date().toISOString() },
      ])
    );

    const result1 = saveGame(mockGame, 'Game 1');

    // Mock return value after first save
    localStorageMock.getItem.mockReturnValueOnce(
      JSON.stringify([
        { id: 'existing-id', name: 'Existing Game', savedAt: new Date().toISOString() },
        { id: 'mock-uuid-1', name: 'Game 1', savedAt: new Date().toISOString() },
      ])
    );

    const result2 = saveGame(mockGame, 'Game 2');

    expect(result1).toBe(true);
    expect(result2).toBe(true);
    expect(localStorageMock.setItem).toHaveBeenCalledTimes(4); // 2 calls per save

    const savedGamesListArg = (localStorageMock.setItem as jest.Mock).mock.calls[3][1]; // Use the last call
    const savedGamesList = JSON.parse(savedGamesListArg);
    expect(savedGamesList).toHaveLength(3); // Existing game + 2 new games
    expect(savedGamesList).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Existing Game' }),
        expect.objectContaining({ name: 'Game 1' }),
        expect.objectContaining({ name: 'Game 2' }),
      ])
    );
  });

  it('should handle game with large number of log entries', () => {
    const largeLogGame = {
      ...mockGame,
      log: Array(1000).fill({
        id: '1',
        timestamp: new Date(),
        playerIndex: 0,
        action: 'SOME_ACTION',
      }),
    };
    const result = saveGame(largeLogGame, 'Large Log Game');

    expect(result).toBe(true);
    const savedGameArg = (localStorageMock.setItem as jest.Mock).mock.calls[0][1];
    const parsedGame = JSON.parse(savedGameArg);
    expect(parsedGame.log).toHaveLength(1000);
  });

  it('should update saved games list correctly when overwriting', () => {
    const existingGameId = 'existing-id';
    const initialSavedGames = [
      { id: existingGameId, name: 'Existing Game', savedAt: new Date().toISOString() },
      { id: 'other-id', name: 'Other Game', savedAt: new Date().toISOString() },
    ];
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(initialSavedGames));
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(initialSavedGames));

    const result = saveGame(mockGame, 'Updated Game', existingGameId);

    expect(result).toBe(true);
    expect(localStorageMock.setItem).toHaveBeenCalledTimes(2);
    expect(localStorageMock.getItem).toHaveBeenCalledTimes(2);
    const savedGamesListArg = (localStorageMock.setItem as jest.Mock).mock.calls[1][1];
    const updatedSavedGames = JSON.parse(savedGamesListArg);
    expect(updatedSavedGames).toHaveLength(2);
    expect(updatedSavedGames[0].name).toBe('Updated Game');
    expect(updatedSavedGames[1].name).toBe('Other Game');
  });
});
