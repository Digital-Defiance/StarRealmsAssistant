import { ILogEntry } from '@/game/interfaces/log-entry';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import { createMockLog } from '@/__fixtures__/dominion-lib-fixtures';
import { ITurnDuration } from '@/game/interfaces/turn-duration';
import { calculateGameDuration } from '@/game/dominion-lib-log';

describe('calculateGameDuration', () => {
  it('should return 0 if log is empty', () => {
    const log: ILogEntry[] = [];

    const calculateTurnDurations = jest.fn().mockReturnValue([]);
    const calculateCurrentTurnDuration = jest.fn().mockReturnValue(0);

    const result = calculateGameDuration(log, calculateTurnDurations, calculateCurrentTurnDuration);
    expect(result.duration).toBe(0);
    expect(calculateTurnDurations).not.toHaveBeenCalled(); // Expect no calls for empty log
    expect(calculateCurrentTurnDuration).not.toHaveBeenCalled(); // Expect no calls for empty log
  });

  it('should calculate total game duration including current turn', () => {
    const log: ILogEntry[] = [
      createMockLog({
        id: '1',
        timestamp: new Date('2021-01-01T09:00:00Z'),
        action: GameLogAction.START_GAME,
        playerIndex: 0,
        currentPlayerIndex: 0,
        prevPlayerIndex: -1,
        turn: 1,
      }),
      createMockLog({
        id: '2',
        timestamp: new Date('2021-01-01T09:15:00Z'),
        action: GameLogAction.NEXT_TURN,
        playerIndex: 1,
        currentPlayerIndex: 1,
        turn: 2,
        prevPlayerIndex: 0,
      }),
    ];
    const mockTurnDurations = [
      {
        turn: 1,
        playerIndex: 0,
        start: new Date('2021-01-01T09:00:00Z'),
        end: new Date('2021-01-01T09:15:00Z'),
        duration: 15 * 60 * 1000, // 15 minutes
      },
    ];
    const mockCurrentTurnDuration = 10 * 60 * 1000; // 10 minutes

    const calculateTurnDurations = jest.fn().mockReturnValue(mockTurnDurations);
    const calculateCurrentTurnDuration = jest.fn().mockReturnValue(mockCurrentTurnDuration);

    const result = calculateGameDuration(log, calculateTurnDurations, calculateCurrentTurnDuration);
    expect(result.duration).toBe(25 * 60 * 1000); // 25 minutes
    expect(calculateTurnDurations).toHaveBeenCalledWith(log);
    expect(calculateCurrentTurnDuration).toHaveBeenCalledWith(log, expect.any(Date));
  });

  it('should handle edge cases with no NEXT_TURN after START_GAME', () => {
    const log: ILogEntry[] = [
      createMockLog({
        id: '1',
        timestamp: new Date('2021-01-01T09:00:00Z'),
        action: GameLogAction.START_GAME,
        playerIndex: 0,
        currentPlayerIndex: 0,
        turn: 1,
      }),
    ];
    const mockTurnDurations: ITurnDuration[] = [];
    const mockCurrentTurnDuration = 0;

    const calculateTurnDurations = jest.fn().mockReturnValue(mockTurnDurations);
    const calculateCurrentTurnDuration = jest.fn().mockReturnValue(mockCurrentTurnDuration);

    const result = calculateGameDuration(log, calculateTurnDurations, calculateCurrentTurnDuration);
    expect(result.duration).toBe(0);
    expect(calculateTurnDurations).toHaveBeenCalledWith(log);
    expect(calculateCurrentTurnDuration).toHaveBeenCalledWith(log, expect.any(Date));
  });

  it('should handle edge cases with multiple NEXT_TURN actions', () => {
    const log: ILogEntry[] = [
      createMockLog({
        id: '1',
        timestamp: new Date('2021-01-01T09:00:00Z'),
        action: GameLogAction.START_GAME,
        playerIndex: 0,
        currentPlayerIndex: 0,
        prevPlayerIndex: -1,
        turn: 1,
      }),
      createMockLog({
        id: '2',
        timestamp: new Date('2021-01-01T09:15:00Z'),
        action: GameLogAction.NEXT_TURN,
        playerIndex: 1,
        currentPlayerIndex: 1,
        turn: 2,
        prevPlayerIndex: 0,
      }),
      createMockLog({
        id: '3',
        timestamp: new Date('2021-01-01T09:30:00Z'),
        action: GameLogAction.NEXT_TURN,
        playerIndex: 0,
        currentPlayerIndex: 0,
        turn: 3,
        prevPlayerIndex: 1,
      }),
    ];
    const mockTurnDurations = [
      {
        turn: 1,
        playerIndex: 0,
        start: new Date('2021-01-01T09:00:00Z'),
        end: new Date('2021-01-01T09:15:00Z'),
        duration: 15 * 60 * 1000, // 15 minutes
      },
      {
        turn: 2,
        playerIndex: 1,
        start: new Date('2021-01-01T09:15:00Z'),
        end: new Date('2021-01-01T09:30:00Z'),
        duration: 15 * 60 * 1000, // 15 minutes
      },
    ];
    const mockCurrentTurnDuration = 5 * 60 * 1000; // 5 minutes

    const calculateTurnDurations = jest.fn().mockReturnValue(mockTurnDurations);
    const calculateCurrentTurnDuration = jest.fn().mockReturnValue(mockCurrentTurnDuration);

    const result = calculateGameDuration(log, calculateTurnDurations, calculateCurrentTurnDuration);
    expect(result.duration).toBe(35 * 60 * 1000); // 35 minutes
    expect(calculateTurnDurations).toHaveBeenCalledWith(log);
    expect(calculateCurrentTurnDuration).toHaveBeenCalledWith(log, expect.any(Date));
  });
});
