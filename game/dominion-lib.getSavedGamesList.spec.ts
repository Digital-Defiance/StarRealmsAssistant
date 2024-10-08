import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSavedGamesList } from '@/game/dominion-lib.load-save';
import { ISavedGameMetadata } from '@/game/interfaces/saved-game-metadata';
import { SaveGameStorageKey } from '@/game/constants';

jest.mock('@react-native-async-storage/async-storage');

describe('getSavedGamesList', () => {
  let consoleErrorSpy: jest.SpyInstance;
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {
      return;
    });
  });

  it('should return an empty array if no saved games exist', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const result = await getSavedGamesList();

    expect(result).toEqual([]);
    expect(AsyncStorage.getItem).toHaveBeenCalledWith(SaveGameStorageKey);
  });

  it('should return a list of saved games with correct date parsing', async () => {
    const mockSavedGames: ISavedGameMetadata[] = [
      { id: '1', name: 'Game 1', savedAt: new Date().toISOString() },
      { id: '2', name: 'Game 2', savedAt: new Date().toISOString() },
    ];
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockSavedGames));

    const result = await getSavedGamesList();

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('1');
    expect(result[0].name).toBe('Game 1');
    expect(result[0].savedAt).toBeInstanceOf(Date);
    expect(result[1].id).toBe('2');
    expect(result[1].name).toBe('Game 2');
    expect(result[1].savedAt).toBeInstanceOf(Date);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should handle JSON parsing errors gracefully and return an empty array', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('invalid json');

    const result = await getSavedGamesList();

    expect(result).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error getting saved games list:',
      expect.any(SyntaxError)
    );
    consoleErrorSpy.mockRestore();
  });

  it('should handle errors from AsyncStorage and return an empty array', async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

    const result = await getSavedGamesList();

    expect(result).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error getting saved games list:',
      expect.any(Error)
    );
  });
});
