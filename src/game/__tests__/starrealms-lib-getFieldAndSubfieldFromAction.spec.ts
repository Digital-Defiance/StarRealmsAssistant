import { getFieldAndSubfieldFromAction } from '@/game/starrealms-lib';
import { GameLogAction } from '@/game/enumerations/game-log-action';

describe('getFieldAndSubfieldFromAction', () => {
  // Test cases for 'turn' field
  it.each([
    [GameLogAction.ADD_TRADE, 'turn', 'trade'],
    [GameLogAction.REMOVE_TRADE, 'turn', 'trade'],
    [GameLogAction.ADD_COMBAT, 'turn', 'combat'],
    [GameLogAction.REMOVE_COMBAT, 'turn', 'combat'],
    [GameLogAction.ADD_CARDS, 'turn', 'cards'],
    [GameLogAction.REMOVE_CARDS, 'turn', 'cards'],
    [GameLogAction.ADD_GAINS, 'turn', 'gains'],
    [GameLogAction.REMOVE_GAINS, 'turn', 'gains'],
    [GameLogAction.ADD_DISCARD, 'turn', 'discard'],
    [GameLogAction.REMOVE_DISCARD, 'turn', 'discard'],
  ])(
    'should return correct field and subfield for %s',
    (action, expectedField, expectedSubfield) => {
      const result = getFieldAndSubfieldFromAction(action);
      expect(result).toEqual({ field: expectedField, subfield: expectedSubfield });
    }
  );

  // Test cases for 'authority' field
  it.each([
    [GameLogAction.ADD_AUTHORITY, 'authority', 'authority'],
    [GameLogAction.REMOVE_AUTHORITY, 'authority', 'authority'],
  ])(
    'should return correct field and subfield for %s',
    (action, expectedField, expectedSubfield) => {
      const result = getFieldAndSubfieldFromAction(action);
      expect(result).toEqual({ field: expectedField, subfield: expectedSubfield });
    }
  );

  // Test cases for 'newTurn' field
  it.each([
    [GameLogAction.ADD_NEXT_TURN_TRADE, 'newTurn', 'trade'],
    [GameLogAction.REMOVE_NEXT_TURN_TRADE, 'newTurn', 'trade'],
    [GameLogAction.ADD_NEXT_TURN_COMBAT, 'newTurn', 'combat'],
    [GameLogAction.REMOVE_NEXT_TURN_COMBAT, 'newTurn', 'combat'],
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
  it.each([GameLogAction.START_GAME, GameLogAction.NEXT_TURN])(
    'should return null for both field and subfield for %s',
    (action) => {
      const result = getFieldAndSubfieldFromAction(action);
      expect(result).toEqual({ field: null, subfield: null });
    }
  );

  // Edge case: testing with an invalid action
  it('should return null for both field and subfield for an invalid action', () => {
    const result = getFieldAndSubfieldFromAction('INVALID_ACTION' as GameLogAction);
    expect(result).toEqual({ field: null, subfield: null });
  });
});
