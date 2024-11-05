import { createMockGame, createMockPlayer } from '@/__fixtures__/dominion-lib-fixtures';
import { getNextPlayerIndex, getNextPlayerIndexByIndex } from '@/game/dominion-lib';
import { IGame } from '@/game/interfaces/game';

describe('getNextPlayerIndex', () => {
  it('should return -1 when there are no players', () => {
    // force a no player game
    const prevGame: IGame = createMockGame(2, { players: [], currentPlayerIndex: -1 });
    const result = getNextPlayerIndex(prevGame);
    expect(result).toBe(-1);
  });

  it('should return 0 when there is only one player', () => {
    // force a one player game
    const prevGame: IGame = createMockGame(2, {
      currentPlayerIndex: 0,
      players: [createMockPlayer()],
    });
    const result = getNextPlayerIndex(prevGame);
    expect(result).toBe(0);
  });

  it('should return the next player index when current player is not the last player', () => {
    const prevGame: IGame = createMockGame(3, {
      currentPlayerIndex: 1,
    });
    const result = getNextPlayerIndex(prevGame);
    expect(result).toBe(2);
  });

  it('should return 0 when the current player is the last player', () => {
    const prevGame: IGame = createMockGame(3, {
      currentPlayerIndex: 2,
    });
    const result = getNextPlayerIndex(prevGame);
    expect(result).toBe(0);
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
    expect(getNextPlayerIndexByIndex(-1, 4)).toBe(0);
  });

  test('should handle current player index greater than player count', () => {
    expect(getNextPlayerIndexByIndex(5, 4)).toBe(2);
  });
});
