import { createMockGame, createMockPlayer } from '@/__fixtures__/dominion-lib-fixtures';
import { getNextPlayerIndex } from '@/game/dominion-lib';
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
