import { getSignedCount } from '@/game/dominion-lib-log';
import { ILogEntry } from '@/game/interfaces/log-entry';
import { GameLogActionWithCount } from '@/game/enumerations/game-log-action-with-count';

describe('getSignedCount', () => {
  it('should return 0 if count is undefined', () => {
    const log: ILogEntry = {
      id: '1',
      timestamp: new Date(),
      action: GameLogActionWithCount.ADD_ACTIONS,
      playerIndex: 0,
      currentPlayerIndex: 0,
      turn: 1,
    };
    expect(getSignedCount(log)).toBe(0);
  });

  it('should return negative count for removal actions', () => {
    const log: ILogEntry = {
      id: '2',
      timestamp: new Date(),
      action: GameLogActionWithCount.REMOVE_ACTIONS,
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
      action: GameLogActionWithCount.ADD_ACTIONS,
      playerIndex: 0,
      currentPlayerIndex: 0,
      turn: 1,
      count: 5,
    };
    expect(getSignedCount(log)).toBe(5);
  });
});
