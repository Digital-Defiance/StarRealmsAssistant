import { applyLogAction } from '@/game/starrealms-lib-log';
import { IGame } from '@/game/interfaces/game';
import { ILogEntry } from '@/game/interfaces/log-entry';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import { DefaultTurnDetails } from '@/game/constants';
import { createMockGame } from '@/__fixtures__/starrealms-lib-fixtures';
import { NotEnoughSubfieldError } from '@/game/errors/not-enough-subfield';
import { deepClone } from '@/game/utils';
import { IPlayerGameTurnDetails } from '../interfaces/player-game-turn-details';
import { IPlayer } from '../interfaces/player';

describe('applyLogAction', () => {
  let mockGame: IGame;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    mockGame = createMockGame(2);

    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {
      /* do nothing */
    });
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should handle NEXT_TURN action without creating negative counters', () => {
    const mockGame: IGame = createMockGame(2);
    const initialPlayerStates = mockGame.players.map((player) =>
      deepClone<IPlayerGameTurnDetails>(player.turn)
    );
    const gameStart = mockGame.log[0].timestamp;

    const logEntry: ILogEntry = {
      action: GameLogAction.NEXT_TURN,
      playerIndex: 1,
      id: '2',
      timestamp: new Date(gameStart.getTime() + 1000),
      gameTime: 1000,
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
    result.players.forEach((player: IPlayer, index: number) => {
      expect(player.turn.trade).toBeGreaterThanOrEqual(0);
      expect(player.turn.combat).toBeGreaterThanOrEqual(0);

      // Check that the turn values have been reset to newTurn values
      expect(player.turn).toEqual(mockGame.players[index].newTurn);
    });

    // Verify that the previous turn details are stored in the log entry
    expect(logEntry.playerTurnDetails).toEqual(initialPlayerStates);
  });

  it('should handle NEXT_TURN action', () => {
    const gameStart = mockGame.log[0].timestamp;
    const logEntry: ILogEntry = {
      action: GameLogAction.NEXT_TURN,
      playerIndex: 1,
      id: '2',
      timestamp: new Date(gameStart.getTime() + 1000),
      gameTime: 1000,
      prevPlayerIndex: 0,
      currentPlayerIndex: 1,
      turn: 2,
    };

    const result = applyLogAction(mockGame, logEntry);

    expect(result.currentPlayerIndex).toBe(1);
    expect(result.currentTurn).toBe(2);
  });

  it('should wrap around player index on NEXT_TURN', () => {
    mockGame.currentPlayerIndex = 1;
    const gameStart = mockGame.log[0].timestamp;
    const logEntry: ILogEntry = {
      action: GameLogAction.NEXT_TURN,
      playerIndex: 0,
      id: '2',
      timestamp: new Date(gameStart.getTime() + 1000),
      gameTime: 1000,
      prevPlayerIndex: 1,
      currentPlayerIndex: 0,
      turn: 2,
    };

    const result = applyLogAction(mockGame, logEntry);

    expect(result.currentPlayerIndex).toBe(0);
    expect(result.currentTurn).toBe(2);
  });

  it('should update player field for ADD_AUTHORITY', () => {
    const gameStart = mockGame.log[0].timestamp;
    const logEntry: ILogEntry = {
      action: GameLogAction.ADD_AUTHORITY,
      playerIndex: 0,
      count: 2,
      id: '2',
      timestamp: new Date(gameStart.getTime() + 1000),
      gameTime: 1000,
      currentPlayerIndex: 0,
      turn: 1,
    };

    const result = applyLogAction(mockGame, logEntry);

    expect(result.players[0].authority.authority).toBe(52); // Default 50 + 2
  });

  it('should update player field for REMOVE_AUTHORITY', () => {
    mockGame.players[0].authority.authority = 53;
    const gameStart = mockGame.log[0].timestamp;
    const logEntry: ILogEntry = {
      action: GameLogAction.REMOVE_AUTHORITY,
      playerIndex: 0,
      count: 2,
      id: '2',
      timestamp: new Date(gameStart.getTime() + 1000),
      gameTime: 1000,
      currentPlayerIndex: 0,
      turn: 1,
    };

    const result = applyLogAction(mockGame, logEntry);

    expect(result.players[0].authority.authority).toBe(51);
  });

  it('should update player field for ADD_ASSIMILATION', () => {
    const gameStart = mockGame.log[0].timestamp;
    const logEntry: ILogEntry = {
      action: GameLogAction.ADD_ASSIMILATION,
      playerIndex: 0,
      count: 2,
      id: '2',
      timestamp: new Date(gameStart.getTime() + 1000),
      gameTime: 1000,
      currentPlayerIndex: 0,
      turn: 1,
    };

    const result = applyLogAction(mockGame, logEntry);

    expect(result.players[0].authority.assimilation).toBe(2); // Default 0 + 2
  });

  it('should update player field for REMOVE_ASSIMILATION', () => {
    mockGame.players[0].authority.assimilation = 3;
    const gameStart = mockGame.log[0].timestamp;
    const logEntry: ILogEntry = {
      action: GameLogAction.REMOVE_ASSIMILATION,
      playerIndex: 0,
      count: 2,
      id: '2',
      timestamp: new Date(gameStart.getTime() + 1000),
      gameTime: 1000,
      currentPlayerIndex: 0,
      turn: 1,
    };

    const result = applyLogAction(mockGame, logEntry);

    expect(result.players[0].authority.assimilation).toBe(1);
  });

  it('should not allow negative player field/subfield counters', () => {
    const gameStart = mockGame.log[0].timestamp;
    const logEntry: ILogEntry = {
      action: GameLogAction.REMOVE_COMBAT,
      playerIndex: 0,
      count: 2,
      id: '2',
      timestamp: new Date(gameStart.getTime() + 1000),
      gameTime: 1000,
      currentPlayerIndex: 0,
      turn: 1,
    };

    expect(() => applyLogAction(mockGame, logEntry)).toThrow(NotEnoughSubfieldError);
  });

  it('should handle actions with no count', () => {
    const gameStart = mockGame.log[0].timestamp;
    const logEntry: ILogEntry = {
      action: GameLogAction.ADD_AUTHORITY,
      playerIndex: 0,
      id: '2',
      timestamp: new Date(gameStart.getTime() + 1000),
      gameTime: 1000,
      currentPlayerIndex: 0,
      turn: 1,
    };

    const startingAuthority = mockGame.players[0].authority.authority;
    const result = applyLogAction(mockGame, logEntry);

    expect(result.players[0].authority.authority).toBe(startingAuthority + 1);
  });

  it('should throw for authority with invalid player index', () => {
    const gameStart = mockGame.log[0].timestamp;
    const logEntry: ILogEntry = {
      action: GameLogAction.ADD_AUTHORITY,
      playerIndex: 99, // Invalid player index
      count: 2,
      id: '2',
      timestamp: new Date(gameStart.getTime() + 1000),
      gameTime: 1000,
      currentPlayerIndex: 0,
      turn: 1,
    };

    expect(() => applyLogAction(mockGame, logEntry)).toThrow(Error('Invalid player index: 99'));
  });

  it('should throw for unknown action types', () => {
    const gameStart = mockGame.log[0].timestamp;
    const logEntry: ILogEntry = {
      action: 'UNKNOWN_ACTION' as GameLogAction,
      playerIndex: 0,
      count: 1,
      id: '2',
      timestamp: new Date(gameStart.getTime() + 1000),
      gameTime: 1000,
      currentPlayerIndex: 0,
      turn: 1,
    };

    expect(() => applyLogAction(mockGame, logEntry)).toThrow(
      Error('Invalid log entry action: UNKNOWN_ACTION')
    );
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should update the selectedPlayerIndex correctly', () => {
    const game: IGame = createMockGame(3, {
      selectedPlayerIndex: 0,
    });
    const gameStart = mockGame.log[0].timestamp;
    const logEntry: ILogEntry = {
      id: '2',
      playerIndex: 2,
      timestamp: new Date(gameStart.getTime() + 1000),
      gameTime: 1000,
      action: GameLogAction.SELECT_PLAYER,
      currentPlayerIndex: 2,
      turn: 1,
    };

    const updatedGame = applyLogAction(game, logEntry);
    expect(updatedGame.selectedPlayerIndex).toBe(2);
  });

  it('should change the selectedPlayerIndex for select_player', () => {
    const game: IGame = createMockGame(3, {
      selectedPlayerIndex: 2,
    });
    const gameStart = mockGame.log[0].timestamp;
    const logEntry: ILogEntry = {
      id: '2',
      playerIndex: 0,
      timestamp: new Date(gameStart.getTime() + 1000),
      gameTime: 1000,
      action: GameLogAction.SELECT_PLAYER,
      currentPlayerIndex: 0,
      turn: 1,
    };

    const updatedGame = applyLogAction(game, logEntry);
    expect(updatedGame.selectedPlayerIndex).toBe(0);
  });

  it('should not affect selectedPlayerIndex for other actions', () => {
    const game: IGame = createMockGame(3, {
      selectedPlayerIndex: 0,
    });
    const gameStart = mockGame.log[0].timestamp;
    const logEntry: ILogEntry = {
      id: '2',
      playerIndex: 0,
      timestamp: new Date(gameStart.getTime() + 1000),
      gameTime: 1000,
      action: GameLogAction.ADD_AUTHORITY,
      count: 1,
      currentPlayerIndex: 0,
      turn: 1,
    };

    const updatedGame = applyLogAction(game, logEntry);
    expect(updatedGame.selectedPlayerIndex).toBe(0);
  });
});
