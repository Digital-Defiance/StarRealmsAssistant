import { updateSavedGamesList } from '@/game/dominion-lib-load-save';
import { ISavedGameMetadata } from '@/game/interfaces/saved-game-metadata';
import { SaveGameStorageKey } from '@/game/constants';
import { localStorageMock } from '@/__mocks__/localStorageMock';

describe('updateSavedGamesList', () => {
  beforeEach(() => {
    localStorageMock.clear(); // Clear the mock store before each test
    jest.clearAllMocks(); // Clear any mock calls between tests
  });

  it('should update localStorage when there are saved games', () => {
    const mockSavedGames: ISavedGameMetadata[] = [
      { id: '1', name: 'Game 1', savedAt: new Date().toISOString() },
      { id: '2', name: 'Game 2', savedAt: new Date().toISOString() },
    ];

    updateSavedGamesList(mockSavedGames);

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      SaveGameStorageKey,
      JSON.stringify(mockSavedGames)
    );
    expect(localStorageMock.removeItem).not.toHaveBeenCalled(); // No removal should happen
  });

  it('should keep the empty saved games list from localStorage when the list is empty', () => {
    const emptySavedGames: ISavedGameMetadata[] = [];

    updateSavedGamesList(emptySavedGames);

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      SaveGameStorageKey,
      JSON.stringify(emptySavedGames)
    );
  });

  it('should update localStorage with a large saved games array', () => {
    const largeSavedGames: ISavedGameMetadata[] = Array.from({ length: 1000 }, (_, i) => ({
      id: `${i}`,
      name: `Game ${i}`,
      savedAt: new Date().toISOString(),
    }));

    updateSavedGamesList(largeSavedGames);

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      SaveGameStorageKey,
      JSON.stringify(largeSavedGames)
    );
    expect(localStorageMock.removeItem).not.toHaveBeenCalled(); // No removal should happen
  });

  it('should update localStorage when the list contains one item', () => {
    const singleSavedGame: ISavedGameMetadata[] = [
      { id: '1', name: 'Game 1', savedAt: new Date().toISOString() },
    ];

    updateSavedGamesList(singleSavedGame);

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      SaveGameStorageKey,
      JSON.stringify(singleSavedGame)
    );
    expect(localStorageMock.removeItem).not.toHaveBeenCalled(); // No removal should happen
  });
});
