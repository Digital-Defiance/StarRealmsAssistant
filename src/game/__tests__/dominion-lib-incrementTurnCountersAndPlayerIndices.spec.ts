import { incrementTurnCountersAndPlayerIndices, EmptyGameState } from '@/game/dominion-lib';
import { IGame } from '@/game/interfaces/game';

describe('incrementTurnCounters', () => {
  let mockGame: IGame;

  beforeEach(() => {
    mockGame = {
      ...EmptyGameState,
      players: [{ name: 'Player 1' }, { name: 'Player 2' }, { name: 'Player 3' }] as any,
      currentTurn: 1,
      currentPlayerIndex: 0,
      selectedPlayerIndex: 0,
    };
  });

  it('should increment the turn counter', () => {
    const result = incrementTurnCountersAndPlayerIndices(mockGame);
    expect(result.currentTurn).toBe(2);
  });

  it('should move to the next player', () => {
    const result = incrementTurnCountersAndPlayerIndices(mockGame);
    expect(result.currentPlayerIndex).toBe(1);
    expect(result.selectedPlayerIndex).toBe(1);
  });

  it('should wrap around to the first player after the last player', () => {
    mockGame.currentPlayerIndex = 2;
    mockGame.selectedPlayerIndex = 2;
    const result = incrementTurnCountersAndPlayerIndices(mockGame);
    expect(result.currentPlayerIndex).toBe(0);
    expect(result.selectedPlayerIndex).toBe(0);
  });

  it('should handle a game with only one player', () => {
    mockGame.players = [{ name: 'Solo Player' }] as any;
    mockGame.currentPlayerIndex = 0;
    mockGame.selectedPlayerIndex = 0;
    const result = incrementTurnCountersAndPlayerIndices(mockGame);
    expect(result.currentTurn).toBe(2);
    expect(result.currentPlayerIndex).toBe(0);
    expect(result.selectedPlayerIndex).toBe(0);
  });

  it('should not modify other game state properties', () => {
    const result = incrementTurnCountersAndPlayerIndices(mockGame);
    expect(result.players).toEqual(mockGame.players);
    expect(result.supply).toEqual(mockGame.supply);
    expect(result.options).toEqual(mockGame.options);
    // Add more assertions for other properties as needed
  });

  it('should handle edge case with no players', () => {
    mockGame.players = [];
    mockGame.currentPlayerIndex = -1;
    mockGame.selectedPlayerIndex = -1;
    const result = incrementTurnCountersAndPlayerIndices(mockGame);
    expect(result.currentTurn).toBe(2);
    expect(result.currentPlayerIndex).toBe(-1); // stays -1
    expect(result.selectedPlayerIndex).toBe(-1); // stays -1
  });

  it('should handle very large turn numbers', () => {
    mockGame.currentTurn = Number.MAX_SAFE_INTEGER;
    const result = incrementTurnCountersAndPlayerIndices(mockGame);
    expect(result.currentTurn).toBe(Number.MAX_SAFE_INTEGER + 1);
  });
});
