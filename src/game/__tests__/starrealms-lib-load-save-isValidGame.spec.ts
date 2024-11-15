import { createMockGame } from '@/__fixtures__/starrealms-lib-fixtures';
import { isValidGame } from '@/game/starrealms-lib-load-save';
import { IGame } from '@/game/interfaces/game';

describe('isValidGame', () => {
  it('should return true for a valid game object', () => {
    const validGame: IGame = createMockGame(2);

    expect(isValidGame(validGame)).toBe(true);
  });

  it('should return false for an invalid game object (missing fields)', () => {
    const invalidGame = {
      players: [],
      supply: {},
      options: {},
      log: [],
    };

    expect(isValidGame(invalidGame)).toBe(false);
  });

  it('should return false for an invalid game object (incorrect types)', () => {
    const invalidGame = {
      players: 'not an array',
      supply: 'not an object',
      options: 'not an object',
      log: 'not an array',
      currentTurn: 'not a number',
      currentPlayerIndex: 'not a number',
    };

    expect(isValidGame(invalidGame)).toBe(false);
  });

  it('should return false for an empty object', () => {
    expect(isValidGame({})).toBe(false);
  });

  it('should return false for null', () => {
    expect(isValidGame(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isValidGame(undefined)).toBe(false);
  });
});
