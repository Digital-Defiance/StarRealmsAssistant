import { calculateTurnDurations } from '@/game/dominion-lib-log';
import { ILogEntry } from '@/game/interfaces/log-entry';
import { GameLogActionWithCount } from '@/game/enumerations/game-log-action-with-count';

describe('calculateTurnDurations', () => {
  it('should return an empty array if logEntries is empty', () => {
    const logEntries: ILogEntry[] = [];
    const result = calculateTurnDurations(logEntries);
    expect(result).toEqual([]);
  });

  it('should return an empty array if no START_GAME is found', () => {
    const logEntries: ILogEntry[] = [
      {
        id: '1',
        timestamp: new Date(),
        action: GameLogActionWithCount.NEXT_TURN,
        playerIndex: 0,
        currentPlayerIndex: 0,
        turn: 1,
      },
    ];
    const result = calculateTurnDurations(logEntries);
    expect(result).toEqual([]);
  });

  it('should return an empty array if no NEXT_TURN after START_GAME', () => {
    const logEntries: ILogEntry[] = [
      {
        id: '1',
        timestamp: new Date(),
        action: GameLogActionWithCount.START_GAME,
        playerIndex: 0,
        currentPlayerIndex: 0,
        turn: 1,
      },
    ];
    const result = calculateTurnDurations(logEntries);
    expect(result).toEqual([]);
  });

  it('should calculate turn durations correctly with multiple NEXT_TURN actions', () => {
    const logEntries: ILogEntry[] = [
      {
        id: '1',
        timestamp: new Date('2021-01-01T10:00:00Z'),
        action: GameLogActionWithCount.START_GAME,
        playerIndex: 0,
        currentPlayerIndex: 0,
        turn: 1,
      },
      {
        id: '2',
        timestamp: new Date('2021-01-01T10:05:00Z'),
        action: GameLogActionWithCount.NEXT_TURN,
        playerIndex: 1,
        currentPlayerIndex: 1,
        turn: 2,
        prevPlayerIndex: 0,
      },
      {
        id: '3',
        timestamp: new Date('2021-01-01T10:10:00Z'),
        action: GameLogActionWithCount.NEXT_TURN,
        playerIndex: 0,
        currentPlayerIndex: 0,
        turn: 3,
        prevPlayerIndex: 1,
      },
    ];
    const result = calculateTurnDurations(logEntries);

    expect(result).toEqual([
      {
        turn: 2,
        playerIndex: 0,
        start: new Date('2021-01-01T10:00:00Z'),
        end: new Date('2021-01-01T10:05:00Z'),
        duration: 300000, // 5 minutes
      },
      {
        turn: 3,
        playerIndex: 1,
        start: new Date('2021-01-01T10:05:00Z'),
        end: new Date('2021-01-01T10:10:00Z'),
        duration: 300000, // 5 minutes
      },
    ]);
  });

  it('should handle SAVE_GAME and LOAD_GAME pairs within turns', () => {
    const logEntries: ILogEntry[] = [
      // Turn 1
      {
        id: '1',
        timestamp: new Date('2021-01-01T09:00:00Z'),
        action: GameLogActionWithCount.START_GAME,
        playerIndex: 0,
        currentPlayerIndex: 0,
        turn: 1,
      },
      {
        id: '2',
        timestamp: new Date('2021-01-01T09:05:00Z'),
        action: GameLogActionWithCount.SAVE_GAME,
        playerIndex: 0,
        currentPlayerIndex: 0,
        turn: 1,
      },
      {
        id: '3',
        timestamp: new Date('2021-01-01T09:10:00Z'),
        action: GameLogActionWithCount.LOAD_GAME,
        playerIndex: 0,
        currentPlayerIndex: 0,
        turn: 1,
      },
      {
        id: '4',
        timestamp: new Date('2021-01-01T09:15:00Z'),
        action: GameLogActionWithCount.NEXT_TURN,
        playerIndex: 1,
        currentPlayerIndex: 1,
        turn: 2,
        prevPlayerIndex: 0,
      },
    ];
    const result = calculateTurnDurations(logEntries);

    expect(result).toEqual([
      {
        turn: 2,
        playerIndex: 0,
        start: new Date('2021-01-01T09:00:00Z'),
        end: new Date('2021-01-01T09:15:00Z'),
        duration: 600000, // 15 minutes - 5 minutes pause = 10 minutes
      },
    ]);
  });

  it('should handle multiple SAVE_GAME and LOAD_GAME pairs within a turn', () => {
    const logEntries: ILogEntry[] = [
      // Turn 1
      {
        id: '1',
        timestamp: new Date('2021-01-01T09:00:00Z'),
        action: GameLogActionWithCount.START_GAME,
        playerIndex: 0,
        currentPlayerIndex: 0,
        turn: 1,
      },
      // First save/load pair
      {
        id: '2',
        timestamp: new Date('2021-01-01T09:05:00Z'),
        action: GameLogActionWithCount.SAVE_GAME,
        playerIndex: 0,
        currentPlayerIndex: 0,
        turn: 1,
      },
      {
        id: '3',
        timestamp: new Date('2021-01-01T09:10:00Z'),
        action: GameLogActionWithCount.LOAD_GAME,
        playerIndex: 0,
        currentPlayerIndex: 0,
        turn: 1,
      },
      // Second save/load pair
      {
        id: '4',
        timestamp: new Date('2021-01-01T09:12:00Z'),
        action: GameLogActionWithCount.SAVE_GAME,
        playerIndex: 0,
        currentPlayerIndex: 0,
        turn: 1,
      },
      {
        id: '5',
        timestamp: new Date('2021-01-01T09:14:00Z'),
        action: GameLogActionWithCount.LOAD_GAME,
        playerIndex: 0,
        currentPlayerIndex: 0,
        turn: 1,
      },
      // Next turn
      {
        id: '6',
        timestamp: new Date('2021-01-01T09:20:00Z'),
        action: GameLogActionWithCount.NEXT_TURN,
        playerIndex: 1,
        currentPlayerIndex: 1,
        turn: 2,
        prevPlayerIndex: 0,
      },
    ];
    const result = calculateTurnDurations(logEntries);

    expect(result).toEqual([
      {
        turn: 2,
        playerIndex: 0,
        start: new Date('2021-01-01T09:00:00Z'),
        end: new Date('2021-01-01T09:20:00Z'),
        duration: 780000, // 13 minutes
      },
    ]);
  });

  it('should handle unpaired SAVE_GAME actions within a turn', () => {
    const logEntries: ILogEntry[] = [
      // Turn 1
      {
        id: '1',
        timestamp: new Date('2021-01-01T09:00:00Z'),
        action: GameLogActionWithCount.START_GAME,
        playerIndex: 0,
        currentPlayerIndex: 0,
        turn: 1,
      },
      // Unpaired SAVE_GAME
      {
        id: '2',
        timestamp: new Date('2021-01-01T09:05:00Z'),
        action: GameLogActionWithCount.SAVE_GAME,
        playerIndex: 0,
        currentPlayerIndex: 0,
        turn: 1,
      },
      // Next turn without LOAD_GAME
      {
        id: '3',
        timestamp: new Date('2021-01-01T09:10:00Z'),
        action: GameLogActionWithCount.NEXT_TURN,
        playerIndex: 1,
        currentPlayerIndex: 1,
        turn: 2,
        prevPlayerIndex: 0,
      },
    ];
    const result = calculateTurnDurations(logEntries);

    // The paused time is from SAVE_GAME to NEXT_TURN (5 mins)
    expect(result).toEqual([
      {
        turn: 2,
        playerIndex: 0,
        start: new Date('2021-01-01T09:00:00Z'),
        end: new Date('2021-01-01T09:10:00Z'),
        duration: 300000, // 10 mins - 5 mins pause = 5 mins
      },
    ]);
  });

  it('should handle END_GAME action', () => {
    const logEntries: ILogEntry[] = [
      // Turn 1
      {
        id: '1',
        timestamp: new Date('2021-01-01T08:00:00Z'),
        action: GameLogActionWithCount.START_GAME,
        playerIndex: 0,
        currentPlayerIndex: 0,
        turn: 1,
      },
      // Next turn
      {
        id: '2',
        timestamp: new Date('2021-01-01T08:30:00Z'),
        action: GameLogActionWithCount.NEXT_TURN,
        playerIndex: 1,
        currentPlayerIndex: 1,
        turn: 2,
        prevPlayerIndex: 0,
      },
      // End game
      {
        id: '3',
        timestamp: new Date('2021-01-01T09:00:00Z'),
        action: GameLogActionWithCount.END_GAME,
        playerIndex: 1,
        currentPlayerIndex: 1,
        turn: 2,
      },
    ];
    const result = calculateTurnDurations(logEntries);

    expect(result).toEqual([
      {
        turn: 2,
        playerIndex: 0,
        start: new Date('2021-01-01T08:00:00Z'),
        end: new Date('2021-01-01T08:30:00Z'),
        duration: 1800000, // 30 mins
      },
      {
        turn: 2,
        playerIndex: 1,
        start: new Date('2021-01-01T08:30:00Z'),
        end: new Date('2021-01-01T09:00:00Z'),
        duration: 1800000, // 30 mins
      },
    ]);
  });

  it('should not include actions after END_GAME', () => {
    const logEntries: ILogEntry[] = [
      // Turn 1
      {
        id: '1',
        timestamp: new Date('2021-01-01T08:00:00Z'),
        action: GameLogActionWithCount.START_GAME,
        playerIndex: 0,
        currentPlayerIndex: 0,
        turn: 1,
      },
      // Next turn
      {
        id: '2',
        timestamp: new Date('2021-01-01T08:30:00Z'),
        action: GameLogActionWithCount.NEXT_TURN,
        playerIndex: 1,
        currentPlayerIndex: 1,
        turn: 2,
        prevPlayerIndex: 0,
      },
      // End game
      {
        id: '3',
        timestamp: new Date('2021-01-01T09:00:00Z'),
        action: GameLogActionWithCount.END_GAME,
        playerIndex: 1,
        currentPlayerIndex: 1,
        turn: 2,
      },
      // Action after END_GAME
      {
        id: '4',
        timestamp: new Date('2021-01-01T09:05:00Z'),
        action: GameLogActionWithCount.NEXT_TURN,
        playerIndex: 0,
        currentPlayerIndex: 0,
        turn: 3,
        prevPlayerIndex: 1,
      },
    ];
    const result = calculateTurnDurations(logEntries);

    expect(result).toEqual([
      {
        turn: 2,
        playerIndex: 0,
        start: new Date('2021-01-01T08:00:00Z'),
        end: new Date('2021-01-01T08:30:00Z'),
        duration: 1800000, // 30 mins
      },
      {
        turn: 2,
        playerIndex: 1,
        start: new Date('2021-01-01T08:30:00Z'),
        end: new Date('2021-01-01T09:00:00Z'),
        duration: 1800000, // 30 mins
      },
    ]);
  });

  it('should handle overlapping SAVE_GAME and LOAD_GAME actions gracefully', () => {
    const logEntries: ILogEntry[] = [
      // Turn 1
      {
        id: '1',
        timestamp: new Date('2021-01-01T08:00:00Z'),
        action: GameLogActionWithCount.START_GAME,
        playerIndex: 0,
        currentPlayerIndex: 0,
        turn: 1,
      },
      // SAVE_GAME
      {
        id: '2',
        timestamp: new Date('2021-01-01T08:10:00Z'),
        action: GameLogActionWithCount.SAVE_GAME,
        playerIndex: 0,
        currentPlayerIndex: 0,
        turn: 1,
      },
      // Another SAVE_GAME without LOAD_GAME
      {
        id: '3',
        timestamp: new Date('2021-01-01T08:15:00Z'),
        action: GameLogActionWithCount.SAVE_GAME,
        playerIndex: 0,
        currentPlayerIndex: 0,
        turn: 1,
      },
      // LOAD_GAME
      {
        id: '4',
        timestamp: new Date('2021-01-01T08:20:00Z'),
        action: GameLogActionWithCount.LOAD_GAME,
        playerIndex: 0,
        currentPlayerIndex: 0,
        turn: 1,
      },
      // NEXT_TURN
      {
        id: '5',
        timestamp: new Date('2021-01-01T08:30:00Z'),
        action: GameLogActionWithCount.NEXT_TURN,
        playerIndex: 1,
        currentPlayerIndex: 1,
        turn: 2,
        prevPlayerIndex: 0,
      },
    ];
    const result = calculateTurnDurations(logEntries);

    // The pause time should be from first SAVE_GAME to LOAD_GAME
    // Even though there was an overlapping SAVE_GAME, the function should handle it
    const expectedPauseTime =
      new Date('2021-01-01T08:20:00Z').getTime() - new Date('2021-01-01T08:10:00Z').getTime();

    const expectedDuration =
      new Date('2021-01-01T08:30:00Z').getTime() -
      new Date('2021-01-01T08:00:00Z').getTime() -
      expectedPauseTime;

    expect(result).toEqual([
      {
        turn: 2,
        playerIndex: 0,
        start: new Date('2021-01-01T08:00:00Z'),
        end: new Date('2021-01-01T08:30:00Z'),
        duration: expectedDuration,
      },
    ]);
  });
});
