import { loadGameJsonFromStorage } from '@/game/starrealms-lib-load-save';
import { IStorageService } from '@/game/interfaces/storage-service';
import { SaveGameStorageKeyPrefix } from '@/game/constants';

describe('loadGameJsonFromStorage', () => {
  let mockStorageService: jest.Mocked<IStorageService>;

  beforeEach(() => {
    mockStorageService = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };
  });

  it('should return the game string if found in storage', () => {
    const saveId = 'testSaveId';
    const gameString = '{"game": "data"}';
    mockStorageService.getItem.mockReturnValue(gameString);

    const result = loadGameJsonFromStorage(saveId, mockStorageService);

    expect(mockStorageService.getItem).toHaveBeenCalledWith(`${SaveGameStorageKeyPrefix}${saveId}`);
    expect(result).toBe(gameString);
  });

  it('should return null and log an error if the game is not found in storage', () => {
    const saveId = 'testSaveId';
    mockStorageService.getItem.mockReturnValue(null);
    console.error = jest.fn();

    const result = loadGameJsonFromStorage(saveId, mockStorageService);

    expect(mockStorageService.getItem).toHaveBeenCalledWith(`${SaveGameStorageKeyPrefix}${saveId}`);
    expect(console.error).toHaveBeenCalledWith(`No game found for saveId: ${saveId}`);
    expect(result).toBeNull();
  });
});
