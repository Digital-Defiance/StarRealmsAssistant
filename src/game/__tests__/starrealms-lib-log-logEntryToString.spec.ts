import { ILogEntry } from '@/game/interfaces/log-entry';
import { faker } from '@faker-js/faker';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import { logEntryToString } from '@/game/starrealms-lib-log';

describe('logEntryToString', () => {
  it('should return correct string with player name and count', () => {
    const logEntry: ILogEntry = {
      id: faker.string.uuid(),
      timestamp: new Date(),
      gameTime: 0,
      playerIndex: 0,
      currentPlayerIndex: 0,
      turn: 1,
      action: GameLogAction.ADD_CARDS,
      count: 5,
    };
    expect(logEntryToString(logEntry)).toBe('Added 5 Cards');
  });

  it('should return correct string without player name but with count', () => {
    const logEntry: ILogEntry = {
      id: faker.string.uuid(),
      timestamp: new Date(),
      gameTime: 0,
      playerIndex: 0,
      currentPlayerIndex: 0,
      turn: 1,
      action: GameLogAction.ADD_CARDS,
      count: 5,
    };
    expect(logEntryToString(logEntry)).toBe('Added 5 Cards');
  });

  it('should return correct string with player name but without count', () => {
    const logEntry: ILogEntry = {
      id: faker.string.uuid(),
      timestamp: new Date(),
      gameTime: 0,
      playerIndex: 0,
      currentPlayerIndex: 0,
      turn: 1,
      action: GameLogAction.ADD_CARDS,
    };
    expect(logEntryToString(logEntry)).toBe('Added Cards');
  });

  it('should return correct string without player name and count', () => {
    const logEntry: ILogEntry = {
      id: faker.string.uuid(),
      timestamp: new Date(),
      gameTime: 0,
      playerIndex: 0,
      currentPlayerIndex: 0,
      turn: 1,
      action: GameLogAction.ADD_CARDS,
    };
    expect(logEntryToString(logEntry)).toBe('Added Cards');
  });

  it('should return correct string with special characters in player name', () => {
    const logEntry: ILogEntry = {
      id: faker.string.uuid(),
      timestamp: new Date(),
      gameTime: 0,
      playerIndex: 0,
      currentPlayerIndex: 0,
      turn: 1,
      action: GameLogAction.ADD_CARDS,
      count: 3,
    };
    expect(logEntryToString(logEntry)).toBe('Added 3 Cards');
  });

  it('should handle undefined count correctly', () => {
    const logEntry: ILogEntry = {
      id: faker.string.uuid(),
      timestamp: new Date(),
      gameTime: 0,
      playerIndex: 0,
      currentPlayerIndex: 0,
      turn: 1,
      action: GameLogAction.ADD_CARDS,
      count: undefined,
    };
    expect(logEntryToString(logEntry)).toBe('Added Cards');
  });

  it('should handle correction log entry correctly', () => {
    const logEntry: ILogEntry = {
      id: faker.string.uuid(),
      timestamp: new Date(),
      gameTime: 0,
      playerIndex: 0,
      currentPlayerIndex: 0,
      turn: 1,
      action: GameLogAction.ADD_CARDS,
      count: 2,
      correction: true,
    };
    expect(logEntryToString(logEntry)).toBe('Added 2 Cards');
  });

  it('should handle linked action log entry correctly', () => {
    const logEntry: ILogEntry = {
      id: faker.string.uuid(),
      timestamp: new Date(),
      gameTime: 0,
      playerIndex: 0,
      currentPlayerIndex: 0,
      turn: 1,
      action: GameLogAction.ADD_CARDS,
      count: 4,
      linkedActionId: 'some-linked-action-id',
    };
    expect(logEntryToString(logEntry)).toBe('Added 4 Cards');
  });

  it('should handle log entry with all fields correctly', () => {
    const logEntry: ILogEntry = {
      id: faker.string.uuid(),
      timestamp: new Date(),
      gameTime: 0,
      playerIndex: 0,
      currentPlayerIndex: 0,
      turn: 1,
      action: GameLogAction.ADD_CARDS,
      count: 6,
      correction: true,
      linkedActionId: 'some-linked-action-id',
    };
    expect(logEntryToString(logEntry)).toBe('Added 6 Cards');
  });
});
