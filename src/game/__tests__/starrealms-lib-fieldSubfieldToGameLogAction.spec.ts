import { fieldSubfieldToGameLogAction } from '@/game/starrealms-lib-log';
import { InvalidFieldError } from '@/game/errors/invalid-field';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import { PlayerSubField } from '../types';

describe('victoryFieldToGameLogAction', () => {
  it('should return ADD_TRADE for turn actions increment', () => {
    expect(fieldSubfieldToGameLogAction('turn', 'trade', 1)).toBe(GameLogAction.ADD_TRADE);
  });

  it('should return REMOVE_TRADE for turn actions decrement', () => {
    expect(fieldSubfieldToGameLogAction('turn', 'trade', -1)).toBe(GameLogAction.REMOVE_TRADE);
  });

  it('should return ADD_COMBAT for turn buys increment', () => {
    expect(fieldSubfieldToGameLogAction('turn', 'combat', 1)).toBe(GameLogAction.ADD_COMBAT);
  });

  it('should return REMOVE_COMBAT for turn buys decrement', () => {
    expect(fieldSubfieldToGameLogAction('turn', 'combat', -1)).toBe(GameLogAction.REMOVE_COMBAT);
  });

  it('should return ADD_CARDS for turn cards increment', () => {
    expect(fieldSubfieldToGameLogAction('turn', 'cards', 1)).toBe(GameLogAction.ADD_CARDS);
  });

  it('should return REMOVE_CARDS for turn cards decrement', () => {
    expect(fieldSubfieldToGameLogAction('turn', 'cards', -1)).toBe(GameLogAction.REMOVE_CARDS);
  });

  it('should return ADD_GAINS for turn gains increment', () => {
    expect(fieldSubfieldToGameLogAction('turn', 'gains', 1)).toBe(GameLogAction.ADD_GAINS);
  });

  it('should return REMOVE_GAINS for turn gains decrement', () => {
    expect(fieldSubfieldToGameLogAction('turn', 'gains', -1)).toBe(GameLogAction.REMOVE_GAINS);
  });

  it('should return ADD_AUTHORITY for authority increment', () => {
    expect(fieldSubfieldToGameLogAction('authority', 'authority', 1)).toBe(
      GameLogAction.ADD_AUTHORITY
    );
  });

  it('should return REMOVE_AUTHORITY for authority estates decrement', () => {
    expect(fieldSubfieldToGameLogAction('authority', 'authority', -1)).toBe(
      GameLogAction.REMOVE_AUTHORITY
    );
  });

  it('should return ADD_ASSIMILATION for assimilation increment', () => {
    expect(fieldSubfieldToGameLogAction('authority', 'assimilation', 1)).toBe(
      GameLogAction.ADD_ASSIMILATION
    );
  });

  it('should return REMOVE_AUTHORITY for authority estates decrement', () => {
    expect(fieldSubfieldToGameLogAction('authority', 'assimilation', -1)).toBe(
      GameLogAction.REMOVE_ASSIMILATION
    );
  });

  it('should fail for authority invalid field', () => {
    expect(() =>
      fieldSubfieldToGameLogAction(
        'authority',
        'invalid' as unknown as PlayerSubField<'authority'>,
        1
      )
    ).toThrow(InvalidFieldError);
  });

  it('should throw InvalidFieldError for invalid field', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => fieldSubfieldToGameLogAction('invalidField' as any, 'actions', 1)).toThrow(
      InvalidFieldError
    );
  });

  it('should throw InvalidFieldError for invalid subfield', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => fieldSubfieldToGameLogAction('turn', 'invalidSubfield' as any, 1)).toThrow(
      InvalidFieldError
    );
  });

  it('should return ADD_NEXT_TURN_TRADE for newTurn actions increment', () => {
    expect(fieldSubfieldToGameLogAction('newTurn', 'trade', 1)).toBe(
      GameLogAction.ADD_NEXT_TURN_TRADE
    );
  });

  it('should return REMOVE_NEXT_TURN_COMBAT for newTurn actions decrement', () => {
    expect(fieldSubfieldToGameLogAction('newTurn', 'combat', -1)).toBe(
      GameLogAction.REMOVE_NEXT_TURN_COMBAT
    );
  });

  it('should return ADD_NEXT_TURN_CARDS for newTurn cards increment', () => {
    expect(fieldSubfieldToGameLogAction('newTurn', 'cards', 1)).toBe(
      GameLogAction.ADD_NEXT_TURN_CARDS
    );
  });

  it('should return REMOVE_NEXT_TURN_CARDS for newTurn cards decrement', () => {
    expect(fieldSubfieldToGameLogAction('newTurn', 'cards', -1)).toBe(
      GameLogAction.REMOVE_NEXT_TURN_CARDS
    );
  });

  // Test for invalid subfield
  it('should throw InvalidFieldError for invalid subfield in newTurn', () => {
    expect(() =>
      fieldSubfieldToGameLogAction('newTurn', 'invalidSubfield' as PlayerSubField<'newTurn'>, 1)
    ).toThrow(InvalidFieldError);
  });
});
