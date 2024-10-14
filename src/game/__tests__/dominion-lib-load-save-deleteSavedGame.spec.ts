import { deleteSavedGame } from '@/game/dominion-lib-load-save';
import { SaveGameStorageKey, SaveGameStorageKeyPrefix } from '@/game/constants';
import { localStorageMock } from '@/__mocks__/localStorageMock';

describe('deleteSavedGame', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {
      /* do nothing */
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    localStorageMock.clear();
  });

  it('should successfully delete a saved game', () => {
    const mockSavedGames = JSON.stringify([
      { id: 'game1', name: 'Game 1' },
      { id: 'game2', name: 'Game 2' },
    ]);
    localStorage.setItem(SaveGameStorageKey, mockSavedGames);
    localStorage.setItem(`${SaveGameStorageKeyPrefix}game1`, 'some game data');

    const result = deleteSavedGame('game1');
    expect(result).toBe(true);
    expect(JSON.parse(localStorage.getItem(SaveGameStorageKey) || '[]')).toEqual([
      { id: 'game2', name: 'Game 2' },
    ]);
    expect(localStorage.getItem(`${SaveGameStorageKeyPrefix}game1`)).toBeNull();
  });

  it('should handle non-existent saved games list', () => {
    const result = deleteSavedGame('game1');

    expect(result).toBe(true);
    expect(localStorage.getItem(SaveGameStorageKey)).toBeNull();
    expect(localStorage.getItem(`${SaveGameStorageKeyPrefix}game1`)).toBeNull();
  });

  it('should handle invalid JSON in saved games list', () => {
    localStorage.setItem(SaveGameStorageKey, 'invalid JSON');

    const result = deleteSavedGame('game1');

    expect(result).toBe(true);
    expect(localStorage.getItem(`${SaveGameStorageKeyPrefix}game1`)).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error parsing saved games JSON:',
      expect.any(SyntaxError)
    );
    expect(localStorage.getItem(SaveGameStorageKey)).toBe('invalid JSON'); // Changed from toBeNull()
  });

  it('should handle invalid JSON in saved games list', () => {
    localStorage.setItem(SaveGameStorageKey, 'invalid JSON');

    const result = deleteSavedGame('game1');

    expect(result).toBe(true);
    expect(localStorage.getItem(`${SaveGameStorageKeyPrefix}game1`)).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error parsing saved games JSON:',
      expect.any(SyntaxError)
    );
    expect(localStorage.getItem(SaveGameStorageKey)).toBe('invalid JSON'); // Changed from toBeNull()
  });

  it('should handle empty saved games list', () => {
    localStorage.setItem(SaveGameStorageKey, '[]');

    const result = deleteSavedGame('game1');

    expect(result).toBe(true);
    expect(localStorage.getItem(`${SaveGameStorageKeyPrefix}game1`)).toBeNull();
  });

  it('should handle localStorage errors', () => {
    const getItemMock = jest.spyOn(localStorageMock, 'getItem').mockImplementation(() => {
      throw new Error('localStorage error');
    });
    const result = deleteSavedGame('game1');
    expect(result).toBe(true);
    expect(console.error).toHaveBeenCalledWith('Error deleting saved game:', expect.any(Error));
    getItemMock.mockRestore();
  });

  it('should handle JSON parsing errors when retrieving saved games list', () => {
    localStorage.setItem(SaveGameStorageKey, 'invalid JSON');
    const result = deleteSavedGame('game1');
    expect(result).toBe(true);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error parsing saved games JSON:',
      expect.any(SyntaxError)
    );
    expect(localStorage.getItem(SaveGameStorageKey)).toBe('invalid JSON');
    expect(localStorage.getItem(`${SaveGameStorageKeyPrefix}game1`)).toBeNull();
  });

  it('should handle non-existent game', () => {
    const mockSavedGames = JSON.stringify([{ id: 'game2', name: 'Game 2' }]);
    localStorage.setItem(SaveGameStorageKey, mockSavedGames);
    const result = deleteSavedGame('game1');
    expect(result).toBe(true);
    expect(JSON.parse(localStorage.getItem(SaveGameStorageKey) || '[]')).toStrictEqual([
      { id: 'game2', name: 'Game 2' },
    ]);
    expect(localStorage.getItem(`${SaveGameStorageKeyPrefix}game1`)).toBeNull();
  });

  it('should handle deleting the last game in the list', () => {
    const mockSavedGames = JSON.stringify([{ id: 'game1', name: 'Game 1' }]);
    localStorage.setItem(SaveGameStorageKey, mockSavedGames);
    const result = deleteSavedGame('game1');
    expect(result).toBe(true);
    expect(localStorage.getItem(SaveGameStorageKey)).toBeFalsy();
    expect(localStorage.getItem(`${SaveGameStorageKeyPrefix}game1`)).toBeFalsy();
  });

  it('should handle deleting a game with a very long name or special characters', () => {
    const longGameName = 'A'.repeat(1000);
    const mockSavedGames = JSON.stringify([{ id: 'game1', name: longGameName }]);
    localStorage.setItem(SaveGameStorageKey, mockSavedGames);
    const result = deleteSavedGame('game1');
    expect(result).toBe(true);
    expect(localStorage.getItem(SaveGameStorageKey)).toBeFalsy();
    expect(localStorage.getItem(`${SaveGameStorageKeyPrefix}game1`)).toBeFalsy();
  });
});
