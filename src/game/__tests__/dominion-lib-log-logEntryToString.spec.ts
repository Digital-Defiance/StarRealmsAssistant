import { ILogEntry } from '@/game/interfaces/log-entry';
import { faker } from '@faker-js/faker';
import { GameLogActionWithCount } from '@/game/enumerations/game-log-action-with-count';
import { logEntryToString } from '@/game/dominion-lib-log';

describe('logEntryToString', () => {
  it('should return correct string with player name and count', () => {
    const logEntry: ILogEntry = {
      id: faker.string.uuid(),
      timestamp: new Date(),
      playerIndex: 0,
      playerName: 'Alice',
      action: GameLogActionWithCount.ADD_COINS,
      count: 5,
    };
    expect(logEntryToString(logEntry)).toBe('<Alice> Added 5 Coins');
  });

  it('should return correct string without player name but with count', () => {
    const logEntry: ILogEntry = {
      id: faker.string.uuid(),
      timestamp: new Date(),
      playerIndex: 0,
      action: GameLogActionWithCount.ADD_COINS,
      count: 5,
    };
    expect(logEntryToString(logEntry)).toBe('Added 5 Coins');
  });

  it('should return correct string with player name but without count', () => {
    const logEntry: ILogEntry = {
      id: faker.string.uuid(),
      timestamp: new Date(),
      playerIndex: 0,
      playerName: 'Bob',
      action: GameLogActionWithCount.ADD_COINS,
    };
    expect(logEntryToString(logEntry)).toBe('<Bob> Added Coins');
  });

  it('should return correct string without player name and count', () => {
    const logEntry: ILogEntry = {
      id: faker.string.uuid(),
      timestamp: new Date(),
      playerIndex: 0,
      action: GameLogActionWithCount.ADD_COINS,
    };
    expect(logEntryToString(logEntry)).toBe('Added Coins');
  });

  it('should return correct string with special characters in player name', () => {
    const logEntry: ILogEntry = {
      id: faker.string.uuid(),
      timestamp: new Date(),
      playerIndex: 0,
      playerName: 'Alice & Bob',
      action: GameLogActionWithCount.ADD_COINS,
      count: 3,
    };
    expect(logEntryToString(logEntry)).toBe('<Alice & Bob> Added 3 Coins');
  });

  it('should handle undefined count correctly', () => {
    const logEntry: ILogEntry = {
      id: faker.string.uuid(),
      timestamp: new Date(),
      playerIndex: 0,
      playerName: 'Charlie',
      action: GameLogActionWithCount.ADD_COINS,
      count: undefined,
    };
    expect(logEntryToString(logEntry)).toBe('<Charlie> Added Coins');
  });

  it('should handle correction log entry correctly', () => {
    const logEntry: ILogEntry = {
      id: faker.string.uuid(),
      timestamp: new Date(),
      playerIndex: 0,
      playerName: 'Dave',
      action: GameLogActionWithCount.ADD_COINS,
      count: 2,
      correction: true,
    };
    expect(logEntryToString(logEntry)).toBe('<Dave> Added 2 Coins (Correction)');
  });

  it('should handle linked action log entry correctly', () => {
    const logEntry: ILogEntry = {
      id: faker.string.uuid(),
      timestamp: new Date(),
      playerIndex: 0,
      playerName: 'Eve',
      action: GameLogActionWithCount.ADD_COINS,
      count: 4,
      linkedAction: 'some-linked-action-id',
    };
    expect(logEntryToString(logEntry)).toBe('<Eve> Added 4 Coins');
  });

  it('should handle log entry with all fields correctly', () => {
    const logEntry: ILogEntry = {
      id: faker.string.uuid(),
      timestamp: new Date(),
      playerIndex: 0,
      playerName: 'Frank',
      action: GameLogActionWithCount.ADD_COINS,
      count: 6,
      correction: true,
      linkedAction: 'some-linked-action-id',
    };
    expect(logEntryToString(logEntry)).toBe('<Frank> Added 6 Coins (Correction)');
  });
});
