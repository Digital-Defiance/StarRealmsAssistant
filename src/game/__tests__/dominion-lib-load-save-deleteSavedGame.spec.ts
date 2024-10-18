import { deleteSavedGame } from '@/game/dominion-lib-load-save';
import { SaveGameStorageKey, SaveGameStorageKeyPrefix } from '@/game/constants';
import { IStorageService } from '@/game/interfaces/storage-service';
import { ISavedGameMetadata } from '@/game/interfaces/saved-game-metadata';

describe('deleteSavedGame', () => {
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
    consoleErrorSpy.mockRestore();
  });

  it('should successfully delete a saved game', () => {
    const mockSavedGames: ISavedGameMetadata[] = [
      { id: 'game1', name: 'Game 1', savedAt: new Date() },
      { id: 'game2', name: 'Game 2', savedAt: new Date() },
    ];
    mockStorageService.getItem.mockReturnValue(JSON.stringify(mockSavedGames));

    const result = deleteSavedGame('game1', mockStorageService);

    expect(result).toBe(true);
    expect(mockStorageService.getItem).toHaveBeenCalledWith(SaveGameStorageKey);
    expect(mockStorageService.setItem).toHaveBeenCalledWith(
      SaveGameStorageKey,
      expect.stringContaining('game2')
    );
    expect(mockStorageService.removeItem).toHaveBeenCalledWith(`${SaveGameStorageKeyPrefix}game1`);
  });

  it('should handle non-existent saved games list', () => {
    mockStorageService.getItem.mockReturnValue(null);

    const result = deleteSavedGame('game1', mockStorageService);

    expect(result).toBe(true);
    expect(mockStorageService.getItem).toHaveBeenCalledWith(SaveGameStorageKey);
    expect(mockStorageService.removeItem).toHaveBeenCalledWith(`${SaveGameStorageKeyPrefix}game1`);
  });

  it('should handle invalid JSON in saved games list', () => {
    mockStorageService.getItem.mockReturnValue('invalid JSON');

    const result = deleteSavedGame('game1', mockStorageService);

    expect(result).toBe(true);
    expect(mockStorageService.getItem).toHaveBeenCalledWith(SaveGameStorageKey);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error parsing saved games JSON:',
      expect.any(SyntaxError)
    );
  });

  it('should handle storage service errors', () => {
    mockStorageService.getItem.mockImplementation(() => {
      throw new Error('storageService error');
    });

    const result = deleteSavedGame('game1', mockStorageService);

    expect(result).toBe(true);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error getting saved games list:',
      expect.any(Error)
    );
  });

  it('should handle deleting a non-existent game', () => {
    const badId = 'game1';
    const mockSavedGames: ISavedGameMetadata[] = [
      { id: 'game2', name: 'Game 2', savedAt: new Date() },
    ];
    mockStorageService.getItem.mockReturnValue(JSON.stringify(mockSavedGames));

    const result = deleteSavedGame(badId, mockStorageService);

    expect(result).toBe(true);
    expect(mockStorageService.getItem).toHaveBeenCalledWith(SaveGameStorageKey);
    expect(mockStorageService.setItem).not.toHaveBeenCalled();
    expect(mockStorageService.removeItem).toHaveBeenCalledWith(
      `${SaveGameStorageKeyPrefix}${badId}`
    );
  });

  it('should handle deleting the last game in the list', () => {
    const mockSavedGames: ISavedGameMetadata[] = [
      { id: 'game1', name: 'Game 1', savedAt: new Date() },
    ];
    mockStorageService.getItem.mockReturnValue(JSON.stringify(mockSavedGames));

    const result = deleteSavedGame('game1', mockStorageService);

    expect(result).toBe(true);
    expect(mockStorageService.getItem).toHaveBeenCalledWith(SaveGameStorageKey);
    expect(mockStorageService.setItem).toHaveBeenCalledWith(SaveGameStorageKey, '[]');
    expect(mockStorageService.removeItem).toHaveBeenCalledWith(`${SaveGameStorageKeyPrefix}game1`);
  });

  // New edge case: Deleting a game with special characters in its ID
  it('should handle deleting a game with special characters in its ID', () => {
    const specialGameId = 'game/with/special?chars&';
    const mockSavedGames: ISavedGameMetadata[] = [
      { id: specialGameId, name: 'Special Game', savedAt: new Date() },
    ];
    mockStorageService.getItem.mockReturnValue(JSON.stringify(mockSavedGames));

    const result = deleteSavedGame(specialGameId, mockStorageService);

    expect(result).toBe(true);
    expect(mockStorageService.removeItem).toHaveBeenCalledWith(
      `${SaveGameStorageKeyPrefix}${specialGameId}`
    );
  });
});
