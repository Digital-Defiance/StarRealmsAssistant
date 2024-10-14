import { getSavedGamesList } from '@/game/dominion-lib-load-save';
import { ISavedGameMetadata } from '@/game/interfaces/saved-game-metadata';
import { SaveGameStorageKey } from '@/game/constants';
import { localStorageMock } from '@/__mocks__/localStorageMock';

describe('getSavedGamesList', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {
      return;
    });
  });

  it('should return an empty array if no saved games exist', () => {
    const result = getSavedGamesList();

    expect(result).toEqual([]);
    expect(localStorageMock.getItem).toHaveBeenCalledWith(SaveGameStorageKey);
  });

  it('should return a list of saved games with correct date parsing', () => {
    const mockSavedGames: ISavedGameMetadata[] = [
      { id: '1', name: 'Game 1', savedAt: new Date().toISOString() },
      { id: '2', name: 'Game 2', savedAt: new Date().toISOString() },
    ];
    localStorageMock.setItem(SaveGameStorageKey, JSON.stringify(mockSavedGames));

    const result = getSavedGamesList();

    // Ensure mock data is loaded correctly
    expect(result).toHaveLength(2); // Expect 2 items to be returned
    expect(result[0].id).toBe('1');
    expect(result[0].name).toBe('Game 1');
    expect(result[0].savedAt).toBeInstanceOf(Date);
    expect(result[1].id).toBe('2');
    expect(result[1].name).toBe('Game 2');
    expect(result[1].savedAt).toBeInstanceOf(Date);
  });

  it('should handle JSON parsing errors gracefully and return an empty array', () => {
    localStorageMock.setItem(SaveGameStorageKey, 'invalid json');

    const result = getSavedGamesList();

    expect(result).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error getting saved games list:',
      expect.any(SyntaxError)
    );
  });

  it('should handle errors from localStorage and return an empty array', () => {
    jest.spyOn(localStorageMock, 'getItem').mockImplementation(() => {
      throw new Error('Storage error');
    });

    const result = getSavedGamesList();

    expect(result).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error getting saved games list:',
      expect.any(Error)
    );
  });
});
