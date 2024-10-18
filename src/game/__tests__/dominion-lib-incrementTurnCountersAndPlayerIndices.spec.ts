import { incrementTurnCountersAndPlayerIndices, getNextPlayerIndex } from '@/game/dominion-lib';
import { createMockGame, createMockPlayer } from '@/__fixtures__/dominion-lib-fixtures';
import { IGame } from '@/game/interfaces/game';

jest.mock('@/game/dominion-lib', () => {
  const originalModule = jest.requireActual('@/game/dominion-lib');
  return {
    ...originalModule,
    getNextPlayerIndex: jest.fn(),
  };
});

describe('incrementTurnCountersAndPlayerIndices', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should increment the turn counter and update player indices', () => {
    const prevGame: IGame = createMockGame(2, {
      currentTurn: 1,
      currentPlayerIndex: 0,
      selectedPlayerIndex: 0,
    });

    (getNextPlayerIndex as jest.Mock).mockReturnValue(1);

    const updatedGame = incrementTurnCountersAndPlayerIndices(prevGame);

    expect(updatedGame.currentTurn).toBe(2);
    expect(updatedGame.currentPlayerIndex).toBe(1);
    expect(updatedGame.selectedPlayerIndex).toBe(1);
  });

  it('should handle the case when there are no players', () => {
    const prevGame: IGame = createMockGame(2, {
      players: [],
      currentTurn: 1,
      currentPlayerIndex: 0,
      selectedPlayerIndex: 0,
    });

    (getNextPlayerIndex as jest.Mock).mockReturnValue(-1);

    const updatedGame = incrementTurnCountersAndPlayerIndices(prevGame);

    expect(updatedGame.currentTurn).toBe(2);
    expect(updatedGame.currentPlayerIndex).toBe(-1);
    expect(updatedGame.selectedPlayerIndex).toBe(-1);
  });

  it('should handle the case when the current player is the last player', () => {
    const prevGame: IGame = createMockGame(2, {
      currentTurn: 1,
      currentPlayerIndex: 1,
      selectedPlayerIndex: 1,
    });

    (getNextPlayerIndex as jest.Mock).mockReturnValue(0);

    const updatedGame = incrementTurnCountersAndPlayerIndices(prevGame);

    expect(updatedGame.currentTurn).toBe(2);
    expect(updatedGame.currentPlayerIndex).toBe(0);
    expect(updatedGame.selectedPlayerIndex).toBe(0);
  });

  it('should handle the case when there is only one player', () => {
    const prevGame: IGame = createMockGame(2, {
      players: [createMockPlayer()],
      currentTurn: 1,
      currentPlayerIndex: 0,
      selectedPlayerIndex: 0,
    });

    (getNextPlayerIndex as jest.Mock).mockReturnValue(0);

    const updatedGame = incrementTurnCountersAndPlayerIndices(prevGame);

    expect(updatedGame.currentTurn).toBe(2);
    expect(updatedGame.currentPlayerIndex).toBe(0);
    expect(updatedGame.selectedPlayerIndex).toBe(0);
  });

  it('should handle the case when the game has multiple players and cycles through them', () => {
    const prevGame: IGame = createMockGame(3, {
      currentTurn: 1,
      currentPlayerIndex: 0,
      selectedPlayerIndex: 0,
    });

    (getNextPlayerIndex as jest.Mock).mockReturnValue(1);

    const updatedGame = incrementTurnCountersAndPlayerIndices(prevGame);

    expect(updatedGame.currentTurn).toBe(2);
    expect(updatedGame.currentPlayerIndex).toBe(1);
    expect(updatedGame.selectedPlayerIndex).toBe(1);

    (getNextPlayerIndex as jest.Mock).mockReturnValue(2);

    const updatedGame2 = incrementTurnCountersAndPlayerIndices(updatedGame);

    expect(updatedGame2.currentTurn).toBe(3);
    expect(updatedGame2.currentPlayerIndex).toBe(2);
    expect(updatedGame2.selectedPlayerIndex).toBe(2);

    (getNextPlayerIndex as jest.Mock).mockReturnValue(0);

    const updatedGame3 = incrementTurnCountersAndPlayerIndices(updatedGame2);

    expect(updatedGame3.currentTurn).toBe(4);
    expect(updatedGame3.currentPlayerIndex).toBe(0);
    expect(updatedGame3.selectedPlayerIndex).toBe(0);
  });
});
