import { loadGameAddLog } from '@/game/dominion-lib-load-save';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import { EmptyLogError } from '@/game/errors/empty-log';
import { InvalidLogSaveGameError } from '@/game/errors/invalid-log-save-game';
import { NO_PLAYER } from '@/game/constants';
import { createMockGame, createMockLog } from '@/__fixtures__/dominion-lib-fixtures';
import { ILogEntry } from '@/game/interfaces/log-entry';
import { addLogEntry } from '@/game/dominion-lib-log';
import { faker } from '@faker-js/faker';

jest.mock('@/game/dominion-lib-log', () => ({
  addLogEntry: jest.fn((game, playerIndex, action, options) => {
    const logEntry: ILogEntry = createMockLog({
      id: faker.string.uuid(),
      playerIndex,
      action,
      timestamp: options?.timestamp || new Date(),
      linkedActionId: options?.linkedActionId,
    });
    game.log.push(logEntry);
    return logEntry;
  }),
}));

describe('loadGameAddLog', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should add a LOAD_GAME entry linked to the last SAVE_GAME entry', () => {
    const mockGame = createMockGame(2, {
      log: [
        {
          id: 'start',
          playerIndex: 0,
          action: GameLogAction.START_GAME,
          timestamp: new Date('2023-01-01T00:00:00Z'),
          turn: 1,
        } as ILogEntry,
        {
          id: 'save',
          playerIndex: NO_PLAYER,
          action: GameLogAction.SAVE_GAME,
          timestamp: new Date('2023-01-01T00:01:00Z'),
        } as ILogEntry,
      ],
    });

    const result = loadGameAddLog(mockGame, new Date('2023-01-01T00:02:00Z'));
    expect(addLogEntry).toHaveBeenCalledWith(mockGame, NO_PLAYER, GameLogAction.LOAD_GAME, {
      timestamp: new Date('2023-01-01T00:02:00Z'),
      linkedActionId: 'save',
    });
    expect(result.log).toHaveLength(3);
    expect(result.log[2]).toMatchObject({
      timestamp: new Date('2023-01-01T00:02:00Z'),
      action: GameLogAction.LOAD_GAME,
      playerIndex: NO_PLAYER,
      linkedActionId: 'save',
    });
  });

  it('should throw EmptyLogError if the log is empty', () => {
    const mockGame = createMockGame(2, { log: [] });

    expect(() => loadGameAddLog(mockGame, new Date())).toThrow(EmptyLogError);
    expect(addLogEntry).not.toHaveBeenCalled();
  });

  it('should throw InvalidLogSaveGameError if the last entry is not SAVE_GAME', () => {
    const mockGame = createMockGame(2, {
      log: [
        {
          id: 'start',
          playerIndex: 0,
          action: GameLogAction.START_GAME,
          timestamp: new Date('2023-01-01T00:00:00Z'),
          turn: 1,
        } as ILogEntry,
        {
          id: 'turn',
          playerIndex: NO_PLAYER,
          action: GameLogAction.NEXT_TURN,
          timestamp: new Date('2023-01-01T00:01:00Z'),
          turn: 2,
        } as ILogEntry,
      ],
    });

    expect(() => loadGameAddLog(mockGame, new Date())).toThrow(InvalidLogSaveGameError);
    expect(addLogEntry).not.toHaveBeenCalled();
  });

  it('should handle multiple SAVE_GAME entries and link to the last one', () => {
    const mockGame = createMockGame(2, {
      log: [
        {
          id: 'start',
          playerIndex: 0,
          action: GameLogAction.START_GAME,
          timestamp: new Date('2023-01-01T00:00:00Z'),
          turn: 1,
        } as ILogEntry,
        {
          id: 'save1',
          playerIndex: NO_PLAYER,
          action: GameLogAction.SAVE_GAME,
          timestamp: new Date('2023-01-01T00:01:00Z'),
        } as ILogEntry,
        {
          id: 'turn',
          playerIndex: NO_PLAYER,
          action: GameLogAction.NEXT_TURN,
          timestamp: new Date('2023-01-01T00:02:00Z'),
          turn: 2,
        } as ILogEntry,
        {
          id: 'save2',
          playerIndex: NO_PLAYER,
          action: GameLogAction.SAVE_GAME,
          timestamp: new Date('2023-01-01T00:03:00Z'),
        } as ILogEntry,
      ],
    });

    const result = loadGameAddLog(mockGame, new Date('2023-01-01T00:04:00Z'));
    expect(addLogEntry).toHaveBeenCalledWith(mockGame, NO_PLAYER, GameLogAction.LOAD_GAME, {
      timestamp: new Date('2023-01-01T00:04:00Z'),
      linkedActionId: 'save2',
    });
    expect(result.log).toHaveLength(5);
    expect(result.log[4]).toMatchObject({
      timestamp: new Date('2023-01-01T00:04:00Z'),
      action: GameLogAction.LOAD_GAME,
      playerIndex: NO_PLAYER,
      linkedActionId: 'save2',
    });
  });

  it('should not add a LOAD_GAME log entry if the game has ended', () => {
    const endGameLog = createMockLog({ action: GameLogAction.END_GAME, playerIndex: -1 });
    const mockGame = createMockGame(2, { log: [endGameLog] });

    const result = loadGameAddLog(mockGame, new Date('2023-01-01T00:02:00Z'));

    expect(result.log).toHaveLength(1);
    expect(result.log[0]).toMatchObject({
      action: GameLogAction.END_GAME,
    });
    expect(addLogEntry).not.toHaveBeenCalled();
  });

  it('should preserve existing game state and only add the new log entry', () => {
    const mockGame = createMockGame(2, {
      log: [
        {
          id: 'start',
          playerIndex: 0,
          action: GameLogAction.START_GAME,
          timestamp: new Date('2023-01-01T00:00:00Z'),
          turn: 1,
        } as ILogEntry,
        {
          id: 'save',
          playerIndex: NO_PLAYER,
          action: GameLogAction.SAVE_GAME,
          timestamp: new Date('2023-01-01T00:01:00Z'),
        } as ILogEntry,
      ],
    });
    mockGame.currentTurn = 5;
    mockGame.currentPlayerIndex = 2;

    const result = loadGameAddLog(mockGame, new Date('2023-01-01T00:02:00Z'));

    expect(addLogEntry).toHaveBeenCalledWith(mockGame, NO_PLAYER, GameLogAction.LOAD_GAME, {
      timestamp: new Date('2023-01-01T00:02:00Z'),
      linkedActionId: 'save',
    });
    expect(result).toMatchObject({
      ...mockGame,
      log: expect.arrayContaining([
        expect.objectContaining({
          timestamp: new Date('2023-01-01T00:02:00Z'),
          action: GameLogAction.LOAD_GAME,
        }),
      ]),
    });
    expect(result.currentTurn).toBe(5);
    expect(result.currentPlayerIndex).toBe(2);
  });

  it('should generate a new UUID for the LOAD_GAME entry', () => {
    const mockGame = createMockGame(2, {
      log: [
        {
          id: 'start',
          playerIndex: 0,
          action: GameLogAction.START_GAME,
          timestamp: new Date('2023-01-01T00:00:00Z'),
          turn: 1,
        } as ILogEntry,
        {
          id: 'save',
          playerIndex: NO_PLAYER,
          action: GameLogAction.SAVE_GAME,
          timestamp: new Date('2023-01-01T00:01:00Z'),
        } as ILogEntry,
      ],
    });

    const result = loadGameAddLog(mockGame, new Date('2023-01-01T00:02:00Z'));

    expect(addLogEntry).toHaveBeenCalledWith(mockGame, NO_PLAYER, GameLogAction.LOAD_GAME, {
      timestamp: new Date('2023-01-01T00:02:00Z'),
      linkedActionId: 'save',
    });
    expect(result.log[2].id).toBeDefined();
    expect(result.log[2].id).not.toBe('start');
    expect(result.log[2].id).not.toBe('save');
  });

  it('should remove the PAUSE log entry if it is the last entry', () => {
    const mockGame = createMockGame(2, {
      log: [
        {
          id: 'start',
          playerIndex: 0,
          action: GameLogAction.START_GAME,
          timestamp: new Date('2023-01-01T00:00:00Z'),
          turn: 1,
        } as ILogEntry,
        {
          id: 'save',
          playerIndex: NO_PLAYER,
          action: GameLogAction.SAVE_GAME,
          timestamp: new Date('2023-01-01T00:01:00Z'),
        } as ILogEntry,
        {
          id: 'pause',
          playerIndex: NO_PLAYER,
          action: GameLogAction.PAUSE,
          timestamp: new Date('2023-01-01T00:02:00Z'),
        } as ILogEntry,
      ],
    });

    const result = loadGameAddLog(mockGame, new Date('2023-01-01T00:03:00Z'));

    expect(addLogEntry).toHaveBeenCalledWith(mockGame, NO_PLAYER, GameLogAction.LOAD_GAME, {
      timestamp: new Date('2023-01-01T00:03:00Z'),
      linkedActionId: 'save',
    });
    expect(result.log.length).toBe(3);
    expect(result.log[2].action).toBe(GameLogAction.LOAD_GAME);
    expect(result.log).not.toContainEqual(
      expect.objectContaining({
        timestamp: new Date('2023-01-01T00:02:00Z'),
        action: GameLogAction.PAUSE,
      })
    );
  });

  it('should throw an error if the last log entry is not SAVE_GAME after removing PAUSE', () => {
    const mockGame = createMockGame(2, {
      log: [
        {
          id: 'start',
          playerIndex: 0,
          action: GameLogAction.START_GAME,
          timestamp: new Date('2023-01-01T00:00:00Z'),
          turn: 1,
        } as ILogEntry,
        {
          id: 'pause',
          playerIndex: NO_PLAYER,
          action: GameLogAction.PAUSE,
          timestamp: new Date('2023-01-01T00:01:00Z'),
        } as ILogEntry,
      ],
    });

    expect(() => loadGameAddLog(mockGame, new Date('2023-01-01T00:02:00Z'))).toThrow(
      'The last log entry is not a SAVE_GAME event.'
    );
    expect(addLogEntry).not.toHaveBeenCalled();
  });

  it('should handle the case where the last log entry is SAVE_GAME', () => {
    const mockGame = createMockGame(2, {
      log: [
        {
          id: 'start',
          playerIndex: 0,
          action: GameLogAction.START_GAME,
          timestamp: new Date('2023-01-01T00:00:00Z'),
          turn: 1,
        } as ILogEntry,
        {
          id: 'save',
          playerIndex: NO_PLAYER,
          action: GameLogAction.SAVE_GAME,
          timestamp: new Date('2023-01-01T00:01:00Z'),
        } as ILogEntry,
      ],
    });

    const result = loadGameAddLog(mockGame, new Date('2023-01-01T00:02:00Z'));

    expect(addLogEntry).toHaveBeenCalledWith(mockGame, NO_PLAYER, GameLogAction.LOAD_GAME, {
      timestamp: new Date('2023-01-01T00:02:00Z'),
      linkedActionId: 'save',
    });
    expect(result.log.length).toBe(3);
    expect(result.log[2].action).toBe(GameLogAction.LOAD_GAME);
  });

  it('should throw empty log if the only entry is a PAUSE entry', () => {
    const mockGame = createMockGame(2, {
      log: [
        {
          id: 'pause',
          playerIndex: NO_PLAYER,
          action: GameLogAction.PAUSE,
          timestamp: new Date(),
        } as ILogEntry,
      ],
    });

    expect(() => loadGameAddLog(mockGame, new Date())).toThrow(EmptyLogError);
    expect(addLogEntry).not.toHaveBeenCalled();
  });
});
