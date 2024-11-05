import { saveGame } from '@/game/dominion-lib-load-save';
import { IGame } from '@/game/interfaces/game';
import { IStorageService } from '@/game/interfaces/storage-service';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import { NO_PLAYER } from '@/game/constants';
import { createMockGame, createMockLog } from '@/__fixtures__/dominion-lib-fixtures';
import { addLogEntry } from '@/game/dominion-lib-log';
import { EmptyLogError } from '../errors/empty-log';

jest.mock('@/game/dominion-lib-log', () => ({
  addLogEntry: jest.fn(),
}));

describe('saveGame', () => {
  let mockStorageService: jest.Mocked<IStorageService>;
  let mockGame: IGame;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    mockStorageService = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };

    mockGame = createMockGame(2);

    (addLogEntry as jest.Mock).mockImplementation((game, playerIndex, action, options) => {
      const logEntry = createMockLog({
        id: 'mock-id',
        playerIndex,
        action,
        timestamp: options?.timestamp || new Date(),
      });
      game.log.push(logEntry);
    });

    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {
      /* do nothing */
    });
  });

  it('should save the game with the specified saveDate', () => {
    const saveDate = new Date('2023-01-01T00:00:00Z');
    const result = saveGame(mockGame, 'Test Save', mockStorageService, undefined, saveDate);

    expect(result).toBe(true);
    expect(mockStorageService.setItem).toHaveBeenCalled();
    const savedGamesList = JSON.parse(mockStorageService.setItem.mock.calls[1][1]);
    expect(savedGamesList[0].savedAt).toEqual(saveDate.toISOString());
  });

  it('should save the game with the current date if saveDate is not provided', () => {
    const beforeSave = new Date();
    const result = saveGame(mockGame, 'Test Save', mockStorageService);

    expect(result).toBe(true);
    expect(mockStorageService.setItem).toHaveBeenCalled();
    const savedGamesList = JSON.parse(mockStorageService.setItem.mock.calls[1][1]);
    const afterSave = new Date();
    const savedAt = new Date(savedGamesList[0].savedAt);
    expect(savedAt.getTime()).toBeGreaterThanOrEqual(beforeSave.getTime());
    expect(savedAt.getTime()).toBeLessThanOrEqual(afterSave.getTime());
  });

  it('should add the SAVE_GAME log entry normally if the last log entry is not PAUSE', () => {
    saveGame(mockGame, 'Test Save', mockStorageService);

    expect(addLogEntry).toHaveBeenCalledWith(mockGame, NO_PLAYER, GameLogAction.SAVE_GAME);
  });

  it('should save the game data and add to the saved games list', () => {
    saveGame(mockGame, 'Test Save', mockStorageService);

    expect(mockStorageService.setItem).toHaveBeenCalled();
  });

  it('should not add a SAVE_GAME log entry if the game has ended', () => {
    const endGameLog = createMockLog({ action: GameLogAction.END_GAME, playerIndex: -1 });
    mockGame.log.push(endGameLog);

    const result = saveGame(mockGame, 'Test Save', mockStorageService);

    expect(result).toBe(true);
    expect(addLogEntry).not.toHaveBeenCalledWith(mockGame, NO_PLAYER, GameLogAction.SAVE_GAME);
    expect(mockStorageService.setItem).toHaveBeenCalled();
  });

  it('should return true if the game was saved successfully', () => {
    const result = saveGame(mockGame, 'Test Save', mockStorageService);

    expect(result).toBe(true);
  });

  it('should return false if there was an error saving the game', () => {
    const testError = new Error('Test Error');
    mockStorageService.setItem.mockImplementation(() => {
      throw testError;
    });

    const result = saveGame(mockGame, 'Test Save', mockStorageService);

    expect(result).toBe(false);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error saving game:', testError);
  });

  it('should handle the case where the game log is empty', () => {
    mockGame.log = [];

    expect(() => saveGame(mockGame, 'Test Save', mockStorageService)).toThrow(EmptyLogError);

    expect(mockStorageService.setItem).not.toHaveBeenCalled();
  });

  it('should handle the case where the game log has a valid SAVE_GAME entry', () => {
    mockGame.log.push(
      createMockLog({
        id: 'save',
        playerIndex: NO_PLAYER,
        action: GameLogAction.SAVE_GAME,
        timestamp: new Date(),
      })
    );

    const result = saveGame(mockGame, 'Test Save', mockStorageService);

    expect(result).toBe(true);
    expect(mockStorageService.setItem).toHaveBeenCalled();
  });

  it('should handle the case where the game log has a valid LOAD_GAME entry', () => {
    mockGame.log.push(
      createMockLog({
        id: 'load',
        playerIndex: NO_PLAYER,
        action: GameLogAction.LOAD_GAME,
        timestamp: new Date(),
      })
    );

    const result = saveGame(mockGame, 'Test Save', mockStorageService);

    expect(result).toBe(true);
    expect(mockStorageService.setItem).toHaveBeenCalled();
  });

  it('should insert the SAVE_GAME log entry before the PAUSE entry and copy the timestamp from the PAUSE entry', () => {
    const pauseTimestamp = new Date();
    mockGame.log.push(
      createMockLog({
        id: 'pause',
        playerIndex: NO_PLAYER,
        action: GameLogAction.PAUSE,
        timestamp: pauseTimestamp,
      })
    );

    saveGame(mockGame, 'Test Save', mockStorageService);

    expect(addLogEntry).toHaveBeenCalledWith(mockGame, NO_PLAYER, GameLogAction.SAVE_GAME, {
      timestamp: pauseTimestamp,
    });
    expect(mockGame.log[mockGame.log.length - 2].action).toBe(GameLogAction.SAVE_GAME);
    expect(mockGame.log[mockGame.log.length - 1].action).toBe(GameLogAction.PAUSE);
  });

  it('should modify the game being saved when saving a paused game', () => {
    const pauseTimestamp = new Date();
    mockGame.log.push(
      createMockLog({
        id: 'pause',
        playerIndex: NO_PLAYER,
        action: GameLogAction.PAUSE,
        timestamp: pauseTimestamp,
      })
    );

    saveGame(mockGame, 'Test Save', mockStorageService);

    const savedGame = JSON.parse(mockStorageService.setItem.mock.calls[0][1]);
    expect(savedGame.log[savedGame.log.length - 2].action).toBe(GameLogAction.SAVE_GAME);
    expect(savedGame.log[savedGame.log.length - 1].action).toBe(GameLogAction.PAUSE);
  });

  it('should add the SAVE_GAME log entry normally if the last log entry is not PAUSE', () => {
    saveGame(mockGame, 'Test Save', mockStorageService);

    expect(addLogEntry).toHaveBeenCalledWith(mockGame, NO_PLAYER, GameLogAction.SAVE_GAME);
  });

  it('should save the game data and add to the saved games list', () => {
    saveGame(mockGame, 'Test Save', mockStorageService);

    expect(mockStorageService.setItem).toHaveBeenCalled();
  });

  it('should return true if the game was saved successfully', () => {
    const result = saveGame(mockGame, 'Test Save', mockStorageService);

    expect(result).toBe(true);
  });

  it('should return false if there was an error saving the game', () => {
    mockStorageService.setItem.mockImplementation(() => {
      throw new Error('Test Error');
    });

    const result = saveGame(mockGame, 'Test Save', mockStorageService);

    expect(result).toBe(false);
  });

  it('should handle the case where the game log is empty', () => {
    mockGame.log = [];

    expect(() => saveGame(mockGame, 'Test Save', mockStorageService)).toThrow(EmptyLogError);

    expect(mockStorageService.setItem).not.toHaveBeenCalled();
  });

  it('should handle the case where the game log has a valid SAVE_GAME entry', () => {
    mockGame.log.push(
      createMockLog({
        id: 'save',
        playerIndex: NO_PLAYER,
        action: GameLogAction.SAVE_GAME,
        timestamp: new Date(),
      })
    );

    const result = saveGame(mockGame, 'Test Save', mockStorageService);

    expect(result).toBe(true);
    expect(mockStorageService.setItem).toHaveBeenCalled();
  });

  it('should handle the case where the game log has a valid LOAD_GAME entry', () => {
    mockGame.log.push(
      createMockLog({
        id: 'load',
        playerIndex: NO_PLAYER,
        action: GameLogAction.LOAD_GAME,
        timestamp: new Date(),
      })
    );

    const result = saveGame(mockGame, 'Test Save', mockStorageService);

    expect(result).toBe(true);
    expect(mockStorageService.setItem).toHaveBeenCalled();
  });
});
