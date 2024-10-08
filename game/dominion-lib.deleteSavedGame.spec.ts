import AsyncStorage from '@react-native-async-storage/async-storage';
import { deleteSavedGame } from '@/game/dominion-lib.load-save';
import { SaveGameStorageKey, SaveGameStorageKeyPrefix } from '@/game/constants';

jest.mock('@react-native-async-storage/async-storage');

describe('deleteSavedGame', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    // jest.restoreAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {
      /* do nothing */
    });
  });

  it('should successfully delete a saved game', async () => {
    const mockSavedGames = JSON.stringify([
      { id: 'game1', name: 'Game 1' },
      { id: 'game2', name: 'Game 2' },
    ]);
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(mockSavedGames);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);

    await deleteSavedGame('game1');

    expect(AsyncStorage.getItem).toHaveBeenCalledWith(SaveGameStorageKey);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      SaveGameStorageKey,
      JSON.stringify([{ id: 'game2', name: 'Game 2' }])
    );
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(`${SaveGameStorageKeyPrefix}game1`);
  });

  it('should handle non-existent saved games list', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);

    const result = await deleteSavedGame('game1');

    expect(result).toBe(true);
    expect(AsyncStorage.getItem).toHaveBeenCalledWith(SaveGameStorageKey);
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(`${SaveGameStorageKeyPrefix}game1`);
  });

  it('should handle invalid JSON in saved games list', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('invalid JSON');
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);

    const result = await deleteSavedGame('game1');

    expect(result).toBe(true);
    expect(AsyncStorage.getItem).toHaveBeenCalledWith(SaveGameStorageKey);
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(`${SaveGameStorageKeyPrefix}game1`);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error parsing saved games JSON:',
      expect.any(SyntaxError)
    );
  });

  it('should handle empty saved games list', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('[]');

    await deleteSavedGame('game1');

    expect(AsyncStorage.getItem).toHaveBeenCalledWith(SaveGameStorageKey);
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(`${SaveGameStorageKeyPrefix}game1`);
  });

  it('should handle AsyncStorage errors', async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('AsyncStorage error'));

    const result = await deleteSavedGame('game1');

    expect(result).toBe(false);
    expect(AsyncStorage.getItem).toHaveBeenCalledWith(SaveGameStorageKey);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error deleting saved game:', expect.any(Error));
  });

  it('should handle non-existent game', async () => {
    const mockSavedGames = JSON.stringify([{ id: 'game2', name: 'Game 2' }]);
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(mockSavedGames);
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);

    const result = await deleteSavedGame('game1');

    expect(result).toBe(true);
    expect(AsyncStorage.getItem).toHaveBeenCalledWith(SaveGameStorageKey);
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(`${SaveGameStorageKeyPrefix}game1`);
  });

  it('should handle deleting the last game in the list', async () => {
    const mockSavedGames = JSON.stringify([{ id: 'game1', name: 'Game 1' }]);
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(mockSavedGames);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);

    await deleteSavedGame('game1');

    expect(AsyncStorage.getItem).toHaveBeenCalledWith(SaveGameStorageKey);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(SaveGameStorageKey, '[]');
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(`${SaveGameStorageKeyPrefix}game1`);
  });

  it('should handle deleting a game with a very long name or special characters', async () => {
    const longGameName = 'A'.repeat(1000);
    const mockSavedGames = JSON.stringify([{ id: 'game1', name: longGameName }]);
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(mockSavedGames);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);

    await deleteSavedGame('game1');

    expect(AsyncStorage.getItem).toHaveBeenCalledWith(SaveGameStorageKey);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(SaveGameStorageKey, '[]');
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(`${SaveGameStorageKeyPrefix}game1`);
  });
});
