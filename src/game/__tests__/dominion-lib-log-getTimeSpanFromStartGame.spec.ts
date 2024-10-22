import { getTimeSpanFromStartGame } from '@/game/dominion-lib-log';
import { GameLogActionWithCount } from '@/game/enumerations/game-log-action-with-count';
import { ILogEntry } from '@/game/interfaces/log-entry';

describe('getTimeSpanFromStartGame', () => {
  it('should return zero for the same start date and event time', () => {
    const log: ILogEntry[] = [
      {
        id: '1',
        playerIndex: 0,
        timestamp: new Date('2023-01-01T00:00:00Z'),
        action: GameLogActionWithCount.START_GAME,
      },
    ];
    const eventTime = new Date('2023-01-01T00:00:00Z');
    const result = getTimeSpanFromStartGame(log, eventTime);
    expect(result).toBe('0d 0h 0m 0s');
  });

  it('should return the correct time span for event time after start date', () => {
    const log: ILogEntry[] = [
      {
        id: '1',
        playerIndex: 0,
        timestamp: new Date('2023-01-01T00:00:00Z'),
        action: GameLogActionWithCount.START_GAME,
      },
    ];
    const eventTime = new Date('2023-01-01T01:00:00Z');
    const result = getTimeSpanFromStartGame(log, eventTime);
    expect(result).toBe('0d 1h 0m 0s');
  });

  it('should return the correct time span for event time before start date', () => {
    const log: ILogEntry[] = [
      {
        id: '1',
        playerIndex: 0,
        timestamp: new Date('2023-01-01T01:00:00Z'),
        action: GameLogActionWithCount.START_GAME,
      },
    ];
    const eventTime = new Date('2023-01-01T00:00:00Z');
    const result = getTimeSpanFromStartGame(log, eventTime);
    expect(result).toBe('-0d 1h 0m 0s');
  });

  it('should return the correct time span for event time exactly one day after start date', () => {
    const log: ILogEntry[] = [
      {
        id: '1',
        playerIndex: 0,
        timestamp: new Date('2023-01-01T00:00:00Z'),
        action: GameLogActionWithCount.START_GAME,
      },
    ];
    const eventTime = new Date('2023-01-02T00:00:00Z');
    const result = getTimeSpanFromStartGame(log, eventTime);
    expect(result).toBe('1d 0h 0m 0s');
  });

  it('should return the correct time span for event time exactly one hour after start date', () => {
    const log: ILogEntry[] = [
      {
        id: '1',
        playerIndex: 0,
        timestamp: new Date('2023-01-01T00:00:00Z'),
        action: GameLogActionWithCount.START_GAME,
      },
    ];
    const eventTime = new Date('2023-01-01T01:00:00Z');
    const result = getTimeSpanFromStartGame(log, eventTime);
    expect(result).toBe('0d 1h 0m 0s');
  });

  it('should return the correct time span for event time exactly one minute after start date', () => {
    const log: ILogEntry[] = [
      {
        id: '1',
        playerIndex: 0,
        timestamp: new Date('2023-01-01T00:00:00Z'),
        action: GameLogActionWithCount.START_GAME,
      },
    ];
    const eventTime = new Date('2023-01-01T00:01:00Z');
    const result = getTimeSpanFromStartGame(log, eventTime);
    expect(result).toBe('0d 0h 1m 0s');
  });

  it('should return the correct time span for event time exactly one second after start date', () => {
    const log: ILogEntry[] = [
      {
        id: '1',
        playerIndex: 0,
        timestamp: new Date('2023-01-01T00:00:00Z'),
        action: GameLogActionWithCount.START_GAME,
      },
    ];
    const eventTime = new Date('2023-01-01T00:00:01Z');
    const result = getTimeSpanFromStartGame(log, eventTime);
    expect(result).toBe('0d 0h 0m 1s');
  });

  it('should exclude time between save and load', () => {
    const log: ILogEntry[] = [
      {
        id: '1',
        playerIndex: 0,
        timestamp: new Date('2023-01-01T00:00:00Z'),
        action: GameLogActionWithCount.START_GAME,
      },
      {
        id: '2',
        playerIndex: -1,
        timestamp: new Date('2023-01-01T01:00:00Z'),
        action: GameLogActionWithCount.SAVE_GAME,
      },
      {
        id: '3',
        playerIndex: -1,
        timestamp: new Date('2023-01-01T02:00:00Z'),
        action: GameLogActionWithCount.LOAD_GAME,
      },
    ];
    const eventTime = new Date('2023-01-01T03:00:00Z');
    const result = getTimeSpanFromStartGame(log, eventTime);
    expect(result).toBe('0d 2h 0m 0s');
  });

  it('should handle multiple save and load actions', () => {
    const log: ILogEntry[] = [
      {
        id: '1',
        playerIndex: 0,
        timestamp: new Date('2023-01-01T00:00:00Z'),
        action: GameLogActionWithCount.START_GAME,
      },
      {
        id: '2',
        playerIndex: -1,
        timestamp: new Date('2023-01-01T01:00:00Z'),
        action: GameLogActionWithCount.SAVE_GAME,
      },
      {
        id: '3',
        playerIndex: -1,
        timestamp: new Date('2023-01-01T02:00:00Z'),
        action: GameLogActionWithCount.LOAD_GAME,
      },
      {
        id: '4',
        playerIndex: -1,
        timestamp: new Date('2023-01-01T03:00:00Z'),
        action: GameLogActionWithCount.SAVE_GAME,
      },
      {
        id: '5',
        playerIndex: -1,
        timestamp: new Date('2023-01-01T04:00:00Z'),
        action: GameLogActionWithCount.LOAD_GAME,
      },
    ];
    const eventTime = new Date('2023-01-01T05:00:00Z');
    const result = getTimeSpanFromStartGame(log, eventTime);
    expect(result).toBe('0d 3h 0m 0s');
  });

  it('should handle consecutive saves before a load', () => {
    const log: ILogEntry[] = [
      {
        id: '1',
        playerIndex: 0,
        timestamp: new Date('2023-01-01T00:00:00Z'),
        action: GameLogActionWithCount.START_GAME,
      },
      {
        id: '2',
        playerIndex: -1,
        timestamp: new Date('2023-01-01T01:00:00Z'),
        action: GameLogActionWithCount.SAVE_GAME,
      },
      {
        id: '3',
        playerIndex: -1,
        timestamp: new Date('2023-01-01T02:00:00Z'),
        action: GameLogActionWithCount.SAVE_GAME,
      },
      {
        id: '4',
        playerIndex: -1,
        timestamp: new Date('2023-01-01T03:00:00Z'),
        action: GameLogActionWithCount.LOAD_GAME,
      },
    ];
    const eventTime = new Date('2023-01-01T04:00:00Z');
    const result = getTimeSpanFromStartGame(log, eventTime);
    expect(result).toBe('0d 2h 0m 0s'); // Now passes
  });

  it('should handle no load after save', () => {
    const log: ILogEntry[] = [
      {
        id: '1',
        playerIndex: 0,
        timestamp: new Date('2023-01-01T00:00:00Z'),
        action: GameLogActionWithCount.START_GAME,
      },
      {
        id: '2',
        playerIndex: -1,
        timestamp: new Date('2023-01-01T01:00:00Z'),
        action: GameLogActionWithCount.SAVE_GAME,
      },
    ];
    const eventTime = new Date('2023-01-01T02:00:00Z');
    const result = getTimeSpanFromStartGame(log, eventTime);
    expect(result).toBe('0d 1h 0m 0s');
  });
});
