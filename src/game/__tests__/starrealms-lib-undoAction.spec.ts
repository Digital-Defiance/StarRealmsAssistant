import * as undoModule from '@/game/starrealms-lib-undo';
import * as undoHelpers from '@/game/starrealms-lib-undo-helpers';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import { createMockGame, createMockLog } from '@/__fixtures__/starrealms-lib-fixtures';
import { NotEnoughSubfieldError } from '@/game/errors/not-enough-subfield';

jest.mock('@/game/starrealms-lib-undo-helpers', () => ({
  removeTargetAndLinkedActions: jest.fn(),
  reconstructGameState: jest.fn(),
}));

describe('undoAction', () => {
  let consoleErrorSpy: jest.SpyInstance;
  let removeTargetAndLinkedActionsSpy: jest.Mock;
  let reconstructGameStateSpy: jest.Mock;
  const gameStart: Date = new Date('2021-01-01T00:00:00.000Z');

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {
      /* Suppress console error */
    });
    removeTargetAndLinkedActionsSpy = undoHelpers.removeTargetAndLinkedActions as jest.Mock;
    reconstructGameStateSpy = undoHelpers.reconstructGameState as jest.Mock;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  // --- Tests for failures within the initial canUndoAction check ---

  it('should return success false if canUndoAction returns false (e.g., non-undoable action)', () => {
    const game = createMockGame(2, {
      log: [
        createMockLog({ action: GameLogAction.START_GAME, timestamp: gameStart }),
        createMockLog({
          action: GameLogAction.END_GAME,
          timestamp: new Date(gameStart.getTime() + 1000),
        }), // END_GAME is not undoable
      ],
    });

    const result = undoModule.undoAction(game, 1);

    expect(result.success).toBe(false);
    expect(result.game).toBe(game);
    expect(removeTargetAndLinkedActionsSpy).not.toHaveBeenCalled();
    expect(reconstructGameStateSpy).not.toHaveBeenCalled();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should return success false if canUndoAction fails due to unexpected reconstruction error', () => {
    const game = createMockGame(2, {
      log: [
        createMockLog({ action: GameLogAction.START_GAME, timestamp: gameStart }),
        createMockLog({
          action: GameLogAction.ADD_TRADE,
          timestamp: new Date(gameStart.getTime() + 1000),
        }),
      ],
    });
    const error = new Error('Simulated unexpected error during canUndoAction check');
    const gameAfterRemove = { ...game, log: [game.log[0]] };

    // Mock sequence for canUndoAction failure (unexpected error)
    removeTargetAndLinkedActionsSpy.mockReturnValueOnce(gameAfterRemove); // Called by canUndoAction
    reconstructGameStateSpy.mockImplementationOnce(() => {
      throw error;
    }); // Throws on first call (in canUndoAction)

    const result = undoModule.undoAction(game, 1);

    expect(result.success).toBe(false);
    expect(result.game).toBe(game);
    expect(removeTargetAndLinkedActionsSpy).toHaveBeenCalledTimes(1);
    expect(reconstructGameStateSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1); // Logged by canUndoAction
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error during game state reconstruction:', error);
  });

  // --- Tests for successful execution or failures within undoAction's try block ---

  it('should return success true and updated game if undo is successful', () => {
    const game = createMockGame(2, {
      log: [
        createMockLog({ action: GameLogAction.START_GAME, timestamp: gameStart }),
        createMockLog({
          action: GameLogAction.ADD_TRADE,
          timestamp: new Date(gameStart.getTime() + 1000),
        }),
      ],
    });
    const gameAfterRemove = { ...game, log: [game.log[0]] };
    const finalGame = { ...gameAfterRemove }; // Assume reconstruction is identity

    // Mock sequence for successful undo
    removeTargetAndLinkedActionsSpy.mockImplementationOnce(() => gameAfterRemove); // For canUndoAction
    reconstructGameStateSpy.mockImplementationOnce(() => finalGame); // For canUndoAction (success)
    removeTargetAndLinkedActionsSpy.mockImplementationOnce(() => gameAfterRemove); // For undoAction
    reconstructGameStateSpy.mockImplementationOnce(() => finalGame); // For undoAction (success)

    const result = undoModule.undoAction(game, 1);

    expect(result.success).toBe(true);
    expect(result.game).toEqual(finalGame);
    expect(removeTargetAndLinkedActionsSpy).toHaveBeenCalledTimes(2);
    expect(reconstructGameStateSpy).toHaveBeenCalledTimes(2);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should handle unexpected errors during reconstruction in undoAction and return success false', () => {
    const game = createMockGame(2, {
      log: [
        createMockLog({ action: GameLogAction.START_GAME, timestamp: gameStart }),
        createMockLog({
          action: GameLogAction.ADD_TRADE,
          timestamp: new Date(gameStart.getTime() + 1000),
        }),
      ],
    });
    const error = new Error('Reconstruction error during undoAction');
    const gameAfterRemove = { ...game, log: [game.log[0]] };

    // Mock sequence: canUndoAction succeeds, undoAction's reconstruct fails (unexpected)
    removeTargetAndLinkedActionsSpy.mockImplementationOnce(() => gameAfterRemove); // For canUndoAction
    reconstructGameStateSpy.mockImplementationOnce(() => gameAfterRemove); // For canUndoAction (success)
    removeTargetAndLinkedActionsSpy.mockImplementationOnce(() => gameAfterRemove); // For undoAction
    reconstructGameStateSpy.mockImplementationOnce(() => {
      throw error;
    }); // For undoAction (throws unexpected)

    const result = undoModule.undoAction(game, 1);

    expect(result.success).toBe(false);
    expect(result.game).toBe(game);
    expect(removeTargetAndLinkedActionsSpy).toHaveBeenCalledTimes(2);
    expect(reconstructGameStateSpy).toHaveBeenCalledTimes(2);
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1); // Logged by undoAction
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error undoing action:', error);
  });

  it('should handle NotEnoughSubfieldError during reconstruction in undoAction and return success false', () => {
    const game = createMockGame(2, {
      log: [
        createMockLog({ action: GameLogAction.START_GAME, timestamp: gameStart }),
        createMockLog({
          action: GameLogAction.REMOVE_TRADE,
          timestamp: new Date(gameStart.getTime() + 1000),
        }),
      ],
    });
    const error = new NotEnoughSubfieldError('turn', 'trade');
    const gameAfterRemove = { ...game, log: [game.log[0]] };

    // Mock sequence: canUndoAction succeeds, undoAction's reconstruct fails (expected)
    removeTargetAndLinkedActionsSpy.mockImplementationOnce(() => gameAfterRemove); // For canUndoAction
    reconstructGameStateSpy.mockImplementationOnce(() => gameAfterRemove); // For canUndoAction (success)
    removeTargetAndLinkedActionsSpy.mockImplementationOnce(() => gameAfterRemove); // For undoAction
    reconstructGameStateSpy.mockImplementationOnce(() => {
      throw error;
    }); // For undoAction (throws NotEnoughSubfieldError)

    const result = undoModule.undoAction(game, 1);

    expect(result.success).toBe(false);
    expect(result.game).toBe(game);
    expect(removeTargetAndLinkedActionsSpy).toHaveBeenCalledTimes(2);
    expect(reconstructGameStateSpy).toHaveBeenCalledTimes(2);
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1); // Logged by undoAction
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Cannot undo action: it would result in negative counters'
    );
  });

  it('should return success false if removeTargetAndLinkedActions throws an error within undoAction', () => {
    const game = createMockGame(2, {
      log: [
        createMockLog({ action: GameLogAction.START_GAME, timestamp: gameStart }),
        createMockLog({
          action: GameLogAction.ADD_TRADE,
          timestamp: new Date(gameStart.getTime() + 1000),
        }),
      ],
    });
    const removalError = new Error('Removal error during undoAction');
    const gameAfterRemoveCanUndo = { ...game, log: [game.log[0]] };

    // Mock canUndoAction sequence (success)
    removeTargetAndLinkedActionsSpy.mockImplementationOnce(() => gameAfterRemoveCanUndo);
    reconstructGameStateSpy.mockImplementationOnce(() => gameAfterRemoveCanUndo);

    // Mock undoAction sequence (removeTarget... fails)
    removeTargetAndLinkedActionsSpy.mockImplementationOnce(() => {
      throw removalError;
    });

    const result = undoModule.undoAction(game, 1);

    expect(result.success).toBe(false);
    expect(result.game).toBe(game);
    expect(removeTargetAndLinkedActionsSpy).toHaveBeenCalledTimes(2);
    expect(reconstructGameStateSpy).toHaveBeenCalledTimes(1); // Only called by canUndoAction
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1); // Logged by undoAction
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error undoing action:', removalError);
  });

  it('should correctly undo a linked action', () => {
    const mainActionId = 'main-action';
    const game = createMockGame(2, {
      log: [
        createMockLog({ action: GameLogAction.START_GAME, timestamp: gameStart }),
        createMockLog({
          action: GameLogAction.ADD_TRADE,
          id: mainActionId,
          timestamp: new Date(gameStart.getTime() + 1000),
        }),
        createMockLog({
          action: GameLogAction.REMOVE_TRADE,
          linkedActionId: mainActionId,
          timestamp: new Date(gameStart.getTime() + 2000),
        }),
      ],
    });
    const updatedGame = { ...game, log: [game.log[0]] };
    const finalGame = { ...updatedGame };

    // Mock sequence for successful undo
    removeTargetAndLinkedActionsSpy.mockImplementationOnce(() => updatedGame); // canUndoAction
    reconstructGameStateSpy.mockImplementationOnce(() => finalGame); // canUndoAction
    removeTargetAndLinkedActionsSpy.mockImplementationOnce(() => updatedGame); // undoAction
    reconstructGameStateSpy.mockImplementationOnce(() => finalGame); // undoAction

    const result = undoModule.undoAction(game, 1); // Undo the main action

    expect(result.success).toBe(true);
    expect(result.game).toEqual(finalGame);
    expect(removeTargetAndLinkedActionsSpy).toHaveBeenCalledTimes(2);
    expect(reconstructGameStateSpy).toHaveBeenCalledTimes(2);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should handle undoing when logIndex is negative', () => {
    const game = createMockGame(2);
    const result = undoModule.undoAction(game, -1);
    expect(result.success).toBe(false);
    expect(result.game).toBe(game);
    expect(removeTargetAndLinkedActionsSpy).not.toHaveBeenCalled();
    expect(reconstructGameStateSpy).not.toHaveBeenCalled();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should handle undoing when logIndex is out of bounds', () => {
    const game = createMockGame(2, { log: [] });
    const result = undoModule.undoAction(game, 0);
    expect(result.success).toBe(false);
    expect(result.game).toBe(game);
    expect(removeTargetAndLinkedActionsSpy).not.toHaveBeenCalled();
    expect(reconstructGameStateSpy).not.toHaveBeenCalled();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should handle consecutive undo operations', () => {
    const game = createMockGame(2, {
      log: [
        createMockLog({ action: GameLogAction.START_GAME, timestamp: gameStart }),
        createMockLog({
          action: GameLogAction.ADD_TRADE,
          timestamp: new Date(gameStart.getTime() + 1000),
        }), // index 1
        createMockLog({
          action: GameLogAction.ADD_COMBAT,
          timestamp: new Date(gameStart.getTime() + 2000),
        }), // index 2
      ],
    });

    const gameAfterFirstUndo_Removed = { ...game, log: [game.log[0], game.log[1]] };
    const gameAfterFirstUndo_Reconstructed = { ...gameAfterFirstUndo_Removed };
    const gameAfterSecondUndo_Removed = { ...game, log: [game.log[0]] };
    const gameAfterSecondUndo_Reconstructed = { ...gameAfterSecondUndo_Removed };

    // --- First undo (index 2) ---
    removeTargetAndLinkedActionsSpy.mockImplementationOnce(() => gameAfterFirstUndo_Removed); // canUndoAction
    reconstructGameStateSpy.mockImplementationOnce(() => gameAfterFirstUndo_Reconstructed); // canUndoAction
    removeTargetAndLinkedActionsSpy.mockImplementationOnce(() => gameAfterFirstUndo_Removed); // undoAction
    reconstructGameStateSpy.mockImplementationOnce(() => gameAfterFirstUndo_Reconstructed); // undoAction

    let result = undoModule.undoAction(game, 2);
    expect(result.success).toBe(true);
    expect(result.game).toEqual(gameAfterFirstUndo_Reconstructed);
    expect(removeTargetAndLinkedActionsSpy).toHaveBeenCalledTimes(2);
    expect(reconstructGameStateSpy).toHaveBeenCalledTimes(2);
    expect(consoleErrorSpy).not.toHaveBeenCalled();

    // --- Second undo (index 1 on the *new* game state) ---
    const gameAfterFirstUndo = result.game;
    jest.clearAllMocks(); // Clear mocks before the second operation

    removeTargetAndLinkedActionsSpy.mockImplementationOnce(() => gameAfterSecondUndo_Removed); // canUndoAction
    reconstructGameStateSpy.mockImplementationOnce(() => gameAfterSecondUndo_Reconstructed); // canUndoAction
    removeTargetAndLinkedActionsSpy.mockImplementationOnce(() => gameAfterSecondUndo_Removed); // undoAction
    reconstructGameStateSpy.mockImplementationOnce(() => gameAfterSecondUndo_Reconstructed); // undoAction

    result = undoModule.undoAction(gameAfterFirstUndo, 1);
    expect(result.success).toBe(true);
    expect(result.game).toEqual(gameAfterSecondUndo_Reconstructed);
    expect(removeTargetAndLinkedActionsSpy).toHaveBeenCalledTimes(2);
    expect(reconstructGameStateSpy).toHaveBeenCalledTimes(2);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });
});
