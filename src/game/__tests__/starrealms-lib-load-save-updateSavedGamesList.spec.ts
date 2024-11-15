import { updateSavedGamesList } from '@/game/starrealms-lib-load-save';
import { ISavedGameMetadata } from '@/game/interfaces/saved-game-metadata';
import { SaveGameStorageKey } from '@/game/constants';
import { IStorageService } from '@/game/interfaces/storage-service';

describe('updateSavedGamesList', () => {
  let mockStorageService: IStorageService;

  beforeEach(() => {
    // Mock the storage service methods
    mockStorageService = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };

    localStorage.clear(); // Clear the mock store before each test
    jest.clearAllMocks(); // Clear any mock calls between tests
  });

  it('should update localStorage when there are saved games', () => {
    const mockSavedGames: ISavedGameMetadata[] = [
      { id: '1', name: 'Game 1', savedAt: new Date() },
      { id: '2', name: 'Game 2', savedAt: new Date() },
    ];

    updateSavedGamesList(mockSavedGames, mockStorageService);

    expect(mockStorageService.setItem).toHaveBeenCalledWith(
      SaveGameStorageKey,
      JSON.stringify(mockSavedGames)
    );
    expect(mockStorageService.removeItem).not.toHaveBeenCalled(); // No removal should happen
  });

  it('should keep the empty saved games list from localStorage when the list is empty', () => {
    const emptySavedGames: ISavedGameMetadata[] = [];

    updateSavedGamesList(emptySavedGames, mockStorageService);

    expect(mockStorageService.setItem).toHaveBeenCalledWith(
      SaveGameStorageKey,
      JSON.stringify(emptySavedGames)
    );
  });

  it('should update localStorage with a large saved games array', () => {
    const largeSavedGames: ISavedGameMetadata[] = Array.from({ length: 1000 }, (_, i) => ({
      id: `${i}`,
      name: `Game ${i}`,
      savedAt: new Date(),
    }));

    updateSavedGamesList(largeSavedGames, mockStorageService);

    expect(mockStorageService.setItem).toHaveBeenCalledWith(
      SaveGameStorageKey,
      JSON.stringify(largeSavedGames)
    );
    expect(mockStorageService.removeItem).not.toHaveBeenCalled(); // No removal should happen
  });

  it('should update localStorage when the list contains one item', () => {
    const singleSavedGame: ISavedGameMetadata[] = [
      { id: '1', name: 'Game 1', savedAt: new Date() },
    ];

    updateSavedGamesList(singleSavedGame, mockStorageService);

    expect(mockStorageService.setItem).toHaveBeenCalledWith(
      SaveGameStorageKey,
      JSON.stringify(singleSavedGame)
    );
    expect(mockStorageService.removeItem).not.toHaveBeenCalled(); // No removal should happen
  });
});
