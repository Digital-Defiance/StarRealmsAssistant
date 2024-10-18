import { applyLogAction } from '@/game/dominion-lib-undo';
import { IGame } from '@/game/interfaces/game';
import { ILogEntry } from '@/game/interfaces/log-entry';
import { GameLogActionWithCount } from '@/game/enumerations/game-log-action-with-count';
import { DefaultTurnDetails, NO_PLAYER } from '@/game/constants';
import { createMockGame } from '@/__fixtures__/dominion-lib-fixtures';
import { NotEnoughProphecyError } from '@/game/errors/not-enough-prophecy';
import { NotEnoughSubfieldError } from '@/game/errors/not-enough-subfield';

describe('applyLogAction', () => {
  let mockGame: IGame;

  beforeEach(() => {
    mockGame = createMockGame(2);
  });

  it('should handle NEXT_TURN action without creating negative counters', () => {
    const mockGame: IGame = createMockGame(2);
    const initialPlayerStates = mockGame.players.map((player) => ({ ...player.turn }));

    const logEntry: ILogEntry = {
      action: GameLogActionWithCount.NEXT_TURN,
      playerIndex: NO_PLAYER,
      id: '1',
      timestamp: new Date(),
      playerTurnDetails: [{ ...DefaultTurnDetails }, { ...DefaultTurnDetails }],
      newPlayerIndex: 1,
      prevPlayerIndex: 0,
    };

    const result = applyLogAction(mockGame, logEntry);

    // Check that the current player index and turn have been updated
    expect(result.currentPlayerIndex).toBe(1);
    expect(result.currentTurn).toBe(2);

    // Check that no player has negative counters
    result.players.forEach((player, index) => {
      expect(player.turn.actions).toBeGreaterThanOrEqual(0);
      expect(player.turn.buys).toBeGreaterThanOrEqual(0);
      expect(player.turn.coins).toBeGreaterThanOrEqual(0);

      // Check that the turn values have been reset to newTurn values
      expect(player.turn).toEqual(mockGame.players[index].newTurn);
    });

    // Verify that the previous turn details are stored in the log entry
    expect(logEntry.playerTurnDetails).toEqual(initialPlayerStates);
  });

  it('should handle NEXT_TURN action', () => {
    const logEntry: ILogEntry = {
      action: GameLogActionWithCount.NEXT_TURN,
      playerIndex: NO_PLAYER,
      id: '1',
      timestamp: new Date(),
      newPlayerIndex: 1,
      prevPlayerIndex: 0,
    };

    const result = applyLogAction(mockGame, logEntry);

    expect(result.currentPlayerIndex).toBe(1);
    expect(result.currentTurn).toBe(2);
  });

  it('should wrap around player index on NEXT_TURN', () => {
    mockGame.currentPlayerIndex = 1;
    const logEntry: ILogEntry = {
      action: GameLogActionWithCount.NEXT_TURN,
      playerIndex: NO_PLAYER,
      id: '1',
      timestamp: new Date(),
      newPlayerIndex: 0,
      prevPlayerIndex: 1,
    };

    const result = applyLogAction(mockGame, logEntry);

    expect(result.currentPlayerIndex).toBe(0);
    expect(result.currentTurn).toBe(2);
  });

  it('should update player field for ADD_ACTIONS', () => {
    const logEntry: ILogEntry = {
      action: GameLogActionWithCount.ADD_ACTIONS,
      playerIndex: 0,
      count: 2,
      id: '1',
      timestamp: new Date(),
    };

    const result = applyLogAction(mockGame, logEntry);

    expect(result.players[0].turn.actions).toBe(3); // Default 1 + 2
  });

  it('should update player field for REMOVE_ACTIONS', () => {
    mockGame.players[0].turn.actions = 3;
    const logEntry: ILogEntry = {
      action: GameLogActionWithCount.REMOVE_ACTIONS,
      playerIndex: 0,
      count: 2,
      id: '1',
      timestamp: new Date(),
    };

    const result = applyLogAction(mockGame, logEntry);

    expect(result.players[0].turn.actions).toBe(1);
  });

  it('should update game-wide counter for ADD_PROPHECY', () => {
    mockGame.options.expansions.risingSun = true;
    mockGame.risingSun.prophecy.suns = 0;
    const logEntry: ILogEntry = {
      action: GameLogActionWithCount.ADD_PROPHECY,
      playerIndex: 0,
      playerName: 'Player 1',
      count: 3,
      id: '1',
      timestamp: new Date(),
    };

    const result = applyLogAction(mockGame, logEntry);

    expect(result.risingSun.prophecy.suns).toBe(3);
  });

  it('should update game-wide counter for REMOVE_PROPHECY', () => {
    mockGame.options.expansions.risingSun = true;
    mockGame.risingSun.prophecy.suns = 5;
    const logEntry: ILogEntry = {
      action: GameLogActionWithCount.REMOVE_PROPHECY,
      playerIndex: NO_PLAYER,
      count: 2,
      id: '1',
      timestamp: new Date(),
    };

    const result = applyLogAction(mockGame, logEntry);

    expect(result.risingSun.prophecy.suns).toBe(3);
  });

  it('should not allow negative player field/subfield counters', () => {
    const logEntry: ILogEntry = {
      action: GameLogActionWithCount.REMOVE_ACTIONS,
      playerIndex: 0,
      count: 2,
      id: '1',
      timestamp: new Date(),
    };

    expect(() => applyLogAction(mockGame, logEntry)).toThrow(NotEnoughSubfieldError);
  });

  it('should not allow negative game-wide counters', () => {
    mockGame.options.expansions.risingSun = true;
    mockGame.risingSun.prophecy.suns = 1;
    const logEntry: ILogEntry = {
      action: GameLogActionWithCount.REMOVE_PROPHECY,
      playerIndex: NO_PLAYER,
      count: 2,
      id: '1',
      timestamp: new Date(),
    };

    expect(() => applyLogAction(mockGame, logEntry)).toThrow(NotEnoughProphecyError);
  });

  it('should use default count of 1 for ADD_PROPHECY when count is not provided', () => {
    mockGame.options.expansions.risingSun = true;
    mockGame.risingSun.prophecy.suns = 0;
    const logEntry: ILogEntry = {
      action: GameLogActionWithCount.ADD_PROPHECY,
      playerIndex: NO_PLAYER,
      id: '1',
      timestamp: new Date(),
    };

    const result = applyLogAction(mockGame, logEntry);

    expect(result.risingSun.prophecy.suns).toBe(1);
  });

  it('should use default count of 1 for REMOVE_PROPHECY when count is not provided', () => {
    mockGame.options.expansions.risingSun = true;
    mockGame.risingSun.prophecy.suns = 3;
    const logEntry: ILogEntry = {
      action: GameLogActionWithCount.REMOVE_PROPHECY,
      playerIndex: NO_PLAYER,
      id: '1',
      timestamp: new Date(),
    };

    const result = applyLogAction(mockGame, logEntry);

    expect(result.risingSun.prophecy.suns).toBe(2);
  });

  it('should handle actions with no count', () => {
    const logEntry: ILogEntry = {
      action: GameLogActionWithCount.ADD_ACTIONS,
      playerIndex: 0,
      id: '1',
      timestamp: new Date(),
    };

    const startingActions = mockGame.players[0].turn.actions;
    const result = applyLogAction(mockGame, logEntry);

    expect(result.players[0].turn.actions).toBe(startingActions + 1);
  });

  it('should ignore actions with invalid player index', () => {
    const logEntry: ILogEntry = {
      action: GameLogActionWithCount.ADD_ACTIONS,
      playerIndex: 99, // Invalid player index
      count: 2,
      id: '1',
      timestamp: new Date(),
    };

    const result = applyLogAction(mockGame, logEntry);

    expect(result).toEqual(mockGame); // Game state should remain unchanged
  });

  it('should handle unknown action types gracefully', () => {
    const logEntry: ILogEntry = {
      action: 'UNKNOWN_ACTION' as GameLogActionWithCount,
      playerIndex: 0,
      count: 1,
      id: '1',
      timestamp: new Date(),
    };

    const result = applyLogAction(mockGame, logEntry);

    expect(result).toEqual(mockGame); // Game state should remain unchanged
  });

  it('should update the selectedPlayerIndex correctly', () => {
    const game: IGame = createMockGame(3, {
      selectedPlayerIndex: 0,
    });

    const logEntry: ILogEntry = {
      id: '1',
      playerIndex: -1,
      timestamp: new Date(),
      action: GameLogActionWithCount.SELECT_PLAYER,
      newPlayerIndex: 2,
    };

    const updatedGame = applyLogAction(game, logEntry);
    expect(updatedGame.selectedPlayerIndex).toBe(2);
  });

  it('should not change the selectedPlayerIndex if newPlayerIndex is not provided', () => {
    const game: IGame = createMockGame(3, {
      selectedPlayerIndex: 0,
    });

    const logEntry: ILogEntry = {
      id: '1',
      playerIndex: -1,
      timestamp: new Date(),
      action: GameLogActionWithCount.SELECT_PLAYER,
    };

    const updatedGame = applyLogAction(game, logEntry);
    expect(updatedGame.selectedPlayerIndex).toBe(0);
  });

  it('should not affect selectedPlayerIndex for other actions', () => {
    const game: IGame = createMockGame(3, {
      selectedPlayerIndex: 0,
    });

    const logEntry: ILogEntry = {
      id: '1',
      playerIndex: 0,
      timestamp: new Date(),
      action: GameLogActionWithCount.ADD_ACTIONS,
      count: 1,
    };

    const updatedGame = applyLogAction(game, logEntry);
    expect(updatedGame.selectedPlayerIndex).toBe(0);
  });
});
