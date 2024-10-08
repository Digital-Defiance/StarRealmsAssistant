import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveGame } from '@/game/dominion-lib.load-save';
import { IGame } from '@/game/interfaces/game';
import { v4 as uuidv4 } from 'uuid';
import { createMockGame } from '@/__fixtures__/dominion-lib.fixtures';
import { faker } from '@faker-js/faker';
import { SaveGameStorageKey } from '@/game/constants';

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
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify([]));
    mockUUID = faker.string.uuid();
    (uuidv4 as jest.Mock).mockReturnValue(mockUUID);
    (console.error as jest.Mock).mockClear();
  });

  it('should default to empty saveGames json list if bad json', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    await saveGame(mockGame, 'Test Game');

    expect(AsyncStorage.setItem).toHaveBeenCalledTimes(2);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(SaveGameStorageKey, expect.any(String));
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      `@dominion_game_${mockUUID}`,
      expect.any(String)
    );
  });

  it('should save a new game successfully', async () => {
    const mockGame = createMockGame(2);
    const result = await saveGame(mockGame, 'Test Game');

    expect(result).toBe(true);
    expect(AsyncStorage.setItem).toHaveBeenCalledTimes(2);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      `@dominion_game_${mockUUID}`,
      expect.any(String)
    );
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(SaveGameStorageKey, expect.any(String));
  });

  it('should update an existing game successfully', async () => {
    const existingGameId = 'existing-game-id';
    const mockGame = createMockGame(2);
    const result = await saveGame(mockGame, 'Updated Game', existingGameId);

    expect(result).toBe(true);
    expect(AsyncStorage.setItem).toHaveBeenCalledTimes(2);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      `@dominion_game_${existingGameId}`,
      expect.any(String)
    );
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(SaveGameStorageKey, expect.any(String));
  });

  it('should handle empty game log and no players', async () => {
    const emptyGame = { ...mockGame, players: [], log: [] };
    const result = await saveGame(emptyGame, 'Empty Game');

    expect(result).toBe(true);
    expect(AsyncStorage.setItem).toHaveBeenCalledTimes(2);
    const savedGameArg = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1];
    const parsedGame = JSON.parse(savedGameArg);
    expect(parsedGame.log).toEqual([]);
    expect(parsedGame.players).toEqual([]);
  });

  it('should handle errors when saving game', async () => {
    (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));
    const result = await saveGame(mockGame, 'Error Game');

    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalledWith('Error saving game:', expect.any(Error));
    expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
  });

  it('should handle game with complex data structures', async () => {
    const complexGame = createMockGame(2);
    const result = await saveGame(complexGame, 'Complex Game');

    expect(result).toBe(true);
    expect(AsyncStorage.setItem).toHaveBeenCalledTimes(2);
    const savedGameArg = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1];
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

  it('should handle saving game with very long name', async () => {
    const longName = 'A'.repeat(1000);
    const result = await saveGame(mockGame, longName);

    expect(result).toBe(true);
    expect(AsyncStorage.setItem).toHaveBeenCalledTimes(2);
    const savedGamesListArg = (AsyncStorage.setItem as jest.Mock).mock.calls[1][1];
    expect(JSON.parse(savedGamesListArg)[0].name).toBe(longName);
  });

  it('should handle saving multiple games', async () => {
    // Initial mock return value with one existing game
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
      JSON.stringify([
        { id: 'existing-id', name: 'Existing Game', savedAt: new Date().toISOString() },
      ])
    );

    const result1 = await saveGame(mockGame, 'Game 1');

    // Mock return value after first save
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
      JSON.stringify([
        { id: 'existing-id', name: 'Existing Game', savedAt: new Date().toISOString() },
        { id: 'mock-uuid-1', name: 'Game 1', savedAt: new Date().toISOString() },
      ])
    );

    const result2 = await saveGame(mockGame, 'Game 2');

    expect(result1).toBe(true);
    expect(result2).toBe(true);
    expect(AsyncStorage.setItem).toHaveBeenCalledTimes(4); // 2 calls per save

    const savedGamesListArg = (AsyncStorage.setItem as jest.Mock).mock.calls[3][1]; // Use the last call
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

  it('should handle game with large number of log entries', async () => {
    const largeLogGame = {
      ...mockGame,
      log: Array(1000).fill({
        id: '1',
        timestamp: new Date(),
        playerIndex: 0,
        action: 'SOME_ACTION',
      }),
    };
    const result = await saveGame(largeLogGame, 'Large Log Game');

    expect(result).toBe(true);
    const savedGameArg = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1];
    const parsedGame = JSON.parse(savedGameArg);
    expect(parsedGame.log).toHaveLength(1000);
  });

  it('should update saved games list correctly when overwriting', async () => {
    const existingGameId = 'existing-id';
    const initialSavedGames = [
      { id: existingGameId, name: 'Existing Game', savedAt: new Date().toISOString() },
      { id: 'other-id', name: 'Other Game', savedAt: new Date().toISOString() },
    ];
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(initialSavedGames));

    const result = await saveGame(mockGame, 'Updated Game', existingGameId);

    expect(result).toBe(true);
    expect(AsyncStorage.setItem).toHaveBeenCalledTimes(2);
    expect(AsyncStorage.getItem).toHaveBeenCalledTimes(1);
    expect(AsyncStorage.removeItem).not.toHaveBeenCalled();
    const savedGamesListArg = (AsyncStorage.setItem as jest.Mock).mock.calls[1][1];
    const updatedSavedGames = JSON.parse(savedGamesListArg);
    expect(updatedSavedGames).toHaveLength(2);
    expect(updatedSavedGames[0].name).toBe('Updated Game');
    expect(updatedSavedGames[1].name).toBe('Other Game');
  });
});
