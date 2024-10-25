import { calculateCurrentTurnDuration } from '@/game/dominion-lib-log';
import { ILogEntry } from '@/game/interfaces/log-entry';
import { GameLogActionWithCount } from '@/game/enumerations/game-log-action-with-count';
import { createMockLog } from '@/__fixtures__/dominion-lib-fixtures';

describe('calculateCurrentTurnDuration', () => {
  it('should return 0 if there is no START_GAME or NEXT_TURN', () => {
    const logEntries: ILogEntry[] = [];
    const currentTime = new Date();
    const result = calculateCurrentTurnDuration(logEntries, currentTime);
    expect(result).toBe(0);
  });

  it('should calculate duration from START_GAME if no NEXT_TURNs', () => {
    const startTime = new Date('2021-01-01T10:00:00Z');
    const currentTime = new Date('2021-01-01T10:10:00Z');
    const logEntries: ILogEntry[] = [
      createMockLog({
        id: '1',
        timestamp: startTime,
        action: GameLogActionWithCount.START_GAME,
        playerIndex: 0,
        currentPlayerIndex: 0,
        turn: 1,
      }),
    ];
    const result = calculateCurrentTurnDuration(logEntries, currentTime);
    expect(result).toBe(600000); // 10 minutes
  });

  it('should calculate duration from last NEXT_TURN', () => {
    const startTime = new Date('2021-01-01T09:00:00Z');
    const nextTurnTime = new Date('2021-01-01T09:30:00Z');
    const currentTime = new Date('2021-01-01T10:00:00Z');
    const logEntries: ILogEntry[] = [
      createMockLog({
        id: '1',
        timestamp: startTime,
        action: GameLogActionWithCount.START_GAME,
        playerIndex: 0,
        currentPlayerIndex: 0,
        turn: 1,
      }),
      createMockLog({
        id: '2',
        timestamp: nextTurnTime,
        action: GameLogActionWithCount.NEXT_TURN,
        playerIndex: 1,
        currentPlayerIndex: 1,
        turn: 2,
      }),
    ];
    const result = calculateCurrentTurnDuration(logEntries, currentTime);
    expect(result).toBe(1800000); // 30 minutes
  });

  it('should subtract time between SAVE_GAME and LOAD_GAME pairs', () => {
    const nextTurnTime = new Date('2021-01-01T10:00:00Z');
    const currentTime = new Date('2021-01-01T10:20:00Z');
    const logEntries: ILogEntry[] = [
      createMockLog({
        id: '1',
        timestamp: new Date('2021-01-01T09:00:00Z'),
        action: GameLogActionWithCount.START_GAME,
        playerIndex: 0,
        currentPlayerIndex: 0,
        turn: 1,
      }),
      createMockLog({
        id: '2',
        timestamp: nextTurnTime,
        action: GameLogActionWithCount.NEXT_TURN,
        playerIndex: 1,
        currentPlayerIndex: 1,
        turn: 2,
      }),
      // SAVE_GAME and LOAD_GAME within current turn
      createMockLog({
        id: '3',
        timestamp: new Date('2021-01-01T10:05:00Z'),
        action: GameLogActionWithCount.SAVE_GAME,
        playerIndex: 1,
        currentPlayerIndex: 1,
        turn: 2,
      }),
      createMockLog({
        id: '4',
        timestamp: new Date('2021-01-01T10:10:00Z'),
        action: GameLogActionWithCount.LOAD_GAME,
        playerIndex: 1,
        currentPlayerIndex: 1,
        turn: 2,
      }),
    ];
    const result = calculateCurrentTurnDuration(logEntries, currentTime);
    // Total time: 20 mins, Paused time: 5 mins
    expect(result).toBe(900000); // 15 minutes
  });

  it('should handle unpaired SAVE_GAME by subtracting time up to current time', () => {
    const nextTurnTime = new Date('2021-01-01T10:00:00Z');
    const currentTime = new Date('2021-01-01T10:20:00Z');
    const logEntries: ILogEntry[] = [
      createMockLog({
        id: '1',
        timestamp: new Date('2021-01-01T09:00:00Z'),
        action: GameLogActionWithCount.START_GAME,
        playerIndex: 0,
        currentPlayerIndex: 0,
        turn: 1,
      }),
      createMockLog({
        id: '2',
        timestamp: nextTurnTime,
        action: GameLogActionWithCount.NEXT_TURN,
        playerIndex: 1,
        currentPlayerIndex: 1,
        turn: 2,
      }),
      // Unpaired SAVE_GAME
      createMockLog({
        id: '3',
        timestamp: new Date('2021-01-01T10:05:00Z'),
        action: GameLogActionWithCount.SAVE_GAME,
        playerIndex: 1,
        currentPlayerIndex: 1,
        turn: 2,
      }),
    ];
    const result = calculateCurrentTurnDuration(logEntries, currentTime);
    // Total time: 20 mins, Paused time: 15 mins
    expect(result).toBe(300000); // 5 minutes
  });
});
