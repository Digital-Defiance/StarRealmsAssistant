import { addLogEntry } from '@/game/dominion-lib-log';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import { createMockGame, createMockLog } from '@/__fixtures__/dominion-lib-fixtures';
import { IGame } from '@/game/interfaces/game';
import { InvalidTrashActionError } from '@/game/errors/invalid-trash-action';
import { AdjustmentActions, NO_PLAYER, NoPlayerActions } from '../constants';
import { GamePausedError } from '../errors/game-paused';
import { CountRequiredError } from '../errors/count-required';
import * as dominionLibTime from '../dominion-lib-time';

describe('addLogEntry', () => {
  let mockGame: IGame;
  let updateCachesForEntrySpy: jest.SpyInstance;

  beforeEach(() => {
    mockGame = createMockGame(2);
    updateCachesForEntrySpy = jest.spyOn(dominionLibTime, 'updateCachesForEntry');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should add a log entry with minimal fields', () => {
    addLogEntry(mockGame, 0, GameLogAction.START_GAME, { turn: 1 });
    expect(mockGame.log).toContainEqual(
      expect.objectContaining({
        playerIndex: 0,
        action: GameLogAction.START_GAME,
        turn: 1,
      })
    );
    expect(updateCachesForEntrySpy).toHaveBeenCalled();
  });

  it('should add a log entry with all fields', () => {
    addLogEntry(mockGame, 0, GameLogAction.REMOVE_ESTATES, {
      count: 1,
      correction: false,
      linkedActionId: 'linkedActionId',
      playerTurnDetails: [],
      trash: true,
    });
    expect(mockGame.log).toContainEqual(
      expect.objectContaining({
        playerIndex: 0,
        action: GameLogAction.REMOVE_ESTATES,
        count: 1,
        correction: false,
        linkedActionId: 'linkedActionId',
        playerTurnDetails: [],
        trash: true,
      })
    );
    expect(updateCachesForEntrySpy).toHaveBeenCalled();
  });

  it('should add a log entry with only some fields overridden', () => {
    addLogEntry(mockGame, 0, GameLogAction.ADD_COINS, { count: 5 });
    expect(mockGame.log).toContainEqual(
      expect.objectContaining({
        playerIndex: 0,
        action: GameLogAction.ADD_COINS,
        count: 5,
      })
    );
    expect(updateCachesForEntrySpy).toHaveBeenCalled();
  });

  it('should handle invalid player index gracefully', () => {
    expect(() => {
      addLogEntry(mockGame, 99, GameLogAction.ADD_COINS, { count: 5 });
    }).toThrow('Player index is out of range');
    expect(updateCachesForEntrySpy).not.toHaveBeenCalled();
  });

  it('should add a log entry with a correction flag', () => {
    addLogEntry(mockGame, 0, GameLogAction.ADD_COINS, {
      count: 5,
      correction: true,
    });
    expect(mockGame.log).toContainEqual(
      expect.objectContaining({
        playerIndex: 0,
        action: GameLogAction.ADD_COINS,
        count: 5,
        correction: true,
      })
    );
    expect(updateCachesForEntrySpy).toHaveBeenCalled();
  });

  it('should add a log entry with player turn details', () => {
    const playerTurnDetails = [
      { playerIndex: 0, actions: 1, buys: 1, coins: 1, cards: 5, gains: 0, discard: 0 },
    ];
    addLogEntry(mockGame, 0, GameLogAction.ADD_COINS, {
      count: 5,
      playerTurnDetails,
    });
    expect(mockGame.log).toContainEqual(
      expect.objectContaining({
        playerIndex: 0,
        action: GameLogAction.ADD_COINS,
        count: 5,
        playerTurnDetails,
      })
    );
    expect(updateCachesForEntrySpy).toHaveBeenCalled();
  });

  // New edge cases
  it('should throw an error when player index is required but not provided', () => {
    expect(() => {
      addLogEntry(mockGame, -1, GameLogAction.ADD_COINS, { count: 5 });
    }).toThrow('Player index is required for this action');
    expect(updateCachesForEntrySpy).not.toHaveBeenCalled();
  });

  it('should throw an error when player index is out of range', () => {
    expect(() => {
      addLogEntry(mockGame, 99, GameLogAction.ADD_COINS, { count: 5 });
    }).toThrow('Player index is out of range');
    expect(updateCachesForEntrySpy).not.toHaveBeenCalled();
  });

  it('should throw an error when player index is provided for an action that does not require it', () => {
    expect(() => {
      addLogEntry(mockGame, 0, GameLogAction.END_GAME, { count: 5 });
    }).toThrow('Player index is not relevant for this action');
    expect(updateCachesForEntrySpy).not.toHaveBeenCalled();
  });

  it('should add a log entry with a valid NoPlayerActions action and playerIndex set to -1', () => {
    addLogEntry(mockGame, -1, GameLogAction.END_GAME);
    expect(mockGame.log).toContainEqual(
      expect.objectContaining({
        playerIndex: -1,
        action: GameLogAction.END_GAME,
      })
    );
    expect(updateCachesForEntrySpy).toHaveBeenCalled();
  });

  it('should throw an error when player index is provided for a NoPlayerActions action', () => {
    expect(() => {
      addLogEntry(mockGame, 0, GameLogAction.END_GAME);
    }).toThrow('Player index is not relevant for this action');
    expect(updateCachesForEntrySpy).not.toHaveBeenCalled();
  });

  it('should throw an error when player index is out of range for a NoPlayerActions action', () => {
    expect(() => {
      addLogEntry(mockGame, 99, GameLogAction.END_GAME);
    }).toThrow('Player index is not relevant for this action');
    expect(updateCachesForEntrySpy).not.toHaveBeenCalled();
  });

  it('should add a log entry with a valid NoPlayerActions action and playerIndex set to -1 with overrides', () => {
    addLogEntry(mockGame, -1, GameLogAction.END_GAME, {
      correction: true,
    });
    expect(mockGame.log).toContainEqual(
      expect.objectContaining({
        playerIndex: -1,
        action: GameLogAction.END_GAME,
      })
    );
    expect(updateCachesForEntrySpy).toHaveBeenCalled();
  });

  it('should add a log entry with a valid player action and playerIndex set to 0 with overrides', () => {
    addLogEntry(mockGame, 0, GameLogAction.ADD_COINS, {
      count: 5,
      correction: true,
    });
    expect(mockGame.log).toContainEqual(
      expect.objectContaining({
        playerIndex: 0,
        action: GameLogAction.ADD_COINS,
        count: 5,
        correction: true,
      })
    );
    expect(updateCachesForEntrySpy).toHaveBeenCalled();
  });

  it('should add a log entry with a valid player action and playerIndex set to 0 with minimal overrides', () => {
    addLogEntry(mockGame, 0, GameLogAction.ADD_COINS, { count: 1 });
    expect(mockGame.log).toContainEqual(
      expect.objectContaining({
        playerIndex: 0,
        action: GameLogAction.ADD_COINS,
        count: 1,
      })
    );
    expect(updateCachesForEntrySpy).toHaveBeenCalled();
  });

  it('should throw an error if you try to mark trash a non-removal action as trash', () => {
    expect(() => {
      addLogEntry(mockGame, 0, GameLogAction.ADD_ACTIONS, {
        count: 1,
        trash: true,
      });
    }).toThrow(InvalidTrashActionError);
    expect(updateCachesForEntrySpy).not.toHaveBeenCalled();
  });
  it('should throw an error if you try to mark trash a a positive increase action as trash', () => {
    expect(() => {
      addLogEntry(mockGame, 0, GameLogAction.ADD_ESTATES, {
        count: 1,
        trash: true,
      });
    }).toThrow(InvalidTrashActionError);
    expect(updateCachesForEntrySpy).not.toHaveBeenCalled();
  });
  it('should throw an error if you try to mark trash something other than a victory card', () => {
    expect(() => {
      addLogEntry(mockGame, 0, GameLogAction.REMOVE_ACTIONS, {
        count: 1,
        trash: true,
      });
    }).toThrow(InvalidTrashActionError);
    expect(updateCachesForEntrySpy).not.toHaveBeenCalled();
  });

  it('should not throw an error if you try to mark trash a victory card', () => {
    addLogEntry(mockGame, 0, GameLogAction.REMOVE_ESTATES, {
      count: 1,
      trash: true,
    });
    expect(mockGame.log).toContainEqual(
      expect.objectContaining({
        playerIndex: 0,
        action: GameLogAction.REMOVE_ESTATES,
        count: 1,
        trash: true,
      })
    );
    expect(updateCachesForEntrySpy).toHaveBeenCalled();
  });

  it.each(AdjustmentActions)(
    'should throw an error when an adjustment action is performed without a count',
    (action: GameLogAction) => {
      expect(() => {
        addLogEntry(mockGame, 0, action);
      }).toThrow(CountRequiredError);
      expect(updateCachesForEntrySpy).not.toHaveBeenCalled();
    }
  );

  it.each(
    Object.values(GameLogAction).filter((action: GameLogAction) => action !== GameLogAction.UNPAUSE)
  )(
    'should not allow any action besides unpause after the game is paused (%s)',
    (action: GameLogAction) => {
      // Simulate the game being paused
      mockGame.log.push(createMockLog({ action: GameLogAction.PAUSE }));

      // Attempt to perform the action
      // AdjustmentActions require a count, actions not in NoPlayerActions require a playerIndex
      const playerIndex = NoPlayerActions.includes(action) ? NO_PLAYER : 0;
      const overrides = AdjustmentActions.includes(action) ? { count: 1 } : {};

      expect(() => addLogEntry(mockGame, playerIndex, action, overrides)).toThrow(GamePausedError);
      expect(updateCachesForEntrySpy).not.toHaveBeenCalled();
    }
  );
});
