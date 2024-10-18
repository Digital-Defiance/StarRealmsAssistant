import { createMockGame, createMockPlayer } from '@/__fixtures__/dominion-lib-fixtures';
import { getPreviousPlayerIndex } from '@/game/dominion-lib';
import { IGame } from '@/game/interfaces/game';

describe('getPreviousPlayerIndex', () => {
  it('should return -1 when there are no players', () => {
    // force a no player game
    const prevGame: IGame = createMockGame(2, { players: [], currentPlayerIndex: -1 });
    const result = getPreviousPlayerIndex(prevGame);
    expect(result).toBe(-1);
  });

  it('should return 0 when there is only one player', () => {
    // force a one player game
    const prevGame: IGame = createMockGame(2, {
      currentPlayerIndex: 0,
      players: [createMockPlayer()],
    });
    const result = getPreviousPlayerIndex(prevGame);
    expect(result).toBe(0);
  });

  it('should return the previous player index when current player is not the first player', () => {
    const prevGame: IGame = createMockGame(3, {
      currentPlayerIndex: 1,
    });
    const result = getPreviousPlayerIndex(prevGame);
    expect(result).toBe(0);
  });

  it('should return the last player index when the current player is the first player', () => {
    const prevGame: IGame = createMockGame(3, {
      currentPlayerIndex: 0,
    });
    const result = getPreviousPlayerIndex(prevGame);
    expect(result).toBe(2);
  });
});
