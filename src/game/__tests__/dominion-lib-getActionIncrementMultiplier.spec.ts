import { getActionIncrementMultiplier } from '@/game/dominion-lib';
import { GameLogActionWithCount } from '@/game/enumerations/game-log-action-with-count';
import { NoPlayerActions } from '@/game/constants';

describe('getActionIncrementMultiplier', () => {
  // Test for 'Add' actions
  it.each([
    GameLogActionWithCount.ADD_ACTIONS,
    GameLogActionWithCount.ADD_BUYS,
    GameLogActionWithCount.ADD_COINS,
    GameLogActionWithCount.ADD_COFFERS,
    GameLogActionWithCount.ADD_VILLAGERS,
    GameLogActionWithCount.ADD_DEBT,
    GameLogActionWithCount.ADD_FAVORS,
    GameLogActionWithCount.ADD_CURSES,
    GameLogActionWithCount.ADD_ESTATES,
    GameLogActionWithCount.ADD_DUCHIES,
    GameLogActionWithCount.ADD_PROVINCES,
    GameLogActionWithCount.ADD_COLONIES,
    GameLogActionWithCount.ADD_VP_TOKENS,
    GameLogActionWithCount.ADD_OTHER_VP,
    GameLogActionWithCount.ADD_NEXT_TURN_ACTIONS,
    GameLogActionWithCount.ADD_NEXT_TURN_BUYS,
    GameLogActionWithCount.ADD_NEXT_TURN_COINS,
    GameLogActionWithCount.ADD_PROPHECY,
  ])('should return 1 for %s', (action) => {
    expect(getActionIncrementMultiplier(action)).toBe(1);
  });

  // Test for 'Remove' actions
  it.each([
    GameLogActionWithCount.REMOVE_ACTIONS,
    GameLogActionWithCount.REMOVE_BUYS,
    GameLogActionWithCount.REMOVE_COINS,
    GameLogActionWithCount.REMOVE_COFFERS,
    GameLogActionWithCount.REMOVE_VILLAGERS,
    GameLogActionWithCount.REMOVE_DEBT,
    GameLogActionWithCount.REMOVE_FAVORS,
    GameLogActionWithCount.REMOVE_CURSES,
    GameLogActionWithCount.REMOVE_ESTATES,
    GameLogActionWithCount.REMOVE_DUCHIES,
    GameLogActionWithCount.REMOVE_PROVINCES,
    GameLogActionWithCount.REMOVE_COLONIES,
    GameLogActionWithCount.REMOVE_VP_TOKENS,
    GameLogActionWithCount.REMOVE_OTHER_VP,
    GameLogActionWithCount.REMOVE_NEXT_TURN_ACTIONS,
    GameLogActionWithCount.REMOVE_NEXT_TURN_BUYS,
    GameLogActionWithCount.REMOVE_NEXT_TURN_COINS,
    GameLogActionWithCount.REMOVE_PROPHECY,
  ])('should return -1 for %s', (action) => {
    expect(getActionIncrementMultiplier(action)).toBe(-1);
  });

  // Test for actions that should return 0
  it.each(NoPlayerActions)('should return 0 for %s', (action) => {
    expect(getActionIncrementMultiplier(action)).toBe(0);
  });

  it('should return 0 for an invalid action', () => {
    const invalidAction = 'INVALID_ACTION' as GameLogActionWithCount;
    expect(getActionIncrementMultiplier(invalidAction)).toBe(0);
  });

  it('should return 0 for undefined action', () => {
    expect(getActionIncrementMultiplier(undefined as unknown as GameLogActionWithCount)).toBe(0);
  });

  it('should return 0 for null action', () => {
    expect(getActionIncrementMultiplier(null as unknown as GameLogActionWithCount)).toBe(0);
  });

  it('should return 0 for empty string action', () => {
    expect(getActionIncrementMultiplier('' as GameLogActionWithCount)).toBe(0);
  });
});
