import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadGame, loadGameAddLog } from '@/game/dominion-lib.load-save';
import { IGame } from '@/game/interfaces/game';
import { GameLogActionWithCount } from '@/game/enumerations/game-log-action-with-count';
import { createMockGame } from '@/__fixtures__/dominion-lib.fixtures';
import { faker } from '@faker-js/faker';

// Mock the entire module
jest.mock('@react-native-async-storage/async-storage');

// Mock loadGameAddLog
jest.mock('@/game/dominion-lib.load-save', () => ({
  ...jest.requireActual('@/game/dominion-lib.load-save'),
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
    // jest.restoreAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {
      /* do nothing */
    });
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {
      /* do nothing */
    });
    // consoleErrorSpy = jest.spyOn(console, 'error');
    // consoleLogSpy = jest.spyOn(console, 'log');
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  it('should load a game successfully', async () => {
    const mockGame: IGame = createMockGame(4);
    mockGame.log.push({
      id: faker.string.uuid(),
      timestamp: new Date(),
      playerIndex: -1,
      action: GameLogActionWithCount.SAVE_GAME,
    });
    const mockGameString = JSON.stringify(mockGame);

    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(mockGameString);

    const result = await loadGame('test-save-id');

    expect(result).not.toBeNull();
    if (result !== null) {
      expect(result.players.length).toBe(4);
      expect(result.log.length).toBeGreaterThan(0);
      expect(result.log[result.log.length - 1].action).toBe(GameLogActionWithCount.LOAD_GAME);
    }
    expect(AsyncStorage.getItem).toHaveBeenCalledWith('@dominion_game_test-save-id');
  });

  it('should return null if the game does not exist', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const result = await loadGame('non-existent-id');

    expect(result).toBeNull();
    expect(AsyncStorage.getItem).toHaveBeenCalledWith('@dominion_game_non-existent-id');
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should handle JSON parsing errors gracefully and return null', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('invalid json');

    const result = await loadGame('test-save-id');

    expect(result).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error parsing game JSON:',
      expect.any(SyntaxError)
    );
  });

  it('should handle errors from AsyncStorage and return null', async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

    const result = await loadGame('test-save-id');

    expect(result).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error loading game:', expect.any(Error));
  });

  it('should handle loadGameAddLog throwing an error', async () => {
    const mockGame: IGame = createMockGame(4);
    const mockGameString = JSON.stringify(mockGame);

    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(mockGameString);
    (loadGameAddLog as jest.Mock).mockImplementation(() => {
      throw new Error('loadGameAddLog error');
    });

    const result = await loadGame('test-save-id');

    expect(result).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error loading game:', expect.any(Error));
  });
});
