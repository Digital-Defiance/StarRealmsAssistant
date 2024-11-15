import { calculateDurationUpToEvent } from '@/game/starrealms-lib-log';
import { ILogEntry } from '@/game/interfaces/log-entry';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import { createMockLog } from '@/__fixtures__/starrealms-lib-fixtures';

describe('calculateDurationUpToEvent', () => {
  it('should return 0 if no START_GAME is found', () => {
    const logEntries: ILogEntry[] = [];
    const eventTime = new Date();
    const result = calculateDurationUpToEvent(logEntries, eventTime);
    expect(result).toBe(0);
  });

  it('should return 0 if eventTime is before START_GAME', () => {
    const startGameTime = new Date('2021-01-01T10:00:00Z');
    const eventTime = new Date('2021-01-01T09:00:00Z');
    const logEntries: ILogEntry[] = [
      createMockLog({
        id: '1',
        timestamp: startGameTime,
        action: GameLogAction.START_GAME,
        playerIndex: 0,
        currentPlayerIndex: 0,
        turn: 1,
      }),
    ];
    const result = calculateDurationUpToEvent(logEntries, eventTime);
    expect(result).toBe(0);
  });

  it('should calculate adjusted duration up to event time', () => {
    const startGameTime = new Date('2021-01-01T09:00:00Z');
    const eventTime = new Date('2021-01-01T10:00:00Z');
    const logEntries: ILogEntry[] = [
      createMockLog({
        id: '1',
        timestamp: startGameTime,
        gameTime: 0,
        action: GameLogAction.START_GAME,
        playerIndex: 0,
        currentPlayerIndex: 0,
        turn: 1,
      }),
      // SAVE_GAME and LOAD_GAME before eventTime
      createMockLog({
        id: '2',
        timestamp: new Date('2021-01-01T09:15:00Z'),
        gameTime: 900000,
        action: GameLogAction.SAVE_GAME,
        playerIndex: 0,
        currentPlayerIndex: 0,
        turn: 1,
      }),
      createMockLog({
        id: '3',
        timestamp: new Date('2021-01-01T09:30:00Z'),
        gameTime: 900000,
        action: GameLogAction.LOAD_GAME,
        playerIndex: 0,
        currentPlayerIndex: 0,
        turn: 1,
      }),
      // SAVE_GAME after eventTime
      createMockLog({
        id: '4',
        timestamp: new Date('2021-01-01T10:15:00Z'),
        gameTime: 3600000,
        action: GameLogAction.SAVE_GAME,
        playerIndex: 0,
        currentPlayerIndex: 0,
        turn: 1,
      }),
    ];
    const result = calculateDurationUpToEvent(logEntries, eventTime);
    // Total duration: 1 hour
    // Paused time: 15 mins (from 09:15 to 09:30)
    expect(result).toBe(2700000); // 45 minutes
  });

  it('should handle unpaired SAVE_GAME before eventTime', () => {
    const startGameTime = new Date('2021-01-01T09:00:00Z');
    const eventTime = new Date('2021-01-01T09:30:00Z');
    const logEntries: ILogEntry[] = [
      createMockLog({
        id: '1',
        timestamp: startGameTime,
        action: GameLogAction.START_GAME,
        gameTime: 0,
        playerIndex: 0,
        currentPlayerIndex: 0,
        turn: 1,
      }),
      // Unpaired SAVE_GAME before eventTime
      createMockLog({
        id: '2',
        timestamp: new Date('2021-01-01T09:15:00Z'),
        gameTime: 15 * 60 * 1000,
        action: GameLogAction.SAVE_GAME,
        playerIndex: 0,
        currentPlayerIndex: 0,
        turn: 1,
      }),
    ];
    const result = calculateDurationUpToEvent(logEntries, eventTime);
    // Total duration: 30 mins
    expect(result).toBe(30 * 60 * 1000); // 30 minutes
  });
});
