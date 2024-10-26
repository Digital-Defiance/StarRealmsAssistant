import { getSignedCount } from '@/game/dominion-lib-log';
import { ILogEntry } from '@/game/interfaces/log-entry';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import { faker } from '@faker-js/faker';

describe('getSignedCount', () => {
  it('should return defaultValue if count is undefined', () => {
    const log: ILogEntry = {
      id: '1',
      timestamp: new Date(),
      action: GameLogAction.ADD_ACTIONS,
      playerIndex: 0,
      currentPlayerIndex: 0,
      turn: 1,
    };
    const value = faker.number.int({ min: 0, max: 1000 });
    expect(getSignedCount(log, value)).toBe(value);
  });

  it('should return negative count for removal actions', () => {
    const log: ILogEntry = {
      id: '2',
      timestamp: new Date(),
      action: GameLogAction.REMOVE_ACTIONS,
      playerIndex: 0,
      currentPlayerIndex: 0,
      turn: 1,
      count: 5,
    };
    expect(getSignedCount(log)).toBe(-5);
  });

  it('should return positive count for addition actions', () => {
    const log: ILogEntry = {
      id: '3',
      timestamp: new Date(),
      action: GameLogAction.ADD_ACTIONS,
      playerIndex: 0,
      currentPlayerIndex: 0,
      turn: 1,
      count: 5,
    };
    expect(getSignedCount(log)).toBe(5);
  });
});
