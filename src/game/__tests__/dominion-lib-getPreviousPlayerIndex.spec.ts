import { createMockGame, createMockPlayer } from '@/__fixtures__/dominion-lib-fixtures';
import {
  getNextPlayerIndexByIndex,
  getPreviousPlayerIndex,
  getPreviousPlayerIndexByIndex,
} from '@/game/dominion-lib';
import { IGame } from '@/game/interfaces/game';
import { NO_PLAYER } from '../constants';

describe('getPreviousPlayerIndex', () => {
  it('should return -1 when there are no players', () => {
    // force a no player game
    const prevGame: IGame = createMockGame(2, {
      players: [],
      currentPlayerIndex: -1,
      currentTurn: 2,
    });
    const result = getPreviousPlayerIndex(prevGame);
    expect(result).toBe(NO_PLAYER);
  });

  it('should return -1 when there is no previous turn', () => {
    // force a no player game
    const prevGame: IGame = createMockGame(2, { players: [], currentTurn: 1 });
    const result = getPreviousPlayerIndex(prevGame);
    expect(result).toBe(NO_PLAYER);
  });

  it('should return 0 when there is only one player', () => {
    // force a one player game
    const prevGame: IGame = createMockGame(2, {
      currentPlayerIndex: 0,
      players: [createMockPlayer()],
      currentTurn: 2,
    });
    const result = getPreviousPlayerIndex(prevGame);
    expect(result).toBe(0);
  });

  it('should return the previous player index when current player is not the first player', () => {
    const prevGame: IGame = createMockGame(3, {
      currentPlayerIndex: 1,
      currentTurn: 2,
    });
    const result = getPreviousPlayerIndex(prevGame);
    expect(result).toBe(0);
  });

  it('should return the last player index when the current player is the first player', () => {
    const prevGame: IGame = createMockGame(3, {
      currentPlayerIndex: 0,
      currentTurn: 2,
    });
    const result = getPreviousPlayerIndex(prevGame);
    expect(result).toBe(2);
  });
});

describe('getPreviousPlayerIndexByIndex', () => {
  test('should return the previous player index in a circular manner', () => {
    expect(getPreviousPlayerIndexByIndex(0, 4)).toBe(3);
    expect(getPreviousPlayerIndexByIndex(1, 4)).toBe(0);
    expect(getPreviousPlayerIndexByIndex(2, 4)).toBe(1);
    expect(getPreviousPlayerIndexByIndex(3, 4)).toBe(2);
  });

  test('should return NO_PLAYER when player count is 0', () => {
    expect(getPreviousPlayerIndexByIndex(0, 0)).toBe(NO_PLAYER);
  });

  test('should handle single player scenario', () => {
    expect(getPreviousPlayerIndexByIndex(0, 1)).toBe(0);
  });

  test('should handle negative current player index', () => {
    expect(getPreviousPlayerIndexByIndex(NO_PLAYER, 4)).toBe(2);
  });

  test('should handle current player index greater than player count', () => {
    expect(getPreviousPlayerIndexByIndex(5, 4)).toBe(0);
  });
});
describe('getNextPlayerIndexByIndex', () => {
  test('should return the next player index in a circular manner', () => {
    expect(getNextPlayerIndexByIndex(0, 4)).toBe(1);
    expect(getNextPlayerIndexByIndex(1, 4)).toBe(2);
    expect(getNextPlayerIndexByIndex(2, 4)).toBe(3);
    expect(getNextPlayerIndexByIndex(3, 4)).toBe(0);
  });

  test('should return -1 if player count is zero', () => {
    expect(getNextPlayerIndexByIndex(0, 0)).toBe(-1);
  });

  test('should handle single player game correctly', () => {
    expect(getNextPlayerIndexByIndex(0, 1)).toBe(0);
  });

  test('should handle negative current player index', () => {
    expect(getNextPlayerIndexByIndex(NO_PLAYER, 4)).toBe(0);
  });

  test('should handle current player index greater than player count', () => {
    expect(getNextPlayerIndexByIndex(5, 4)).toBe(2);
  });
});
