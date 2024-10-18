import { addLogEntry } from '@/game/dominion-lib-log';
import { GameLogActionWithCount } from '@/game/enumerations/game-log-action-with-count';
import { createMockGame } from '@/__fixtures__/dominion-lib-fixtures';
import { IGame } from '@/game/interfaces/game';
import { NO_PLAYER } from '@/game/constants';

describe('addLogEntry', () => {
  let mockGame: IGame;

  beforeEach(() => {
    mockGame = createMockGame(2);
  });

  it('should add a log entry with minimal fields', () => {
    const newEntry = addLogEntry(mockGame, NO_PLAYER, GameLogActionWithCount.START_GAME);
    expect(mockGame.log).toContainEqual(
      expect.objectContaining({
        playerIndex: NO_PLAYER,
        action: GameLogActionWithCount.START_GAME,
      })
    );
  });

  it('should add a log entry with all fields', () => {
    const newEntry = addLogEntry(mockGame, 0, GameLogActionWithCount.ADD_COINS, {
      count: 5,
      correction: false,
      linkedActionId: 'linkedActionId',
      playerTurnDetails: [],
    });
    expect(mockGame.log).toContainEqual(
      expect.objectContaining({
        playerIndex: 0,
        playerName: mockGame.players[0].name,
        action: GameLogActionWithCount.ADD_COINS,
        count: 5,
        correction: false,
        linkedActionId: 'linkedActionId',
        playerTurnDetails: [],
      })
    );
  });

  it('should add a log entry with special characters in player name', () => {
    mockGame.players[0].name = 'Al!ce@#';
    const newEntry = addLogEntry(mockGame, 0, GameLogActionWithCount.ADD_COINS, { count: 5 });
    expect(mockGame.log).toContainEqual(
      expect.objectContaining({
        playerIndex: 0,
        playerName: 'Al!ce@#',
        action: GameLogActionWithCount.ADD_COINS,
        count: 5,
      })
    );
  });

  it('should add a log entry with only some fields overridden', () => {
    const newEntry = addLogEntry(mockGame, 0, GameLogActionWithCount.ADD_COINS, { count: 5 });
    expect(mockGame.log).toContainEqual(
      expect.objectContaining({
        playerIndex: 0,
        playerName: mockGame.players[0].name,
        action: GameLogActionWithCount.ADD_COINS,
        count: 5,
      })
    );
  });

  it('should handle invalid player index gracefully', () => {
    expect(() => {
      addLogEntry(mockGame, 99, GameLogActionWithCount.ADD_COINS, { count: 5 });
    }).toThrow('Player index is out of range');
  });

  it('should add a log entry with a correction flag', () => {
    const newEntry = addLogEntry(mockGame, 0, GameLogActionWithCount.ADD_COINS, {
      count: 5,
      correction: true,
    });
    expect(mockGame.log).toContainEqual(
      expect.objectContaining({
        playerIndex: 0,
        playerName: mockGame.players[0].name,
        action: GameLogActionWithCount.ADD_COINS,
        count: 5,
        correction: true,
      })
    );
  });

  it('should add a log entry with player turn details', () => {
    const playerTurnDetails = [{ playerIndex: 0, actions: 1, buys: 1, coins: 1 }];
    const newEntry = addLogEntry(mockGame, 0, GameLogActionWithCount.ADD_COINS, {
      count: 5,
      playerTurnDetails,
    });
    expect(mockGame.log).toContainEqual(
      expect.objectContaining({
        playerIndex: 0,
        playerName: mockGame.players[0].name,
        action: GameLogActionWithCount.ADD_COINS,
        count: 5,
        playerTurnDetails,
      })
    );
  });

  // New edge cases
  it('should throw an error when player index is required but not provided', () => {
    expect(() => {
      addLogEntry(mockGame, -1, GameLogActionWithCount.ADD_COINS, { count: 5 });
    }).toThrow('Player index is required for this action');
  });

  it('should throw an error when player index is out of range', () => {
    expect(() => {
      addLogEntry(mockGame, 99, GameLogActionWithCount.ADD_COINS, { count: 5 });
    }).toThrow('Player index is out of range');
  });

  it('should throw an error when player index is provided for an action that does not require it', () => {
    expect(() => {
      addLogEntry(mockGame, 0, GameLogActionWithCount.START_GAME, { count: 5 });
    }).toThrow('Player index is not relevant for this action');
  });

  it('should add a log entry with a valid NoPlayerActions action and playerIndex set to -1', () => {
    const newEntry = addLogEntry(mockGame, -1, GameLogActionWithCount.START_GAME);
    expect(mockGame.log).toContainEqual(
      expect.objectContaining({
        playerIndex: -1,
        action: GameLogActionWithCount.START_GAME,
      })
    );
  });

  it('should throw an error when player index is provided for a NoPlayerActions action', () => {
    expect(() => {
      addLogEntry(mockGame, 0, GameLogActionWithCount.START_GAME);
    }).toThrow('Player index is not relevant for this action');
  });

  it('should throw an error when player index is out of range for a NoPlayerActions action', () => {
    expect(() => {
      addLogEntry(mockGame, 99, GameLogActionWithCount.START_GAME);
    }).toThrow('Player index is not relevant for this action');
  });

  it('should add a log entry with a valid NoPlayerActions action and playerIndex set to -1 with overrides', () => {
    const newEntry = addLogEntry(mockGame, -1, GameLogActionWithCount.START_GAME, {
      correction: true,
    });
    expect(mockGame.log).toContainEqual(
      expect.objectContaining({
        playerIndex: -1,
        action: GameLogActionWithCount.START_GAME,
        correction: true,
      })
    );
  });

  it('should add a log entry with a valid player action and playerIndex set to 0 with overrides', () => {
    const newEntry = addLogEntry(mockGame, 0, GameLogActionWithCount.ADD_COINS, {
      count: 5,
      correction: true,
    });
    expect(mockGame.log).toContainEqual(
      expect.objectContaining({
        playerIndex: 0,
        playerName: mockGame.players[0].name,
        action: GameLogActionWithCount.ADD_COINS,
        count: 5,
        correction: true,
      })
    );
  });

  it('should add a log entry with a valid player action and playerIndex set to 0 without overrides', () => {
    const newEntry = addLogEntry(mockGame, 0, GameLogActionWithCount.ADD_COINS);
    expect(mockGame.log).toContainEqual(
      expect.objectContaining({
        playerIndex: 0,
        playerName: mockGame.players[0].name,
        action: GameLogActionWithCount.ADD_COINS,
      })
    );
  });

  it('should add a log entry with a valid player action and playerIndex set to 0 with undefined overrides', () => {
    const newEntry = addLogEntry(mockGame, 0, GameLogActionWithCount.ADD_COINS, undefined);
    expect(mockGame.log).toContainEqual(
      expect.objectContaining({
        playerIndex: 0,
        playerName: mockGame.players[0].name,
        action: GameLogActionWithCount.ADD_COINS,
      })
    );
  });
});
