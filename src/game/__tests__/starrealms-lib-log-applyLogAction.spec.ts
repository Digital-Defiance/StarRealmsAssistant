import { applyLogAction } from '@/game/starrealms-lib-log';
import { IGame } from '@/game/interfaces/game';
import { ILogEntry } from '@/game/interfaces/log-entry';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import { DefaultTurnDetails, NO_PLAYER } from '@/game/constants';
import { createMockGame } from '@/__fixtures__/starrealms-lib-fixtures';
import { NotEnoughSubfieldError } from '@/game/errors/not-enough-subfield';
import { deepClone } from '@/game/utils';
import { IPlayerGameTurnDetails } from '../interfaces/player-game-turn-details';
import { IPlayer } from '../interfaces/player';
import { ITurnStatistics } from '../interfaces/turn-statistics';

// Helper function to create NEXT_TURN log entries
const createNextTurnLogEntry = (
  turn: number,
  prevPlayerIndex: number,
  currentPlayerIndex: number,
  timestamp: Date,
  gameTime: number
): ILogEntry => ({
  action: GameLogAction.NEXT_TURN,
  playerIndex: currentPlayerIndex,
  id: `turn-${turn}`,
  timestamp,
  gameTime,
  prevPlayerIndex,
  currentPlayerIndex,
  turn,
});

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
  it('should add correct turn statistics to cache on NEXT_TURN action', () => {
    // Setup initial player states before the NEXT_TURN action is applied
    mockGame.players[0].turn = { trade: 2, combat: 1, cards: 3, gains: 1, discard: 0, scrap: 0 };
    mockGame.players[1].turn = { trade: 1, combat: 2, cards: 5, gains: 0, discard: 2, scrap: 0 };
    mockGame.currentTurn = 5;
    mockGame.currentPlayerIndex = 0; // Player 0's turn ends

    // Add log entries for turns 2, 3, 4, 5
    const gameStart = mockGame.log[0].timestamp;
    let currentTime = gameStart.getTime();
    let currentGameTime = 0;
    for (let i = 2; i <= 5; i++) {
      const prevPlayer = (i + mockGame.players.length - 2) % mockGame.players.length;
      const currentPlayer = (i + mockGame.players.length - 1) % mockGame.players.length;
      currentTime += 1000; // Increment time for each turn
      currentGameTime += 1000;
      mockGame.log.push(
        createNextTurnLogEntry(i, prevPlayer, currentPlayer, new Date(currentTime), currentGameTime)
      );
    }

    const logEntry: ILogEntry = {
      action: GameLogAction.NEXT_TURN,
      playerIndex: 1, // Player 1 starts turn 6
      id: 'next-turn-id',
      timestamp: new Date(gameStart.getTime() + 10000), // Ensure time progresses
      gameTime: 10000,
      prevPlayerIndex: 0,
      currentPlayerIndex: 1, // This will be updated by applyLogAction
      turn: 6, // This will be updated by applyLogAction
    };

    const result = applyLogAction(mockGame, logEntry);

    // Check cache after applying the action
    expect(result.turnStatisticsCache).toHaveLength(1);
    const stats: ITurnStatistics = result.turnStatisticsCache[0];

    expect(stats.turn).toBe(5); // Stats are for the turn that just ended
    expect(stats.playerIndex).toBe(0); // Player whose turn ended
    // Check player-specific stats (should reflect state *before* NEXT_TURN reset)
    expect(stats.playerTrade[0]).toBe(2);
    expect(stats.playerTrade[1]).toBe(1);
    expect(stats.playerCombat[0]).toBe(1);
    expect(stats.playerCombat[1]).toBe(2);
    expect(stats.playerCardsDrawn[0]).toBe(3);
    expect(stats.playerCardsDrawn[1]).toBe(5);
    expect(stats.playerGains[0]).toBe(1);
    expect(stats.playerGains[1]).toBe(0);
    expect(stats.playerDiscards[0]).toBe(0);
    expect(stats.playerDiscards[1]).toBe(2);
  });
  it('should add correct turn statistics to cache on END_GAME action', () => {
    // Setup initial player states before the END_GAME action is applied
    mockGame.players[0].turn = { trade: 0, combat: 1, cards: 4, gains: 0, discard: 1, scrap: 0 };
    mockGame.players[1].turn = { trade: 3, combat: 1, cards: 2, gains: 2, discard: 0, scrap: 0 };
    mockGame.currentTurn = 10;
    mockGame.currentPlayerIndex = 1; // Player 1's turn ends

    // Add log entries for turns 2 through 10
    const gameStart = mockGame.log[0].timestamp;
    let currentTime = gameStart.getTime();
    let currentGameTime = 0;
    for (let i = 2; i <= 10; i++) {
      const prevPlayer = (i + mockGame.players.length - 2) % mockGame.players.length;
      const currentPlayer = (i + mockGame.players.length - 1) % mockGame.players.length;
      currentTime += 1000; // Increment time for each turn
      currentGameTime += 1000;
      mockGame.log.push(
        createNextTurnLogEntry(i, prevPlayer, currentPlayer, new Date(currentTime), currentGameTime)
      );
    }

    const logEntry: ILogEntry = {
      action: GameLogAction.END_GAME,
      playerIndex: NO_PLAYER, // No specific player for END_GAME itself
      id: 'end-game-id',
      timestamp: new Date(gameStart.getTime() + 20000), // Ensure time progresses
      gameTime: 20000,
      prevPlayerIndex: 1, // Player whose turn ended
      currentPlayerIndex: 1, // Remains the same for END_GAME
      turn: 10, // Turn number when game ended
    };

    const result = applyLogAction(mockGame, logEntry);

    // Check cache after applying the action
    expect(result.turnStatisticsCache).toHaveLength(1);
    const stats: ITurnStatistics = result.turnStatisticsCache[0];

    expect(stats.turn).toBe(10); // Stats are for the turn that just ended
    expect(stats.playerIndex).toBe(1); // Player whose turn ended
    // Check player-specific stats (should reflect state *before* END_GAME)
    expect(stats.playerTrade[0]).toBe(0);
    expect(stats.playerTrade[1]).toBe(3);
    expect(stats.playerCombat[0]).toBe(1);
    expect(stats.playerCombat[1]).toBe(1);
    expect(stats.playerCardsDrawn[0]).toBe(4);
    expect(stats.playerCardsDrawn[1]).toBe(2);
    expect(stats.playerGains[0]).toBe(0);
    expect(stats.playerGains[1]).toBe(2);
    expect(stats.playerDiscards[0]).toBe(1);
    expect(stats.playerDiscards[1]).toBe(0);
  });
  // --- End Turn Statistics Cache Tests ---
});
