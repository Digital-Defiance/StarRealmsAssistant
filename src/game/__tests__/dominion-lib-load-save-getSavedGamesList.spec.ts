import { getSavedGamesList } from '@/game/dominion-lib-load-save';
import { ISavedGameMetadataRaw } from '@/game/interfaces/saved-game-metadata-raw';
import { IStorageService } from '@/game/interfaces/storage-service';
import { SaveGameStorageKey } from '../constants';

describe('getSavedGamesList', () => {
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
      // do nothing
    });
  });

  it('should return an empty list when there are no saved games', () => {
    mockStorageService.getItem.mockReturnValue(null);

    const result = getSavedGamesList(mockStorageService);

    expect(result).toEqual([]);
    expect(mockStorageService.getItem).toHaveBeenCalledWith(SaveGameStorageKey);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should return a list of saved games when there are saved games', () => {
    const savedGames: ISavedGameMetadataRaw[] = [
      { id: '1', name: 'Game 1', savedAt: new Date().toISOString() },
      { id: '2', name: 'Game 2', savedAt: new Date().toISOString() },
    ];
    mockStorageService.getItem.mockReturnValue(JSON.stringify(savedGames));

    const result = getSavedGamesList(mockStorageService);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('1');
    expect(result[1].id).toBe('2');
    expect(mockStorageService.getItem).toHaveBeenCalledWith(SaveGameStorageKey);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should return an empty list when the saved games list contains invalid JSON', () => {
    mockStorageService.getItem.mockReturnValue('invalid json');

    const result = getSavedGamesList(mockStorageService);

    expect(result).toEqual([]);
    expect(mockStorageService.getItem).toHaveBeenCalledWith(SaveGameStorageKey);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error parsing saved games JSON:',
      expect.any(SyntaxError)
    );
  });

  it('should return an empty list when the saved games list contains valid JSON but with missing fields', () => {
    const invalidSavedGames = [{ id: '1', savedAt: new Date().toISOString() }]; // missing name
    mockStorageService.getItem.mockReturnValue(JSON.stringify(invalidSavedGames));

    const result = getSavedGamesList(mockStorageService);

    expect(result).toEqual([]);
    expect(mockStorageService.getItem).toHaveBeenCalledWith(SaveGameStorageKey);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error parsing saved games JSON:',
      expect.any(SyntaxError)
    );
  });
});
