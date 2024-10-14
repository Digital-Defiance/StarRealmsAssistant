import { loadGame, loadGameAddLog } from '@/game/dominion-lib-load-save';
import { IGame } from '@/game/interfaces/game';
import { GameLogActionWithCount } from '@/game/enumerations/game-log-action-with-count';
import { createMockGame } from '@/__fixtures__/dominion-lib-fixtures';
import { faker } from '@faker-js/faker';
import { SaveGameStorageKeyPrefix } from '@/game/constants';
import { localStorageMock } from '@/__mocks__/localStorageMock';

// Mock loadGameAddLog
jest.mock('@/game/dominion-lib-load-save', () => ({
  ...jest.requireActual('@/game/dominion-lib-load-save'),
  loadGameAddLog: jest.fn((game) => {
    const GameLogActionWithCount = jest.requireActual(
      '@/game/enumerations/game-log-action-with-count'
    );
    game.log.push({
      id: 'mock-log-id',
      timestamp: new Date(),
      playerIndex: -1,
      action: GameLogActionWithCount.LOAD_GAME,
    });
    return game;
  }),
}));

describe('loadGame', () => {
  let consoleErrorSpy: jest.SpyInstance;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {
      /* do nothing */
    });
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {
      /* do nothing */
    });
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  it('should load a game successfully', () => {
    const mockGame: IGame = createMockGame(4);
    mockGame.log.push({
      id: faker.string.uuid(),
      timestamp: new Date(),
      playerIndex: -1,
      action: GameLogActionWithCount.SAVE_GAME,
    });
    const mockGameString = JSON.stringify(mockGame);

    localStorage.setItem(`${SaveGameStorageKeyPrefix}test-save-id`, mockGameString);

    const result = loadGame('test-save-id');

    expect(result).not.toBeNull();
    if (result !== null) {
      expect(result.players.length).toBe(4);
      expect(result.log.length).toBeGreaterThan(0);
      expect(result.log[result.log.length - 1].action).toBe(GameLogActionWithCount.LOAD_GAME);
    }
    expect(localStorage.getItem).toHaveBeenCalledWith(`${SaveGameStorageKeyPrefix}test-save-id`);
  });

  it('should return null if the game does not exist', () => {
    const id = 'non-existent-id';
    const result = loadGame(id);

    expect(result).toBeNull();
    expect(localStorage.getItem).toHaveBeenCalledWith(`${SaveGameStorageKeyPrefix}${id}`);
    expect(consoleLogSpy).toHaveBeenCalledWith(`No game found for saveId: ${id}`);
  });

  it('should handle JSON parsing errors gracefully and return null', () => {
    localStorage.setItem(`${SaveGameStorageKeyPrefix}test-save-id`, 'invalid json');

    const result = loadGame('test-save-id');

    expect(result).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error parsing game JSON:',
      expect.any(SyntaxError)
    );
  });

  it('should handle errors from localStorage and return null', () => {
    jest.spyOn(localStorage, 'getItem').mockImplementation(() => {
      throw new Error('Storage error');
    });

    const result = loadGame('test-save-id');

    expect(result).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error loading game:', expect.any(Error));
  });

  it('should handle loadGameAddLog throwing an error', () => {
    const mockGame: IGame = createMockGame(4);
    const mockGameString = JSON.stringify(mockGame);

    localStorage.setItem(`${SaveGameStorageKeyPrefix}test-save-id`, mockGameString);
    (loadGameAddLog as jest.Mock).mockImplementation(() => {
      throw new Error('loadGameAddLog error');
    });

    const result = loadGame('test-save-id');

    expect(result).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error loading game:', expect.any(Error));
  });
});
