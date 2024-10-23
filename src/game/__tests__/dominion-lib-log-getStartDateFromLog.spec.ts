import { getStartDateFromLog } from '@/game/dominion-lib-log';
import { GameLogActionWithCount } from '@/game/enumerations/game-log-action-with-count';
import { EmptyLogError } from '@/game/errors/empty-log';
import { ILogEntry } from '@/game/interfaces/log-entry';
import { InvalidLogStartGameError } from '../errors/invalid-log-start-game';

describe('getStartDateFromLog', () => {
  it('should handle the start log being invalid', () => {
    expect(() =>
      getStartDateFromLog([
        {
          id: '1',
          timestamp: new Date(),
          playerIndex: 0,
          currentPlayerIndex: 0,
          action: GameLogActionWithCount.ADD_ACTIONS,
          count: 1,
        },
      ])
    ).toThrow(InvalidLogStartGameError);
  });
  it('should return the timestamp of a single log entry', () => {
    const logEntries: ILogEntry[] = [
      {
        id: '1',
        timestamp: new Date('2023-01-01T00:00:00Z'),
        playerIndex: 0,
        currentPlayerIndex: 0,
        action: GameLogActionWithCount.START_GAME,
      },
    ];
    const result = getStartDateFromLog(logEntries);
    expect(result).toEqual(new Date('2023-01-01T00:00:00Z'));
  });

  it('should return the earliest timestamp from multiple log entries', () => {
    const logEntries: ILogEntry[] = [
      {
        id: '1',
        timestamp: new Date('2023-01-02T00:00:00Z'),
        playerIndex: 0,
        currentPlayerIndex: 0,
        action: GameLogActionWithCount.START_GAME,
      },
      {
        id: '2',
        timestamp: new Date('2023-01-02T01:00:00Z'),
        playerIndex: 1,
        currentPlayerIndex: 0,
        action: GameLogActionWithCount.ADD_COINS,
      },
    ];
    const result = getStartDateFromLog(logEntries);
    expect(result).toEqual(new Date('2023-01-02T00:00:00Z'));
  });

  it('should return the earliest timestamp from log entries in random order', () => {
    const logEntries: ILogEntry[] = [
      {
        id: '1',
        timestamp: new Date('2023-01-03T00:00:00Z'),
        playerIndex: 0,
        currentPlayerIndex: 0,
        action: GameLogActionWithCount.START_GAME,
      },
      {
        id: '2',
        timestamp: new Date('2023-01-03T01:00:00Z'),
        playerIndex: 1,
        currentPlayerIndex: 0,
        action: GameLogActionWithCount.ADD_COINS,
      },
      {
        id: '3',
        timestamp: new Date('2023-01-03T02:00:00Z'),
        playerIndex: 2,
        currentPlayerIndex: 0,
        action: GameLogActionWithCount.REMOVE_COINS,
      },
    ];
    const result = getStartDateFromLog(logEntries);
    expect(result).toEqual(new Date('2023-01-03T00:00:00Z'));
  });

  it('should return the timestamp when all log entries have the same timestamp', () => {
    const logEntries: ILogEntry[] = [
      {
        id: '1',
        timestamp: new Date('2023-01-01T00:00:00Z'),
        playerIndex: 0,
        currentPlayerIndex: 0,
        action: GameLogActionWithCount.START_GAME,
      },
      {
        id: '2',
        timestamp: new Date('2023-01-01T00:00:00Z'),
        playerIndex: 1,
        currentPlayerIndex: 0,
        action: GameLogActionWithCount.ADD_COINS,
      },
    ];
    const result = getStartDateFromLog(logEntries);
    expect(result).toEqual(new Date('2023-01-01T00:00:00Z'));
  });

  it('should handle an empty log gracefully', () => {
    const logEntries: ILogEntry[] = [];
    expect(() => getStartDateFromLog(logEntries)).toThrow(EmptyLogError);
  });
});
