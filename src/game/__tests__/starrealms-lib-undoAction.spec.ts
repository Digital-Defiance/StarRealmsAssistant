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
  let removeTargetAndLinkedActionsSpy: jest.SpyInstance;
  let reconstructGameStateSpy: jest.SpyInstance;
  const gameStart: Date = new Date('2021-01-01T00:00:00.000Z');

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {
      // do nothing
    });

    removeTargetAndLinkedActionsSpy = undoHelpers.removeTargetAndLinkedActions as jest.Mock;
    reconstructGameStateSpy = undoHelpers.reconstructGameState as jest.Mock;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return success false if canUndoAction returns false', () => {
    const game = createMockGame(2, {
      log: [
        createMockLog({ action: GameLogAction.START_GAME, timestamp: gameStart }),
        createMockLog({
          action: GameLogAction.ADD_TRADE,
          timestamp: new Date(gameStart.getTime() + 1000),
        }),
      ],
    });

    // Ensure removeTargetAndLinkedActions returns a valid game
    removeTargetAndLinkedActionsSpy.mockReturnValue(game);

    reconstructGameStateSpy.mockImplementation(() => {
      throw new Error('Simulated error');
    });

    const result = undoModule.undoAction(game, 1);
    expect(result.success).toBe(false);
    expect(result.game).toBe(game);
    expect(removeTargetAndLinkedActionsSpy).toHaveBeenCalledWith(expect.any(Object), 1);
    expect(reconstructGameStateSpy).toHaveBeenCalledWith(expect.any(Object));
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error during game state reconstruction:',
      expect.any(Error)
    );
  });

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
    const updatedGame = { ...game, log: [] };
    removeTargetAndLinkedActionsSpy.mockReturnValue(updatedGame);
    reconstructGameStateSpy.mockReturnValue(updatedGame);

    const result = undoModule.undoAction(game, 1);
    expect(result.success).toBe(true);
    expect(result.game).toEqual(updatedGame);
    expect(removeTargetAndLinkedActionsSpy).toHaveBeenCalledWith(game, 1);
    expect(reconstructGameStateSpy).toHaveBeenCalledWith(updatedGame);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should handle errors during reconstruction and return success false', () => {
    const game = createMockGame(2, {
      log: [
        createMockLog({ action: GameLogAction.START_GAME, timestamp: gameStart }),
        createMockLog({
          action: GameLogAction.ADD_TRADE,
          timestamp: new Date(gameStart.getTime() + 1000),
        }),
      ],
    });
    removeTargetAndLinkedActionsSpy.mockReturnValue(game);
    const error = new Error('Reconstruction error');
    reconstructGameStateSpy.mockImplementation(() => {
      throw error;
    });

    const result = undoModule.undoAction(game, 1);
    expect(result.success).toBe(false);
    expect(result.game).toBe(game);
    expect(removeTargetAndLinkedActionsSpy).toHaveBeenCalledWith(expect.any(Object), 1);
    expect(reconstructGameStateSpy).toHaveBeenCalledWith(expect.any(Object));
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error during game state reconstruction:', error);
  });

  it('should return success false if removeTargetAndLinkedActions throws an error', () => {
    const game = createMockGame(2, {
      log: [
        createMockLog({ action: GameLogAction.START_GAME, timestamp: gameStart }),
        createMockLog({
          action: GameLogAction.ADD_TRADE,
          timestamp: new Date(gameStart.getTime() + 1000),
        }),
      ],
    });
    const removalError = new Error('Removal error');

    // First call (from canUndoAction): return a valid game
    removeTargetAndLinkedActionsSpy.mockReturnValueOnce(game);
    reconstructGameStateSpy.mockReturnValueOnce(game);

    // Second call (from undoAction): throw an error
    removeTargetAndLinkedActionsSpy.mockImplementationOnce(() => {
      throw removalError;
    });

    // Clear the call count after canUndoAction
    reconstructGameStateSpy.mockClear();
    consoleErrorSpy.mockClear();

    const result = undoModule.undoAction(game, 1);
    expect(result.success).toBe(false);
    expect(result.game).toBe(game);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error undoing action:', removalError);
    expect(reconstructGameStateSpy).toHaveBeenCalledWith(game);
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
    const updatedGame = { ...game, log: [] };
    removeTargetAndLinkedActionsSpy.mockReturnValue(updatedGame);
    reconstructGameStateSpy.mockReturnValue(updatedGame);

    const result = undoModule.undoAction(game, 1);
    expect(result.success).toBe(true);
    expect(result.game).toEqual(updatedGame);
    expect(removeTargetAndLinkedActionsSpy).toHaveBeenCalledWith(game, 1);
    expect(reconstructGameStateSpy).toHaveBeenCalledWith(updatedGame);
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
        }),
        createMockLog({
          action: GameLogAction.ADD_COMBAT,
          timestamp: new Date(gameStart.getTime() + 2000),
        }),
      ],
    });

    const gameAfterFirstUndo = { ...game, log: [game.log[0], game.log[1]] };
    const gameAfterSecondUndo = { ...game, log: [game.log[0]] };

    // First undo

    // Mocks for canUndoAction (first call to removeTargetAndLinkedActions and reconstructGameState)
    removeTargetAndLinkedActionsSpy.mockReturnValueOnce(gameAfterFirstUndo);
    reconstructGameStateSpy.mockReturnValueOnce(gameAfterFirstUndo);

    // Mocks for undoAction (second call to removeTargetAndLinkedActions and reconstructGameState)
    removeTargetAndLinkedActionsSpy.mockReturnValueOnce(gameAfterFirstUndo);
    reconstructGameStateSpy.mockReturnValueOnce(gameAfterFirstUndo);

    let result = undoModule.undoAction(game, 2);
    expect(result.success).toBe(true);
    expect(result.game.log.length).toBe(2);
    expect(result.game.log[0].action).toBe(game.log[0].action);
    expect(removeTargetAndLinkedActionsSpy).toHaveBeenCalledWith(game, 2);
    expect(reconstructGameStateSpy).toHaveBeenCalledWith(gameAfterFirstUndo);
    expect(consoleErrorSpy).not.toHaveBeenCalled();

    jest.clearAllMocks();

    // Second undo

    // Mocks for canUndoAction
    removeTargetAndLinkedActionsSpy.mockReturnValueOnce(gameAfterSecondUndo);
    reconstructGameStateSpy.mockReturnValueOnce(gameAfterSecondUndo);

    // Mocks for undoAction
    removeTargetAndLinkedActionsSpy.mockReturnValueOnce(gameAfterSecondUndo);
    reconstructGameStateSpy.mockReturnValueOnce(gameAfterSecondUndo);

    result = undoModule.undoAction(gameAfterFirstUndo, 1);
    expect(result.success).toBe(true);
    expect(result.game.log.length).toBe(1);
    expect(removeTargetAndLinkedActionsSpy).toHaveBeenCalledWith(gameAfterFirstUndo, 1);
    expect(reconstructGameStateSpy).toHaveBeenCalledWith(gameAfterSecondUndo);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should handle NotEnoughSubfieldError and return success false', () => {
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

    // First call (from canUndoAction): return a valid game
    removeTargetAndLinkedActionsSpy.mockReturnValueOnce(game);
    reconstructGameStateSpy.mockReturnValueOnce(game);

    // Second call (from undoAction): throw the error
    removeTargetAndLinkedActionsSpy.mockReturnValueOnce(game);
    reconstructGameStateSpy.mockImplementationOnce(() => {
      throw error;
    });

    const result = undoModule.undoAction(game, 1);
    expect(result.success).toBe(false);
    expect(result.game).toBe(game);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Cannot undo action: it would result in negative counters'
    );
    expect(reconstructGameStateSpy).toHaveBeenCalledTimes(2);
  });
});
