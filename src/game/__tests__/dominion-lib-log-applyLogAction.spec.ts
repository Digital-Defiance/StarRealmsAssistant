import { applyLogAction } from '@/game/dominion-lib-log';
import { IGame } from '@/game/interfaces/game';
import { ILogEntry } from '@/game/interfaces/log-entry';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import { DefaultTurnDetails } from '@/game/constants';
import { createMockGame } from '@/__fixtures__/dominion-lib-fixtures';
import { NotEnoughProphecyError } from '@/game/errors/not-enough-prophecy';
import { NotEnoughSubfieldError } from '@/game/errors/not-enough-subfield';
import { deepClone } from '@/game/utils';
import { IPlayerGameTurnDetails } from '../interfaces/player-game-turn-details';
import * as dominionLibTime from '@/game/dominion-lib-time';

describe('applyLogAction', () => {
  let mockGame: IGame;
  let consoleErrorSpy: jest.SpyInstance;
  let updateCachesForEntrySpy: jest.SpyInstance;

  beforeEach(() => {
    mockGame = createMockGame(2);

    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {
      /* do nothing */
    });
    updateCachesForEntrySpy = jest.spyOn(dominionLibTime, 'updateCachesForEntry');
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should handle NEXT_TURN action without creating negative counters', () => {
    const mockGame: IGame = createMockGame(2);
    const initialPlayerStates = mockGame.players.map((player) =>
      deepClone<IPlayerGameTurnDetails>(player.turn)
    );

    const logEntry: ILogEntry = {
      action: GameLogAction.NEXT_TURN,
      playerIndex: 1,
      id: '1',
      timestamp: new Date(),
      playerTurnDetails: [DefaultTurnDetails(), DefaultTurnDetails()],
      prevPlayerIndex: 0,
      currentPlayerIndex: 1,
      turn: 2,
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
    expect(updateCachesForEntrySpy).toHaveBeenCalledTimes(1);
  });

  it('should handle NEXT_TURN action', () => {
    const logEntry: ILogEntry = {
      action: GameLogAction.NEXT_TURN,
      playerIndex: 1,
      id: '1',
      timestamp: new Date(),
      prevPlayerIndex: 0,
      currentPlayerIndex: 1,
      turn: 2,
    };

    const result = applyLogAction(mockGame, logEntry);

    expect(result.currentPlayerIndex).toBe(1);
    expect(result.currentTurn).toBe(2);
    expect(updateCachesForEntrySpy).toHaveBeenCalledTimes(1);
  });

  it('should wrap around player index on NEXT_TURN', () => {
    mockGame.currentPlayerIndex = 1;
    const logEntry: ILogEntry = {
      action: GameLogAction.NEXT_TURN,
      playerIndex: 0,
      id: '1',
      timestamp: new Date(),
      prevPlayerIndex: 1,
      currentPlayerIndex: 0,
      turn: 2,
    };

    const result = applyLogAction(mockGame, logEntry);

    expect(result.currentPlayerIndex).toBe(0);
    expect(result.currentTurn).toBe(2);
    expect(updateCachesForEntrySpy).toHaveBeenCalledTimes(1);
  });

  it('should update player field for ADD_ACTIONS', () => {
    const logEntry: ILogEntry = {
      action: GameLogAction.ADD_ACTIONS,
      playerIndex: 0,
      count: 2,
      id: '1',
      timestamp: new Date(),
      currentPlayerIndex: 0,
      turn: 1,
    };

    const result = applyLogAction(mockGame, logEntry);

    expect(result.players[0].turn.actions).toBe(3); // Default 1 + 2
    expect(updateCachesForEntrySpy).toHaveBeenCalledTimes(1);
  });

  it('should update player field for REMOVE_ACTIONS', () => {
    mockGame.players[0].turn.actions = 3;
    const logEntry: ILogEntry = {
      action: GameLogAction.REMOVE_ACTIONS,
      playerIndex: 0,
      count: 2,
      id: '1',
      timestamp: new Date(),
      currentPlayerIndex: 0,
      turn: 1,
    };

    const result = applyLogAction(mockGame, logEntry);

    expect(result.players[0].turn.actions).toBe(1);
    expect(updateCachesForEntrySpy).toHaveBeenCalledTimes(1);
  });

  it('should update game-wide counter for ADD_PROPHECY', () => {
    mockGame.options.expansions.risingSun = true;
    mockGame.expansions.risingSun.prophecy.suns = 0;
    const logEntry: ILogEntry = {
      action: GameLogAction.ADD_PROPHECY,
      playerIndex: 0,
      count: 3,
      id: '1',
      timestamp: new Date(),
      currentPlayerIndex: 0,
      turn: 1,
    };

    const result = applyLogAction(mockGame, logEntry);

    expect(result.expansions.risingSun.prophecy.suns).toBe(3);
    expect(updateCachesForEntrySpy).toHaveBeenCalledTimes(1);
  });

  it('should update game-wide counter for REMOVE_PROPHECY', () => {
    mockGame.options.expansions.risingSun = true;
    mockGame.expansions.risingSun.prophecy.suns = 5;
    const logEntry: ILogEntry = {
      action: GameLogAction.REMOVE_PROPHECY,
      playerIndex: 0,
      count: 2,
      id: '1',
      timestamp: new Date(),
      currentPlayerIndex: 0,
      turn: 1,
    };

    const result = applyLogAction(mockGame, logEntry);

    expect(result.expansions.risingSun.prophecy.suns).toBe(3);
    expect(updateCachesForEntrySpy).toHaveBeenCalledTimes(1);
  });

  it('should not allow negative player field/subfield counters', () => {
    const logEntry: ILogEntry = {
      action: GameLogAction.REMOVE_ACTIONS,
      playerIndex: 0,
      count: 2,
      id: '1',
      timestamp: new Date(),
      currentPlayerIndex: 0,
      turn: 1,
    };

    expect(() => applyLogAction(mockGame, logEntry)).toThrow(NotEnoughSubfieldError);
    expect(updateCachesForEntrySpy).toHaveBeenCalledTimes(0);
  });

  it('should not allow negative game-wide counters', () => {
    mockGame.options.expansions.risingSun = true;
    mockGame.expansions.risingSun = { prophecy: { suns: 1 }, greatLeaderProphecy: true };
    const logEntry: ILogEntry = {
      action: GameLogAction.REMOVE_PROPHECY,
      playerIndex: 0,
      count: 2,
      id: '1',
      timestamp: new Date(),
      currentPlayerIndex: 0,
      turn: 1,
    };

    expect(() => applyLogAction(mockGame, logEntry)).toThrow(NotEnoughProphecyError);
    expect(updateCachesForEntrySpy).toHaveBeenCalledTimes(0);
  });

  it('should use default count of 1 for ADD_PROPHECY when count is not provided', () => {
    mockGame.options.expansions.risingSun = true;
    mockGame.expansions.risingSun.prophecy.suns = 0;
    const logEntry: ILogEntry = {
      action: GameLogAction.ADD_PROPHECY,
      playerIndex: 0,
      id: '1',
      timestamp: new Date(),
      currentPlayerIndex: 0,
      turn: 1,
    };

    const result = applyLogAction(mockGame, logEntry);

    expect(result.expansions.risingSun.prophecy.suns).toBe(1);
    expect(updateCachesForEntrySpy).toHaveBeenCalledTimes(1);
  });

  it('should use default count of 1 for REMOVE_PROPHECY when count is not provided', () => {
    mockGame.options.expansions.risingSun = true;
    mockGame.expansions.risingSun.prophecy.suns = 3;
    const logEntry: ILogEntry = {
      action: GameLogAction.REMOVE_PROPHECY,
      playerIndex: 0,
      id: '1',
      timestamp: new Date(),
      currentPlayerIndex: 0,
      turn: 1,
    };

    const result = applyLogAction(mockGame, logEntry);

    expect(result.expansions.risingSun.prophecy.suns).toBe(2);
    expect(updateCachesForEntrySpy).toHaveBeenCalledTimes(1);
  });

  it('should handle actions with no count', () => {
    const logEntry: ILogEntry = {
      action: GameLogAction.ADD_ACTIONS,
      playerIndex: 0,
      id: '1',
      timestamp: new Date(),
      currentPlayerIndex: 0,
      turn: 1,
    };

    const startingActions = mockGame.players[0].turn.actions;
    const result = applyLogAction(mockGame, logEntry);

    expect(result.players[0].turn.actions).toBe(startingActions + 1);
    expect(updateCachesForEntrySpy).toHaveBeenCalledTimes(1);
  });

  it('should throw for actions with invalid player index', () => {
    const logEntry: ILogEntry = {
      action: GameLogAction.ADD_ACTIONS,
      playerIndex: 99, // Invalid player index
      count: 2,
      id: '1',
      timestamp: new Date(),
      currentPlayerIndex: 0,
      turn: 1,
    };

    expect(() => applyLogAction(mockGame, logEntry)).toThrow(Error('Invalid player index: 99'));
    expect(updateCachesForEntrySpy).toHaveBeenCalledTimes(0);
  });

  it('should throw for unknown action types', () => {
    const logEntry: ILogEntry = {
      action: 'UNKNOWN_ACTION' as GameLogAction,
      playerIndex: 0,
      count: 1,
      id: '1',
      timestamp: new Date(),
      currentPlayerIndex: 0,
      turn: 1,
    };

    expect(() => applyLogAction(mockGame, logEntry)).toThrow(
      Error('Invalid log entry action: UNKNOWN_ACTION')
    );
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(updateCachesForEntrySpy).not.toHaveBeenCalled();
  });

  it('should update the selectedPlayerIndex correctly', () => {
    const game: IGame = createMockGame(3, {
      selectedPlayerIndex: 0,
    });

    const logEntry: ILogEntry = {
      id: '1',
      playerIndex: 2,
      timestamp: new Date(),
      action: GameLogAction.SELECT_PLAYER,
      currentPlayerIndex: 2,
      turn: 1,
    };

    const updatedGame = applyLogAction(game, logEntry);
    expect(updatedGame.selectedPlayerIndex).toBe(2);
    expect(updateCachesForEntrySpy).toHaveBeenCalledTimes(1);
  });

  it('should change the selectedPlayerIndex for select_player', () => {
    const game: IGame = createMockGame(3, {
      selectedPlayerIndex: 2,
    });

    const logEntry: ILogEntry = {
      id: '1',
      playerIndex: 0,
      timestamp: new Date(),
      action: GameLogAction.SELECT_PLAYER,
      currentPlayerIndex: 0,
      turn: 1,
    };

    const updatedGame = applyLogAction(game, logEntry);
    expect(updatedGame.selectedPlayerIndex).toBe(0);
    expect(updateCachesForEntrySpy).toHaveBeenCalledTimes(1);
  });

  it('should not affect selectedPlayerIndex for other actions', () => {
    const game: IGame = createMockGame(3, {
      selectedPlayerIndex: 0,
    });

    const logEntry: ILogEntry = {
      id: '1',
      playerIndex: 0,
      timestamp: new Date(),
      action: GameLogAction.ADD_ACTIONS,
      count: 1,
      currentPlayerIndex: 0,
      turn: 1,
    };

    const updatedGame = applyLogAction(game, logEntry);
    expect(updatedGame.selectedPlayerIndex).toBe(0);
    expect(updateCachesForEntrySpy).toHaveBeenCalledTimes(1);
  });
});
