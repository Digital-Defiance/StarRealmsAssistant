import { saveGameData } from '@/game/dominion-lib-load-save';
import { IGame } from '@/game/interfaces/game';
import { IStorageService } from '@/game/interfaces/storage-service';
import { SaveGameStorageKeyPrefix } from '@/game/constants';
import { v4 as uuidv4 } from 'uuid';
import { createMockGame } from '@/__fixtures__/dominion-lib-fixtures';

jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

describe('saveGameData', () => {
  let mockStorageService: jest.Mocked<IStorageService>;
  let mockGame: IGame;

  beforeEach(() => {
    mockStorageService = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };

    mockGame = createMockGame(2);
  });

  it('should save the game data with a new ID if existingId is not provided', () => {
    const mockUuid = 'mock-uuid';
    (uuidv4 as jest.Mock).mockReturnValue(mockUuid);

    const result = saveGameData(mockGame, mockStorageService);

    expect(result).toBe(mockUuid);
    expect(mockStorageService.setItem).toHaveBeenCalledWith(
      `${SaveGameStorageKeyPrefix}${mockUuid}`,
      JSON.stringify(mockGame)
    );
  });

  it('should save the game data with the provided existingId', () => {
    const existingId = 'existing-id';

    const result = saveGameData(mockGame, mockStorageService, existingId);

    expect(result).toBe(existingId);
    expect(mockStorageService.setItem).toHaveBeenCalledWith(
      `${SaveGameStorageKeyPrefix}${existingId}`,
      JSON.stringify(mockGame)
    );
  });
});
