import { addLogEntry } from '@/game/dominion-lib-log';
import { GameLogActionWithCount } from '@/game/enumerations/game-log-action-with-count';
import { createMockGame } from '@/__fixtures__/dominion-lib-fixtures';
import { IGame } from '@/game/interfaces/game';
import { InvalidTrashActionError } from '@/game/errors/invalid-trash-action';

describe('addLogEntry', () => {
  let mockGame: IGame;

  beforeEach(() => {
    mockGame = createMockGame(2);
  });

  it('should add a log entry with minimal fields', () => {
    addLogEntry(mockGame, 0, GameLogActionWithCount.START_GAME);
    expect(mockGame.log).toContainEqual(
      expect.objectContaining({
        playerIndex: 0,
        action: GameLogActionWithCount.START_GAME,
      })
    );
  });

  it('should add a log entry with all fields', () => {
    addLogEntry(mockGame, 0, GameLogActionWithCount.REMOVE_ESTATES, {
      count: 1,
      correction: false,
      linkedActionId: 'linkedActionId',
      playerTurnDetails: [],
      trash: true,
    });
    expect(mockGame.log).toContainEqual(
      expect.objectContaining({
        playerIndex: 0,
        action: GameLogActionWithCount.REMOVE_ESTATES,
        count: 1,
        correction: false,
        linkedActionId: 'linkedActionId',
        playerTurnDetails: [],
        trash: true,
      })
    );
  });

  it('should add a log entry with only some fields overridden', () => {
    addLogEntry(mockGame, 0, GameLogActionWithCount.ADD_COINS, { count: 5 });
    expect(mockGame.log).toContainEqual(
      expect.objectContaining({
        playerIndex: 0,
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
    addLogEntry(mockGame, 0, GameLogActionWithCount.ADD_COINS, {
      count: 5,
      correction: true,
    });
    expect(mockGame.log).toContainEqual(
      expect.objectContaining({
        playerIndex: 0,
        action: GameLogActionWithCount.ADD_COINS,
        count: 5,
        correction: true,
      })
    );
  });

  it('should add a log entry with player turn details', () => {
    const playerTurnDetails = [{ playerIndex: 0, actions: 1, buys: 1, coins: 1 }];
    addLogEntry(mockGame, 0, GameLogActionWithCount.ADD_COINS, {
      count: 5,
      playerTurnDetails,
    });
    expect(mockGame.log).toContainEqual(
      expect.objectContaining({
        playerIndex: 0,
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
      addLogEntry(mockGame, 0, GameLogActionWithCount.END_GAME, { count: 5 });
    }).toThrow('Player index is not relevant for this action');
  });

  it('should add a log entry with a valid NoPlayerActions action and playerIndex set to -1', () => {
    addLogEntry(mockGame, -1, GameLogActionWithCount.END_GAME);
    expect(mockGame.log).toContainEqual(
      expect.objectContaining({
        playerIndex: -1,
        action: GameLogActionWithCount.END_GAME,
      })
    );
  });

  it('should throw an error when player index is provided for a NoPlayerActions action', () => {
    expect(() => {
      addLogEntry(mockGame, 0, GameLogActionWithCount.END_GAME);
    }).toThrow('Player index is not relevant for this action');
  });

  it('should throw an error when player index is out of range for a NoPlayerActions action', () => {
    expect(() => {
      addLogEntry(mockGame, 99, GameLogActionWithCount.END_GAME);
    }).toThrow('Player index is not relevant for this action');
  });

  it('should add a log entry with a valid NoPlayerActions action and playerIndex set to -1 with overrides', () => {
    addLogEntry(mockGame, -1, GameLogActionWithCount.END_GAME, {
      correction: true,
    });
    expect(mockGame.log).toContainEqual(
      expect.objectContaining({
        playerIndex: -1,
        action: GameLogActionWithCount.END_GAME,
      })
    );
  });

  it('should add a log entry with a valid player action and playerIndex set to 0 with overrides', () => {
    addLogEntry(mockGame, 0, GameLogActionWithCount.ADD_COINS, {
      count: 5,
      correction: true,
    });
    expect(mockGame.log).toContainEqual(
      expect.objectContaining({
        playerIndex: 0,
        action: GameLogActionWithCount.ADD_COINS,
        count: 5,
        correction: true,
      })
    );
  });

  it('should add a log entry with a valid player action and playerIndex set to 0 without overrides', () => {
    addLogEntry(mockGame, 0, GameLogActionWithCount.ADD_COINS);
    expect(mockGame.log).toContainEqual(
      expect.objectContaining({
        playerIndex: 0,
        action: GameLogActionWithCount.ADD_COINS,
      })
    );
  });

  it('should add a log entry with a valid player action and playerIndex set to 0 with undefined overrides', () => {
    addLogEntry(mockGame, 0, GameLogActionWithCount.ADD_COINS, undefined);
    expect(mockGame.log).toContainEqual(
      expect.objectContaining({
        playerIndex: 0,
        action: GameLogActionWithCount.ADD_COINS,
      })
    );
  });
  it('should throw an error if you try to mark trash a non-removal action as trash', () => {
    expect(() => {
      addLogEntry(mockGame, 0, GameLogActionWithCount.ADD_ACTIONS, {
        count: 1,
        trash: true,
      });
    }).toThrow(InvalidTrashActionError);
  });
  it('should throw an error if you try to mark trash a non-count action as trash', () => {
    expect(() => {
      addLogEntry(mockGame, 0, GameLogActionWithCount.REMOVE_ESTATES, {
        trash: true,
      });
    }).toThrow(InvalidTrashActionError);
  });
  it('should throw an error if you try to mark trash something other than a victory card', () => {
    expect(() => {
      addLogEntry(mockGame, 0, GameLogActionWithCount.REMOVE_ACTIONS, {
        count: 1,
        trash: true,
      });
    }).toThrow(InvalidTrashActionError);
  });

  it('should not throw an error if you try to mark trash a victory card', () => {
    addLogEntry(mockGame, 0, GameLogActionWithCount.REMOVE_ESTATES, {
      count: 1,
      trash: true,
    });
    expect(mockGame.log).toContainEqual(
      expect.objectContaining({
        playerIndex: 0,
        action: GameLogActionWithCount.REMOVE_ESTATES,
        count: 1,
        trash: true,
      })
    );
  });
});
