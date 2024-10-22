import { loadGameAddLog } from '@/game/dominion-lib-load-save';
import { GameLogActionWithCount } from '@/game/enumerations/game-log-action-with-count';
import { EmptyLogError } from '@/game/errors/empty-log';
import { InvalidLogSaveGameError } from '@/game/errors/invalid-log-save-game';
import { NO_PLAYER } from '@/game/constants';
import { createMockGame } from '@/__fixtures__/dominion-lib-fixtures';
import { ILogEntry } from '@/game/interfaces/log-entry';

describe('loadGameAddLog', () => {
  it('should add a LOAD_GAME entry linked to the last SAVE_GAME entry', () => {
    const mockGame = createMockGame(2, {
      log: [
        {
          id: 'start',
          playerIndex: 0,
          action: GameLogActionWithCount.START_GAME,
          timestamp: new Date(),
        } as ILogEntry,
        {
          id: 'save',
          playerIndex: NO_PLAYER,
          action: GameLogActionWithCount.SAVE_GAME,
          timestamp: new Date(),
        } as ILogEntry,
      ],
    });

    const result = loadGameAddLog(mockGame);

    expect(result.log).toHaveLength(3);
    expect(result.log[2]).toMatchObject({
      action: GameLogActionWithCount.LOAD_GAME,
      playerIndex: NO_PLAYER,
      linkedActionId: 'save',
    });
  });

  it('should throw EmptyLogError if the log is empty', () => {
    const mockGame = createMockGame(2, { log: [] });

    expect(() => loadGameAddLog(mockGame)).toThrow(EmptyLogError);
  });

  it('should throw InvalidLogSaveGameError if the last entry is not SAVE_GAME', () => {
    const mockGame = createMockGame(2, {
      log: [
        {
          id: 'start',
          playerIndex: 0,
          action: GameLogActionWithCount.START_GAME,
          timestamp: new Date(),
        } as ILogEntry,
        {
          id: 'turn',
          playerIndex: NO_PLAYER,
          action: GameLogActionWithCount.NEXT_TURN,
          timestamp: new Date(),
        } as ILogEntry,
      ],
    });

    expect(() => loadGameAddLog(mockGame)).toThrow(InvalidLogSaveGameError);
  });

  it('should handle multiple SAVE_GAME entries and link to the last one', () => {
    const mockGame = createMockGame(2, {
      log: [
        {
          id: 'start',
          playerIndex: 0,
          action: GameLogActionWithCount.START_GAME,
          timestamp: new Date(),
        } as ILogEntry,
        {
          id: 'save1',
          playerIndex: NO_PLAYER,
          action: GameLogActionWithCount.SAVE_GAME,
          timestamp: new Date(),
        } as ILogEntry,
        {
          id: 'turn',
          playerIndex: NO_PLAYER,
          action: GameLogActionWithCount.NEXT_TURN,
          timestamp: new Date(),
        } as ILogEntry,
        {
          id: 'save2',
          playerIndex: NO_PLAYER,
          action: GameLogActionWithCount.SAVE_GAME,
          timestamp: new Date(),
        } as ILogEntry,
      ],
    });

    const result = loadGameAddLog(mockGame);

    expect(result.log).toHaveLength(5);
    expect(result.log[4]).toMatchObject({
      action: GameLogActionWithCount.LOAD_GAME,
      playerIndex: NO_PLAYER,
      linkedActionId: 'save2',
    });
  });

  it('should preserve existing game state and only add the new log entry', () => {
    const mockGame = createMockGame(2, {
      log: [
        {
          id: 'start',
          playerIndex: 0,
          action: GameLogActionWithCount.START_GAME,
          timestamp: new Date(),
        } as ILogEntry,
        {
          id: 'save',
          playerIndex: NO_PLAYER,
          action: GameLogActionWithCount.SAVE_GAME,
          timestamp: new Date(),
        } as ILogEntry,
      ],
    });
    mockGame.currentTurn = 5;
    mockGame.currentPlayerIndex = 2;

    const result = loadGameAddLog(mockGame);

    expect(result).toMatchObject({
      ...mockGame,
      log: expect.arrayContaining([
        expect.objectContaining({ action: GameLogActionWithCount.LOAD_GAME }),
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
          action: GameLogActionWithCount.START_GAME,
          timestamp: new Date(),
        } as ILogEntry,
        {
          id: 'save',
          playerIndex: NO_PLAYER,
          action: GameLogActionWithCount.SAVE_GAME,
          timestamp: new Date(),
        } as ILogEntry,
      ],
    });

    const result = loadGameAddLog(mockGame);

    expect(result.log[2].id).toBeDefined();
    expect(result.log[2].id).not.toBe('start');
    expect(result.log[2].id).not.toBe('save');
  });
});
