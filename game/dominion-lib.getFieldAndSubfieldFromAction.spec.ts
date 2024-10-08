import { getFieldAndSubfieldFromAction } from '@/game/dominion-lib';
import { GameLogActionWithCount } from '@/game/enumerations/game-log-action-with-count';

describe('getFieldAndSubfieldFromAction', () => {
  // Test cases for 'turn' field
  it.each([
    [GameLogActionWithCount.ADD_ACTIONS, 'turn', 'actions'],
    [GameLogActionWithCount.REMOVE_ACTIONS, 'turn', 'actions'],
    [GameLogActionWithCount.ADD_BUYS, 'turn', 'buys'],
    [GameLogActionWithCount.REMOVE_BUYS, 'turn', 'buys'],
    [GameLogActionWithCount.ADD_COINS, 'turn', 'coins'],
    [GameLogActionWithCount.REMOVE_COINS, 'turn', 'coins'],
  ])(
    'should return correct field and subfield for %s',
    (action, expectedField, expectedSubfield) => {
      const result = getFieldAndSubfieldFromAction(action);
      expect(result).toEqual({ field: expectedField, subfield: expectedSubfield });
    }
  );

  // Test cases for 'mats' field
  it.each([
    [GameLogActionWithCount.ADD_COFFERS, 'mats', 'coffers'],
    [GameLogActionWithCount.REMOVE_COFFERS, 'mats', 'coffers'],
    [GameLogActionWithCount.ADD_VILLAGERS, 'mats', 'villagers'],
    [GameLogActionWithCount.REMOVE_VILLAGERS, 'mats', 'villagers'],
    [GameLogActionWithCount.ADD_DEBT, 'mats', 'debt'],
    [GameLogActionWithCount.REMOVE_DEBT, 'mats', 'debt'],
    [GameLogActionWithCount.ADD_FAVORS, 'mats', 'favors'],
    [GameLogActionWithCount.REMOVE_FAVORS, 'mats', 'favors'],
  ])(
    'should return correct field and subfield for %s',
    (action, expectedField, expectedSubfield) => {
      const result = getFieldAndSubfieldFromAction(action);
      expect(result).toEqual({ field: expectedField, subfield: expectedSubfield });
    }
  );

  // Test cases for 'victory' field
  it.each([
    [GameLogActionWithCount.ADD_CURSES, 'victory', 'curses'],
    [GameLogActionWithCount.REMOVE_CURSES, 'victory', 'curses'],
    [GameLogActionWithCount.ADD_ESTATES, 'victory', 'estates'],
    [GameLogActionWithCount.REMOVE_ESTATES, 'victory', 'estates'],
    [GameLogActionWithCount.ADD_DUCHIES, 'victory', 'duchies'],
    [GameLogActionWithCount.REMOVE_DUCHIES, 'victory', 'duchies'],
    [GameLogActionWithCount.ADD_PROVINCES, 'victory', 'provinces'],
    [GameLogActionWithCount.REMOVE_PROVINCES, 'victory', 'provinces'],
    [GameLogActionWithCount.ADD_COLONIES, 'victory', 'colonies'],
    [GameLogActionWithCount.REMOVE_COLONIES, 'victory', 'colonies'],
    [GameLogActionWithCount.ADD_VP_TOKENS, 'victory', 'tokens'],
    [GameLogActionWithCount.REMOVE_VP_TOKENS, 'victory', 'tokens'],
    [GameLogActionWithCount.ADD_OTHER_VP, 'victory', 'other'],
    [GameLogActionWithCount.REMOVE_OTHER_VP, 'victory', 'other'],
  ])(
    'should return correct field and subfield for %s',
    (action, expectedField, expectedSubfield) => {
      const result = getFieldAndSubfieldFromAction(action);
      expect(result).toEqual({ field: expectedField, subfield: expectedSubfield });
    }
  );

  // Test cases for 'newTurn' field
  it.each([
    [GameLogActionWithCount.ADD_NEXT_TURN_ACTIONS, 'newTurn', 'actions'],
    [GameLogActionWithCount.REMOVE_NEXT_TURN_ACTIONS, 'newTurn', 'actions'],
    [GameLogActionWithCount.ADD_NEXT_TURN_BUYS, 'newTurn', 'buys'],
    [GameLogActionWithCount.REMOVE_NEXT_TURN_BUYS, 'newTurn', 'buys'],
    [GameLogActionWithCount.ADD_NEXT_TURN_COINS, 'newTurn', 'coins'],
    [GameLogActionWithCount.REMOVE_NEXT_TURN_COINS, 'newTurn', 'coins'],
  ])(
    'should return correct field and subfield for %s',
    (action, expectedField, expectedSubfield) => {
      const result = getFieldAndSubfieldFromAction(action);
      expect(result).toEqual({ field: expectedField, subfield: expectedSubfield });
    }
  );

  // Test cases for actions that should return null
  it.each([
    GameLogActionWithCount.START_GAME,
    GameLogActionWithCount.NEXT_TURN,
    GameLogActionWithCount.ADD_PROPHECY,
    GameLogActionWithCount.REMOVE_PROPHECY,
  ])('should return null for both field and subfield for %s', (action) => {
    const result = getFieldAndSubfieldFromAction(action);
    expect(result).toEqual({ field: null, subfield: null });
  });

  // Edge case: testing with an invalid action
  it('should return null for both field and subfield for an invalid action', () => {
    const result = getFieldAndSubfieldFromAction('INVALID_ACTION' as GameLogActionWithCount);
    expect(result).toEqual({ field: null, subfield: null });
  });
});
