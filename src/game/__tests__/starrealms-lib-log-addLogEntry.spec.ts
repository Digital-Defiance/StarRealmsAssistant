import { addLogEntry } from '@/game/starrealms-lib-log';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import { createMockGame, createMockLog } from '@/__fixtures__/starrealms-lib-fixtures';
import { IGame } from '@/game/interfaces/game';
import { AdjustmentActions, NO_PLAYER, NoPlayerActions } from '../constants';
import { GamePausedError } from '../errors/game-paused';
import { CountRequiredError } from '../errors/count-required';

describe('addLogEntry', () => {
  let mockGame: IGame;

  beforeEach(() => {
    mockGame = createMockGame(2);
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
  });

  it('should add a log entry with all fields', () => {
    addLogEntry(mockGame, 0, GameLogAction.REMOVE_AUTHORITY, {
      count: 1,
      correction: false,
      linkedActionId: 'linkedActionId',
      playerTurnDetails: [],
      scrap: true,
    });
    expect(mockGame.log).toContainEqual(
      expect.objectContaining({
        playerIndex: 0,
        action: GameLogAction.REMOVE_AUTHORITY,
        count: 1,
        correction: false,
        linkedActionId: 'linkedActionId',
        playerTurnDetails: [],
        scrap: true,
      })
    );
  });

  it('should add a log entry with only some fields overridden', () => {
    addLogEntry(mockGame, 0, GameLogAction.ADD_COMBAT, { count: 5 });
    expect(mockGame.log).toContainEqual(
      expect.objectContaining({
        playerIndex: 0,
        action: GameLogAction.ADD_COMBAT,
        count: 5,
      })
    );
  });

  it('should handle invalid player index gracefully', () => {
    expect(() => {
      addLogEntry(mockGame, 99, GameLogAction.ADD_COMBAT, { count: 5 });
    }).toThrow('Player index is out of range');
  });

  it('should add a log entry with a correction flag', () => {
    addLogEntry(mockGame, 0, GameLogAction.ADD_COMBAT, {
      count: 5,
      correction: true,
    });
    expect(mockGame.log).toContainEqual(
      expect.objectContaining({
        playerIndex: 0,
        action: GameLogAction.ADD_COMBAT,
        count: 5,
        correction: true,
      })
    );
  });

  it('should add a log entry with player turn details', () => {
    const playerTurnDetails = [
      { playerIndex: 0, trade: 1, combat: 1, cards: 5, gains: 0, discard: 0, scrap: 0 },
    ];
    addLogEntry(mockGame, 0, GameLogAction.ADD_COMBAT, {
      count: 5,
      playerTurnDetails,
    });
    expect(mockGame.log).toContainEqual(
      expect.objectContaining({
        playerIndex: 0,
        action: GameLogAction.ADD_COMBAT,
        count: 5,
        playerTurnDetails,
      })
    );
  });

  // New edge cases
  it('should throw an error when player index is required but not provided', () => {
    expect(() => {
      addLogEntry(mockGame, -1, GameLogAction.ADD_COMBAT, { count: 5 });
    }).toThrow('Player index is required for this action');
  });

  it('should throw an error when player index is out of range', () => {
    expect(() => {
      addLogEntry(mockGame, 99, GameLogAction.ADD_COMBAT, { count: 5 });
    }).toThrow('Player index is out of range');
  });

  it('should throw an error when player index is provided for an action that does not require it', () => {
    expect(() => {
      addLogEntry(mockGame, 0, GameLogAction.END_GAME, { count: 5 });
    }).toThrow('Player index is not relevant for this action');
  });

  it('should add a log entry with a valid NoPlayerActions action and playerIndex set to -1', () => {
    addLogEntry(mockGame, -1, GameLogAction.END_GAME);
    expect(mockGame.log).toContainEqual(
      expect.objectContaining({
        playerIndex: -1,
        action: GameLogAction.END_GAME,
      })
    );
  });

  it('should throw an error when player index is provided for a NoPlayerActions action', () => {
    expect(() => {
      addLogEntry(mockGame, 0, GameLogAction.END_GAME);
    }).toThrow('Player index is not relevant for this action');
  });

  it('should throw an error when player index is out of range for a NoPlayerActions action', () => {
    expect(() => {
      addLogEntry(mockGame, 99, GameLogAction.END_GAME);
    }).toThrow('Player index is not relevant for this action');
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
  });

  it('should add a log entry with a valid player action and playerIndex set to 0 with overrides', () => {
    addLogEntry(mockGame, 0, GameLogAction.ADD_COMBAT, {
      count: 5,
      correction: true,
    });
    expect(mockGame.log).toContainEqual(
      expect.objectContaining({
        playerIndex: 0,
        action: GameLogAction.ADD_COMBAT,
        count: 5,
        correction: true,
      })
    );
  });

  it('should add a log entry with a valid player action and playerIndex set to 0 with minimal overrides', () => {
    addLogEntry(mockGame, 0, GameLogAction.ADD_TRADE, { count: 1 });
    expect(mockGame.log).toContainEqual(
      expect.objectContaining({
        playerIndex: 0,
        action: GameLogAction.ADD_TRADE,
        count: 1,
      })
    );
  });

  it.each(AdjustmentActions)(
    'should throw an error when an adjustment action is performed without a count',
    (action: GameLogAction) => {
      expect(() => {
        addLogEntry(mockGame, 0, action);
      }).toThrow(CountRequiredError);
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
    }
  );
});
