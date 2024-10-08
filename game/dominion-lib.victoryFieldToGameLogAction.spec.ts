import { victoryFieldToGameLogAction } from '@/game/dominion-lib.log';
import { InvalidFieldError } from '@/game/errors/invalid-field';
import { GameLogActionWithCount } from '@/game/enumerations/game-log-action-with-count';
import { PlayerSubField } from './types';

describe('victoryFieldToGameLogAction', () => {
  it('should return ADD_ACTIONS for turn actions increment', () => {
    expect(victoryFieldToGameLogAction('turn', 'actions', 1)).toBe(
      GameLogActionWithCount.ADD_ACTIONS
    );
  });

  it('should return REMOVE_ACTIONS for turn actions decrement', () => {
    expect(victoryFieldToGameLogAction('turn', 'actions', -1)).toBe(
      GameLogActionWithCount.REMOVE_ACTIONS
    );
  });

  it('should return ADD_BUYS for turn buys increment', () => {
    expect(victoryFieldToGameLogAction('turn', 'buys', 1)).toBe(GameLogActionWithCount.ADD_BUYS);
  });

  it('should return REMOVE_BUYS for turn buys decrement', () => {
    expect(victoryFieldToGameLogAction('turn', 'buys', -1)).toBe(
      GameLogActionWithCount.REMOVE_BUYS
    );
  });

  it('should return ADD_COINS for turn coins increment', () => {
    expect(victoryFieldToGameLogAction('turn', 'coins', 1)).toBe(GameLogActionWithCount.ADD_COINS);
  });

  it('should return REMOVE_COINS for turn coins decrement', () => {
    expect(victoryFieldToGameLogAction('turn', 'coins', -1)).toBe(
      GameLogActionWithCount.REMOVE_COINS
    );
  });

  it('should return ADD_COFFERS for mats coffers increment', () => {
    expect(victoryFieldToGameLogAction('mats', 'coffers', 1)).toBe(
      GameLogActionWithCount.ADD_COFFERS
    );
  });

  it('should return REMOVE_COFFERS for mats coffers decrement', () => {
    expect(victoryFieldToGameLogAction('mats', 'coffers', -1)).toBe(
      GameLogActionWithCount.REMOVE_COFFERS
    );
  });

  it('should return ADD_VILLAGERS for mats villagers increment', () => {
    expect(victoryFieldToGameLogAction('mats', 'villagers', 1)).toBe(
      GameLogActionWithCount.ADD_VILLAGERS
    );
  });

  it('should return REMOVE_VILLAGERS for mats villagers decrement', () => {
    expect(victoryFieldToGameLogAction('mats', 'villagers', -1)).toBe(
      GameLogActionWithCount.REMOVE_VILLAGERS
    );
  });

  it('should return ADD_DEBT for mats debt increment', () => {
    expect(victoryFieldToGameLogAction('mats', 'debt', 1)).toBe(GameLogActionWithCount.ADD_DEBT);
  });

  it('should return REMOVE_DEBT for mats debt decrement', () => {
    expect(victoryFieldToGameLogAction('mats', 'debt', -1)).toBe(
      GameLogActionWithCount.REMOVE_DEBT
    );
  });

  it('should return ADD_FAVORS for mats favors increment', () => {
    expect(victoryFieldToGameLogAction('mats', 'favors', 1)).toBe(
      GameLogActionWithCount.ADD_FAVORS
    );
  });

  it('should return REMOVE_FAVORS for mats favors decrement', () => {
    expect(victoryFieldToGameLogAction('mats', 'favors', -1)).toBe(
      GameLogActionWithCount.REMOVE_FAVORS
    );
  });

  it('should fail for mats invalid field', () => {
    expect(() =>
      victoryFieldToGameLogAction('mats', 'invalid' as any as PlayerSubField<'mats'>, 1)
    ).toThrow(InvalidFieldError);
  });

  it('should return ADD_CURSES for victory curses increment', () => {
    expect(victoryFieldToGameLogAction('victory', 'curses', 1)).toBe(
      GameLogActionWithCount.ADD_CURSES
    );
  });

  it('should return REMOVE_CURSES for victory curses decrement', () => {
    expect(victoryFieldToGameLogAction('victory', 'curses', -1)).toBe(
      GameLogActionWithCount.REMOVE_CURSES
    );
  });

  it('should return ADD_ESTATES for victory estates increment', () => {
    expect(victoryFieldToGameLogAction('victory', 'estates', 1)).toBe(
      GameLogActionWithCount.ADD_ESTATES
    );
  });

  it('should return REMOVE_ESTATES for victory estates decrement', () => {
    expect(victoryFieldToGameLogAction('victory', 'estates', -1)).toBe(
      GameLogActionWithCount.REMOVE_ESTATES
    );
  });

  it('should return ADD_DUCHIES for victory duchies increment', () => {
    expect(victoryFieldToGameLogAction('victory', 'duchies', 1)).toBe(
      GameLogActionWithCount.ADD_DUCHIES
    );
  });

  it('should return REMOVE_DUCHIES for victory duchies decrement', () => {
    expect(victoryFieldToGameLogAction('victory', 'duchies', -1)).toBe(
      GameLogActionWithCount.REMOVE_DUCHIES
    );
  });

  it('should return ADD_PROVINCES for victory provinces increment', () => {
    expect(victoryFieldToGameLogAction('victory', 'provinces', 1)).toBe(
      GameLogActionWithCount.ADD_PROVINCES
    );
  });

  it('should return REMOVE_PROVINCES for victory provinces decrement', () => {
    expect(victoryFieldToGameLogAction('victory', 'provinces', -1)).toBe(
      GameLogActionWithCount.REMOVE_PROVINCES
    );
  });

  it('should return ADD_COLONIES for victory colonies increment', () => {
    expect(victoryFieldToGameLogAction('victory', 'colonies', 1)).toBe(
      GameLogActionWithCount.ADD_COLONIES
    );
  });

  it('should return REMOVE_COLONIES for victory colonies decrement', () => {
    expect(victoryFieldToGameLogAction('victory', 'colonies', -1)).toBe(
      GameLogActionWithCount.REMOVE_COLONIES
    );
  });

  it('should return ADD_VP_TOKENS for victory tokens increment', () => {
    expect(victoryFieldToGameLogAction('victory', 'tokens', 1)).toBe(
      GameLogActionWithCount.ADD_VP_TOKENS
    );
  });

  it('should return REMOVE_VP_TOKENS for victory tokens decrement', () => {
    expect(victoryFieldToGameLogAction('victory', 'tokens', -1)).toBe(
      GameLogActionWithCount.REMOVE_VP_TOKENS
    );
  });

  it('should return ADD_OTHER_VP for victory other increment', () => {
    expect(victoryFieldToGameLogAction('victory', 'other', 1)).toBe(
      GameLogActionWithCount.ADD_OTHER_VP
    );
  });

  it('should return REMOVE_OTHER_VP for victory other decrement', () => {
    expect(victoryFieldToGameLogAction('victory', 'other', -1)).toBe(
      GameLogActionWithCount.REMOVE_OTHER_VP
    );
  });

  it('should fail for victory invalid field', () => {
    expect(() =>
      victoryFieldToGameLogAction('victory', 'invalid' as any as PlayerSubField<'victory'>, 1)
    ).toThrow(InvalidFieldError);
  });

  it('should throw InvalidFieldError for invalid field', () => {
    expect(() => victoryFieldToGameLogAction('invalidField' as any, 'actions', 1)).toThrow(
      InvalidFieldError
    );
  });

  it('should throw InvalidFieldError for invalid subfield', () => {
    expect(() => victoryFieldToGameLogAction('turn', 'invalidSubfield' as any, 1)).toThrow(
      InvalidFieldError
    );
  });

  it('should return ADD_ACTIONS for newTurn actions increment', () => {
    expect(victoryFieldToGameLogAction('newTurn', 'actions', 1)).toBe(
      GameLogActionWithCount.ADD_NEXT_TURN_ACTIONS
    );
  });

  it('should return REMOVE_ACTIONS for newTurn actions decrement', () => {
    expect(victoryFieldToGameLogAction('newTurn', 'actions', -1)).toBe(
      GameLogActionWithCount.REMOVE_NEXT_TURN_ACTIONS
    );
  });

  it('should return ADD_BUYS for newTurn buys increment', () => {
    expect(victoryFieldToGameLogAction('newTurn', 'buys', 1)).toBe(
      GameLogActionWithCount.ADD_NEXT_TURN_BUYS
    );
  });

  it('should return REMOVE_BUYS for newTurn buys decrement', () => {
    expect(victoryFieldToGameLogAction('newTurn', 'buys', -1)).toBe(
      GameLogActionWithCount.REMOVE_NEXT_TURN_BUYS
    );
  });

  it('should return ADD_COINS for newTurn coins increment', () => {
    expect(victoryFieldToGameLogAction('newTurn', 'coins', 1)).toBe(
      GameLogActionWithCount.ADD_NEXT_TURN_COINS
    );
  });

  it('should return REMOVE_COINS for newTurn coins decrement', () => {
    expect(victoryFieldToGameLogAction('newTurn', 'coins', -1)).toBe(
      GameLogActionWithCount.REMOVE_NEXT_TURN_COINS
    );
  });

  // Test for invalid subfield
  it('should throw InvalidFieldError for invalid subfield in newTurn', () => {
    expect(() =>
      victoryFieldToGameLogAction('newTurn', 'invalidSubfield' as PlayerSubField<'newTurn'>, 1)
    ).toThrow(InvalidFieldError);
  });
});
