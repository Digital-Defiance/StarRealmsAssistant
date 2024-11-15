import { getStartDateFromLog } from '@/game/starrealms-lib-log';
import { GameLogAction } from '@/game/enumerations/game-log-action';
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
          gameTime: 0,
          playerIndex: 0,
          currentPlayerIndex: 0,
          turn: 1,
          action: GameLogAction.ADD_TRADE,
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
        gameTime: 0,
        playerIndex: 0,
        currentPlayerIndex: 0,
        turn: 1,
        action: GameLogAction.START_GAME,
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
        gameTime: 0,
        playerIndex: 0,
        currentPlayerIndex: 0,
        turn: 1,
        action: GameLogAction.START_GAME,
      },
      {
        id: '2',
        timestamp: new Date('2023-01-02T01:00:00Z'),
        gameTime: 60000,
        playerIndex: 1,
        currentPlayerIndex: 0,
        turn: 1,
        action: GameLogAction.ADD_TRADE,
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
        gameTime: 0,
        playerIndex: 0,
        currentPlayerIndex: 0,
        turn: 1,
        action: GameLogAction.START_GAME,
      },
      {
        id: '2',
        timestamp: new Date('2023-01-03T01:00:00Z'),
        gameTime: 60000,
        playerIndex: 1,
        currentPlayerIndex: 0,
        turn: 1,
        action: GameLogAction.ADD_TRADE,
      },
      {
        id: '3',
        timestamp: new Date('2023-01-03T02:00:00Z'),
        gameTime: 120000,
        playerIndex: 2,
        currentPlayerIndex: 0,
        turn: 1,
        action: GameLogAction.REMOVE_TRADE,
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
        gameTime: 0,
        playerIndex: 0,
        currentPlayerIndex: 0,
        turn: 1,
        action: GameLogAction.START_GAME,
      },
      {
        id: '2',
        timestamp: new Date('2023-01-01T00:00:00Z'),
        gameTime: 0,
        playerIndex: 1,
        currentPlayerIndex: 0,
        turn: 1,
        action: GameLogAction.ADD_TRADE,
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
