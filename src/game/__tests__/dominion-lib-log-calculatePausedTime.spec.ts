import { calculatePausedTime } from '@/game/dominion-lib-log';
import { ILogEntry } from '@/game/interfaces/log-entry';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import { createMockLog } from '@/__fixtures__/dominion-lib-fixtures';

describe('calculatePausedTime', () => {
  it('should return 0 if logEntries is empty', () => {
    const logEntries: ILogEntry[] = [];
    const endTime = new Date();
    expect(calculatePausedTime(logEntries, 0, endTime)).toBe(0);
  });

  it('should return 0 if no pause or save/load actions are present', () => {
    const logEntries: ILogEntry[] = [
      createMockLog({
        timestamp: new Date('2023-01-01T00:00:00Z'),
        action: GameLogAction.START_GAME,
        turn: 1,
      }),
      createMockLog({
        timestamp: new Date('2023-01-01T01:00:00Z'),
        action: GameLogAction.NEXT_TURN,
        turn: 2,
      }),
    ];
    const endTime = new Date('2023-01-01T02:00:00Z');
    expect(calculatePausedTime(logEntries, 0, endTime)).toBe(0);
  });

  it('should calculate paused time correctly for pause/unpause actions', () => {
    const logEntries: ILogEntry[] = [
      createMockLog({
        timestamp: new Date('2023-01-01T00:00:00Z'),
        action: GameLogAction.START_GAME,
        turn: 1,
      }),
      createMockLog({
        timestamp: new Date('2023-01-01T01:00:00Z'),
        action: GameLogAction.PAUSE,
        turn: 1,
      }),
      createMockLog({
        timestamp: new Date('2023-01-01T01:30:00Z'),
        action: GameLogAction.UNPAUSE,
        turn: 1,
      }),
    ];
    const endTime = new Date('2023-01-01T02:00:00Z');
    expect(calculatePausedTime(logEntries, 0, endTime)).toBe(30 * 60 * 1000); // 30 minutes in milliseconds
  });

  it('should calculate paused time correctly for save/load actions', () => {
    const logEntries: ILogEntry[] = [
      createMockLog({
        timestamp: new Date('2023-01-01T00:00:00Z'),
        action: GameLogAction.START_GAME,
        turn: 1,
      }),
      createMockLog({
        timestamp: new Date('2023-01-01T01:00:00Z'),
        action: GameLogAction.SAVE_GAME,
        turn: 1,
      }),
      createMockLog({
        timestamp: new Date('2023-01-01T01:30:00Z'),
        action: GameLogAction.LOAD_GAME,
        turn: 1,
      }),
    ];
    const endTime = new Date('2023-01-01T02:00:00Z');
    expect(calculatePausedTime(logEntries, 0, endTime)).toBe(30 * 60 * 1000); // 30 minutes in milliseconds
  });

  it('should handle case where end time is during a pause', () => {
    const logEntries: ILogEntry[] = [
      createMockLog({
        timestamp: new Date('2023-01-01T00:00:00Z'),
        action: GameLogAction.START_GAME,
        turn: 1,
      }),
      createMockLog({
        timestamp: new Date('2023-01-01T01:00:00Z'),
        action: GameLogAction.PAUSE,
        turn: 1,
      }),
    ];
    const endTime = new Date('2023-01-01T01:30:00Z');
    expect(calculatePausedTime(logEntries, 0, endTime)).toBe(30 * 60 * 1000); // 30 minutes in milliseconds
  });

  it('should handle case where end time is after a pause/unpause cycle', () => {
    const logEntries: ILogEntry[] = [
      createMockLog({
        timestamp: new Date('2023-01-01T00:00:00Z'),
        action: GameLogAction.START_GAME,
        turn: 1,
      }),
      createMockLog({
        timestamp: new Date('2023-01-01T01:00:00Z'),
        action: GameLogAction.PAUSE,
        turn: 1,
      }),
      createMockLog({
        timestamp: new Date('2023-01-01T01:30:00Z'),
        action: GameLogAction.UNPAUSE,
        turn: 1,
      }),
      createMockLog({
        timestamp: new Date('2023-01-01T02:00:00Z'),
        action: GameLogAction.PAUSE,
        turn: 1,
      }),
    ];
    const endTime = new Date('2023-01-01T02:30:00Z');
    expect(calculatePausedTime(logEntries, 0, endTime)).toBe(60 * 60 * 1000); // 1 hour in milliseconds
  });
});
