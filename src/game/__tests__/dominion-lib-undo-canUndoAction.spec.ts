import * as undoModule from '@/game/dominion-lib-undo';
import * as undoHelpers from '@/game/dominion-lib-undo-helpers';
import { ILogEntry } from '@/game/interfaces/log-entry';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import { faker } from '@faker-js/faker';
import { createMockGame } from '@/__fixtures__/dominion-lib-fixtures';
import { ActionsWithOnlyLastActionUndo, DefaultTurnDetails, NoUndoActions } from '@/game/constants';
import { NotEnoughSupplyError } from '../errors/not-enough-supply';
import { NotEnoughProphecyError } from '../errors/not-enough-prophecy';
import { CurrentStep } from '../enumerations/current-step';

jest.mock('@/game/dominion-lib-undo-helpers', () => {
  return {
    removeTargetAndLinkedActions: jest.fn(),
    reconstructGameState: jest.fn(),
  };
});

describe('canUndoAction', () => {
  let consoleErrorSpy: jest.SpyInstance;
  let removeTargetAndLinkedActionsSpy: jest.SpyInstance;
  let reconstructGameStateSpy: jest.SpyInstance;

  const createLogEntry = (
    action: GameLogAction,
    count?: number,
    id?: string,
    linkedActionId?: string
  ): ILogEntry => ({
    id: id ?? faker.string.uuid(),
    timestamp: new Date(),
    action,
    count,
    playerIndex: 0,
    currentPlayerIndex: 0,
    turn: 1,
    playerTurnDetails:
      action === GameLogAction.NEXT_TURN ? [DefaultTurnDetails(), DefaultTurnDetails()] : undefined,
    linkedActionId,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {
      // do nothing
    });
    removeTargetAndLinkedActionsSpy = jest.spyOn(undoHelpers, 'removeTargetAndLinkedActions');
    reconstructGameStateSpy = jest.spyOn(undoHelpers, 'reconstructGameState');
  });

  it('should return false if the game log is empty', () => {
    const game = createMockGame(2, {
      log: [],
    });

    const result = undoModule.canUndoAction(game, 1);
    expect(result).toBe(false);
  });

  it('should return false if the game is not in currentStep Game', () => {
    const game = createMockGame(2, {
      log: [
        {
          id: faker.string.uuid(),
          timestamp: new Date(),
          action: GameLogAction.START_GAME,
          playerIndex: 0,
          prevPlayerIndex: -1,
          turn: 1,
        } as ILogEntry,
        {
          id: faker.string.uuid(),
          timestamp: new Date(),
          action: GameLogAction.END_GAME,
          playerIndex: -1,
          turn: 1,
        } as ILogEntry,
      ],
      currentStep: CurrentStep.EndGame,
    });

    const result = undoModule.canUndoAction(game, 1);
    expect(result).toBe(false);
  });

  it('should return false for negative log index', () => {
    const game = createMockGame(2);
    expect(undoModule.canUndoAction(game, -1)).toBe(false);
    expect(removeTargetAndLinkedActionsSpy).not.toHaveBeenCalled();
    expect(reconstructGameStateSpy).not.toHaveBeenCalled();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should return false for log index out of bounds', () => {
    const game = createMockGame(2, { log: [] });
    expect(undoModule.canUndoAction(game, 0)).toBe(false);
    expect(removeTargetAndLinkedActionsSpy).not.toHaveBeenCalled();
    expect(reconstructGameStateSpy).not.toHaveBeenCalled();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should return true for NEXT_TURN when most recent action', () => {
    const game = createMockGame(2, {
      log: [createLogEntry(GameLogAction.ADD_ACTIONS), createLogEntry(GameLogAction.NEXT_TURN)],
    });
    expect(undoModule.canUndoAction(game, 1)).toBe(true);
    expect(removeTargetAndLinkedActionsSpy).toHaveBeenCalledTimes(1);
    expect(reconstructGameStateSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should return false for NEXT_TURN when not most recent action', () => {
    const game = createMockGame(2, {
      log: [
        createLogEntry(GameLogAction.START_GAME),
        createLogEntry(GameLogAction.NEXT_TURN),
        createLogEntry(GameLogAction.ADD_ACTIONS),
      ],
    });
    expect(undoModule.canUndoAction(game, 1)).toBe(false);
    expect(removeTargetAndLinkedActionsSpy).toHaveBeenCalledTimes(0);
    expect(reconstructGameStateSpy).toHaveBeenCalledTimes(0);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should return true for a regular action that can be undone', () => {
    const game = createMockGame(2, {
      log: [createLogEntry(GameLogAction.ADD_ACTIONS, 1)],
    });
    expect(undoModule.canUndoAction(game, 0)).toBe(true);
    expect(removeTargetAndLinkedActionsSpy).toHaveBeenCalledTimes(1);
    expect(reconstructGameStateSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should return false if undoing would result in negative counters', () => {
    const game = createMockGame(2, {
      log: [
        {
          id: faker.string.uuid(),
          timestamp: new Date(),
          action: GameLogAction.START_GAME,
          playerIndex: 0,
          prevPlayerIndex: -1,
          turn: 1,
        } as ILogEntry,
        createLogEntry(GameLogAction.ADD_ACTIONS, 1), // actions to 2
        createLogEntry(GameLogAction.REMOVE_ACTIONS, 1), // actions to 1
        createLogEntry(GameLogAction.REMOVE_ACTIONS, 1), // actions to 0
      ],
    });

    const thinnedGame = createMockGame(2, {
      log: [
        {
          id: faker.string.uuid(),
          timestamp: new Date(),
          action: GameLogAction.START_GAME,
          prevPlayerIndex: -1,
          playerIndex: 0,
          turn: 1,
        } as ILogEntry,
        createLogEntry(GameLogAction.REMOVE_ACTIONS, 1), // actions to 0
        createLogEntry(GameLogAction.REMOVE_ACTIONS, 1), // actions to -1
      ],
    });

    removeTargetAndLinkedActionsSpy.mockReturnValue(thinnedGame);
    reconstructGameStateSpy.mockImplementation(() => {
      throw new Error('Negative counters encountered during reconstruction');
    });

    const result = undoModule.canUndoAction(game, 1);
    expect(result).toBe(false);
    expect(reconstructGameStateSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error during game state reconstruction:',
      expect.any(Error)
    );
  });

  it('should return true if reconstructGameState succeeds', () => {
    const game = createMockGame(2, {
      log: [createLogEntry(GameLogAction.ADD_ACTIONS, 1)],
    });

    reconstructGameStateSpy.mockImplementation(() => {
      // Do nothing, simulating successful reconstruction
    });

    expect(undoModule.canUndoAction(game, 0)).toBe(true);
    expect(removeTargetAndLinkedActionsSpy).toHaveBeenCalledTimes(1);
    expect(reconstructGameStateSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should handle linked actions correctly', () => {
    const mainActionId = 'main-action';
    const game = createMockGame(2, {
      log: [
        createLogEntry(GameLogAction.ADD_ACTIONS, 1, mainActionId),
        createLogEntry(GameLogAction.REMOVE_ACTIONS, 1, undefined, mainActionId),
      ],
    });

    // Test main action
    expect(undoModule.canUndoAction(game, 0)).toBe(true);
    expect(removeTargetAndLinkedActionsSpy).toHaveBeenCalledTimes(1);
    expect(reconstructGameStateSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).not.toHaveBeenCalled();

    jest.clearAllMocks();

    // Test linked action
    expect(undoModule.canUndoAction(game, 1)).toBe(true);
    expect(removeTargetAndLinkedActionsSpy).toHaveBeenCalledTimes(1);
    expect(reconstructGameStateSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should return true for the last action in the log', () => {
    const game = createMockGame(2, {
      log: [
        createLogEntry(GameLogAction.ADD_ACTIONS, 1),
        createLogEntry(GameLogAction.ADD_BUYS, 1),
        createLogEntry(GameLogAction.ADD_COINS, 1),
      ],
    });
    expect(undoModule.canUndoAction(game, 2)).toBe(true);
    expect(removeTargetAndLinkedActionsSpy).toHaveBeenCalledTimes(1);
    expect(reconstructGameStateSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should return true for the first action in the log', () => {
    const game = createMockGame(2, {
      log: [
        createLogEntry(GameLogAction.ADD_ACTIONS, 1),
        createLogEntry(GameLogAction.ADD_BUYS, 1),
      ],
    });
    expect(undoModule.canUndoAction(game, 0)).toBe(true);
    expect(removeTargetAndLinkedActionsSpy).toHaveBeenCalledTimes(1);
    expect(reconstructGameStateSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should return true when undoing the only action in the log', () => {
    const game = createMockGame(2, {
      log: [createLogEntry(GameLogAction.ADD_BUYS, 1)],
    });
    expect(undoModule.canUndoAction(game, 0)).toBe(true);
    expect(removeTargetAndLinkedActionsSpy).toHaveBeenCalledTimes(1);
    expect(reconstructGameStateSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("should return false when linked action's main action is missing", () => {
    const linkedActionId = 'non-existent-main-action';
    const game = createMockGame(2, {
      log: [createLogEntry(GameLogAction.REMOVE_ACTIONS, 1, undefined, linkedActionId)],
    });
    expect(undoModule.canUndoAction(game, 0)).toBe(false);
    expect(removeTargetAndLinkedActionsSpy).not.toHaveBeenCalled();
    expect(reconstructGameStateSpy).not.toHaveBeenCalled();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should return false if reconstructGameState throws NotEnoughSupplyError', () => {
    const game = createMockGame(2, {
      log: [createLogEntry(GameLogAction.REMOVE_ESTATES, 1)],
    });

    reconstructGameStateSpy.mockImplementation(() => {
      throw new NotEnoughSupplyError('estate');
    });

    const result = undoModule.canUndoAction(game, 0);
    expect(result).toBe(false);
    expect(removeTargetAndLinkedActionsSpy).toHaveBeenCalledTimes(1);
    expect(reconstructGameStateSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error during game state reconstruction:',
      expect.any(NotEnoughSupplyError)
    );
  });

  it('should return false if undoing a game-wide counter results in negative values', () => {
    const game = createMockGame(2, {
      options: {
        curses: false,
        mats: { coffersVillagers: false, debt: false, favors: false },
        expansions: { risingSun: true, renaissance: false, prosperity: false },
        trackCardCounts: true,
        trackCardGains: true,
      },
      log: [
        createLogEntry(GameLogAction.ADD_PROPHECY, 1), // Prophecy suns to 1
      ],
    });

    reconstructGameStateSpy.mockImplementation(() => {
      throw new NotEnoughProphecyError();
    });

    const result = undoModule.canUndoAction(game, 0);
    expect(result).toBe(false);
    expect(removeTargetAndLinkedActionsSpy).toHaveBeenCalledTimes(1);
    expect(reconstructGameStateSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error during game state reconstruction:',
      expect.any(NotEnoughProphecyError)
    );
  });

  it.each(NoUndoActions)('should return false when undoing a no undo action', (action) => {
    const game = createMockGame(2, {
      log: [createLogEntry(GameLogAction.START_GAME), createLogEntry(action)],
    });

    reconstructGameStateSpy.mockImplementation(() => {
      // Simulate successful reconstruction
    });

    expect(undoModule.canUndoAction(game, 1)).toBe(false);
    expect(removeTargetAndLinkedActionsSpy).not.toHaveBeenCalled();
    expect(reconstructGameStateSpy).not.toHaveBeenCalled();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should handle multiple linked actions correctly', () => {
    const mainActionId = 'main-action';
    const game = createMockGame(2, {
      log: [
        createLogEntry(GameLogAction.START_GAME),
        createLogEntry(GameLogAction.ADD_ACTIONS, 1, mainActionId),
        createLogEntry(GameLogAction.REMOVE_ACTIONS, 1, undefined, mainActionId),
        createLogEntry(GameLogAction.ADD_BUYS, 1, undefined, mainActionId),
      ],
    });

    expect(undoModule.canUndoAction(game, 1)).toBe(true);
    expect(removeTargetAndLinkedActionsSpy).toHaveBeenCalledTimes(1);
    expect(reconstructGameStateSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it.each(ActionsWithOnlyLastActionUndo)(
    'should return true when undoing an action allowed for the most recent action',
    (action) => {
      const game = createMockGame(2, {
        log: [createLogEntry(GameLogAction.START_GAME), createLogEntry(action)],
      });

      reconstructGameStateSpy.mockImplementation(() => {
        // Simulate successful reconstruction
      });

      expect(undoModule.canUndoAction(game, 1)).toBe(true);
      expect(removeTargetAndLinkedActionsSpy).toHaveBeenCalledTimes(1);
      expect(reconstructGameStateSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    }
  );

  it.each(ActionsWithOnlyLastActionUndo)(
    'should return false when undoing an action allowed for the most recent action when it is not the most recent',
    (action) => {
      const game = createMockGame(2, {
        log: [
          createLogEntry(GameLogAction.START_GAME),
          createLogEntry(action),
          createLogEntry(GameLogAction.ADD_ACTIONS, 1),
        ],
      });

      reconstructGameStateSpy.mockImplementation(() => {
        // Simulate successful reconstruction
      });

      expect(undoModule.canUndoAction(game, 1)).toBe(false);
      expect(removeTargetAndLinkedActionsSpy).not.toHaveBeenCalled();
      expect(reconstructGameStateSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    }
  );

  it('should handle multiple linked actions correctly when undoing one of the linked actions', () => {
    const mainActionId = 'main-action';
    const game = createMockGame(2, {
      log: [
        createLogEntry(GameLogAction.START_GAME),
        createLogEntry(GameLogAction.ADD_ACTIONS, 1, mainActionId),
        createLogEntry(GameLogAction.REMOVE_ACTIONS, 1, undefined, mainActionId),
        createLogEntry(GameLogAction.ADD_BUYS, 1, undefined, mainActionId),
      ],
    });

    expect(undoModule.canUndoAction(game, 2)).toBe(true);
    expect(removeTargetAndLinkedActionsSpy).toHaveBeenCalledTimes(1);
    expect(reconstructGameStateSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should return true when undoing an action in a complex game log', () => {
    const game = createMockGame(2, {
      log: [
        createLogEntry(GameLogAction.START_GAME),
        createLogEntry(GameLogAction.ADD_ACTIONS, 1),
        createLogEntry(GameLogAction.ADD_BUYS, 1),
        createLogEntry(GameLogAction.NEXT_TURN),
        createLogEntry(GameLogAction.ADD_COINS, 1),
        createLogEntry(GameLogAction.REMOVE_COINS, 1),
      ],
    });

    expect(undoModule.canUndoAction(game, 2)).toBe(true); // Undo ADD_BUYS
    expect(removeTargetAndLinkedActionsSpy).toHaveBeenCalledTimes(1);
    expect(reconstructGameStateSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should handle consecutive undo operations', () => {
    const game = createMockGame(2, {
      log: [
        createLogEntry(GameLogAction.ADD_ACTIONS, 1),
        createLogEntry(GameLogAction.ADD_BUYS, 1),
      ],
    });

    // First undo
    reconstructGameStateSpy.mockImplementationOnce(() => {
      // Simulate successful reconstruction
    });
    expect(undoModule.canUndoAction(game, 1)).toBe(true);
    expect(removeTargetAndLinkedActionsSpy).toHaveBeenCalledTimes(1);
    expect(reconstructGameStateSpy).toHaveBeenCalledTimes(1);

    // Update game to reflect first undo
    const gameAfterFirstUndo = {
      ...game,
      log: [createLogEntry(GameLogAction.ADD_ACTIONS, 1)],
    };

    jest.clearAllMocks();

    // Second undo
    reconstructGameStateSpy.mockImplementationOnce(() => {
      // Simulate successful reconstruction
    });
    expect(undoModule.canUndoAction(gameAfterFirstUndo, 0)).toBe(true);
    expect(removeTargetAndLinkedActionsSpy).toHaveBeenCalledTimes(1);
    expect(reconstructGameStateSpy).toHaveBeenCalledTimes(1);
  });
});
