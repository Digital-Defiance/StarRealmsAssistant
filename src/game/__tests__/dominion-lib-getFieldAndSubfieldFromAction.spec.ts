import { getFieldAndSubfieldFromAction } from '@/game/dominion-lib';
import { GameLogAction } from '@/game/enumerations/game-log-action';

describe('getFieldAndSubfieldFromAction', () => {
  // Test cases for 'turn' field
  it.each([
    [GameLogAction.ADD_ACTIONS, 'turn', 'actions'],
    [GameLogAction.REMOVE_ACTIONS, 'turn', 'actions'],
    [GameLogAction.ADD_BUYS, 'turn', 'buys'],
    [GameLogAction.REMOVE_BUYS, 'turn', 'buys'],
    [GameLogAction.ADD_COINS, 'turn', 'coins'],
    [GameLogAction.REMOVE_COINS, 'turn', 'coins'],
    [GameLogAction.ADD_CARDS, 'turn', 'cards'],
    [GameLogAction.REMOVE_CARDS, 'turn', 'cards'],
  ])(
    'should return correct field and subfield for %s',
    (action, expectedField, expectedSubfield) => {
      const result = getFieldAndSubfieldFromAction(action);
      expect(result).toEqual({ field: expectedField, subfield: expectedSubfield });
    }
  );

  // Test cases for 'mats' field
  it.each([
    [GameLogAction.ADD_COFFERS, 'mats', 'coffers'],
    [GameLogAction.REMOVE_COFFERS, 'mats', 'coffers'],
    [GameLogAction.ADD_VILLAGERS, 'mats', 'villagers'],
    [GameLogAction.REMOVE_VILLAGERS, 'mats', 'villagers'],
    [GameLogAction.ADD_DEBT, 'mats', 'debt'],
    [GameLogAction.REMOVE_DEBT, 'mats', 'debt'],
    [GameLogAction.ADD_FAVORS, 'mats', 'favors'],
    [GameLogAction.REMOVE_FAVORS, 'mats', 'favors'],
  ])(
    'should return correct field and subfield for %s',
    (action, expectedField, expectedSubfield) => {
      const result = getFieldAndSubfieldFromAction(action);
      expect(result).toEqual({ field: expectedField, subfield: expectedSubfield });
    }
  );

  // Test cases for 'victory' field
  it.each([
    [GameLogAction.ADD_CURSES, 'victory', 'curses'],
    [GameLogAction.REMOVE_CURSES, 'victory', 'curses'],
    [GameLogAction.ADD_ESTATES, 'victory', 'estates'],
    [GameLogAction.REMOVE_ESTATES, 'victory', 'estates'],
    [GameLogAction.ADD_DUCHIES, 'victory', 'duchies'],
    [GameLogAction.REMOVE_DUCHIES, 'victory', 'duchies'],
    [GameLogAction.ADD_PROVINCES, 'victory', 'provinces'],
    [GameLogAction.REMOVE_PROVINCES, 'victory', 'provinces'],
    [GameLogAction.ADD_COLONIES, 'victory', 'colonies'],
    [GameLogAction.REMOVE_COLONIES, 'victory', 'colonies'],
    [GameLogAction.ADD_VP_TOKENS, 'victory', 'tokens'],
    [GameLogAction.REMOVE_VP_TOKENS, 'victory', 'tokens'],
    [GameLogAction.ADD_OTHER_VP, 'victory', 'other'],
    [GameLogAction.REMOVE_OTHER_VP, 'victory', 'other'],
  ])(
    'should return correct field and subfield for %s',
    (action, expectedField, expectedSubfield) => {
      const result = getFieldAndSubfieldFromAction(action);
      expect(result).toEqual({ field: expectedField, subfield: expectedSubfield });
    }
  );

  // Test cases for 'newTurn' field
  it.each([
    [GameLogAction.ADD_NEXT_TURN_ACTIONS, 'newTurn', 'actions'],
    [GameLogAction.REMOVE_NEXT_TURN_ACTIONS, 'newTurn', 'actions'],
    [GameLogAction.ADD_NEXT_TURN_BUYS, 'newTurn', 'buys'],
    [GameLogAction.REMOVE_NEXT_TURN_BUYS, 'newTurn', 'buys'],
    [GameLogAction.ADD_NEXT_TURN_COINS, 'newTurn', 'coins'],
    [GameLogAction.REMOVE_NEXT_TURN_COINS, 'newTurn', 'coins'],
    [GameLogAction.ADD_NEXT_TURN_CARDS, 'newTurn', 'cards'],
    [GameLogAction.REMOVE_NEXT_TURN_CARDS, 'newTurn', 'cards'],
  ])(
    'should return correct field and subfield for %s',
    (action, expectedField, expectedSubfield) => {
      const result = getFieldAndSubfieldFromAction(action);
      expect(result).toEqual({ field: expectedField, subfield: expectedSubfield });
    }
  );

  // Test cases for actions that should return null
  it.each([
    GameLogAction.START_GAME,
    GameLogAction.NEXT_TURN,
    GameLogAction.ADD_PROPHECY,
    GameLogAction.REMOVE_PROPHECY,
  ])('should return null for both field and subfield for %s', (action) => {
    const result = getFieldAndSubfieldFromAction(action);
    expect(result).toEqual({ field: null, subfield: null });
  });

  // Edge case: testing with an invalid action
  it('should return null for both field and subfield for an invalid action', () => {
    const result = getFieldAndSubfieldFromAction('INVALID_ACTION' as GameLogAction);
    expect(result).toEqual({ field: null, subfield: null });
  });
});
