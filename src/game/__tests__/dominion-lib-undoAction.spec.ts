import * as undoModule from '@/game/dominion-lib-undo';
import * as undoHelpers from '@/game/dominion-lib-undo-helpers';
import { ILogEntry } from '@/game/interfaces/log-entry';
import { GameLogActionWithCount } from '@/game/enumerations/game-log-action-with-count';
import { faker } from '@faker-js/faker';
import { createMockGame } from '@/__fixtures__/dominion-lib-fixtures';
import { DefaultTurnDetails } from '@/game/constants';
import { NotEnoughSupplyError } from '@/game/errors/not-enough-supply';
import { NotEnoughProphecyError } from '@/game/errors/not-enough-prophecy';
import { NotEnoughSubfieldError } from '../errors/not-enough-subfield';

jest.mock('@/game/dominion-lib-undo-helpers', () => ({
  removeTargetAndLinkedActions: jest.fn(),
  reconstructGameState: jest.fn(),
}));

describe('undoAction', () => {
  let consoleErrorSpy: jest.SpyInstance;
  let removeTargetAndLinkedActionsSpy: jest.SpyInstance;
  let reconstructGameStateSpy: jest.SpyInstance;

  const createLogEntry = (action: GameLogActionWithCount, id?: string): ILogEntry => ({
    id: id || faker.string.uuid(),
    timestamp: new Date(),
    action,
    count: 1,
    playerIndex: 0,
    playerTurnDetails:
      action === GameLogActionWithCount.NEXT_TURN
        ? [{ ...DefaultTurnDetails }, { ...DefaultTurnDetails }]
        : undefined,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    removeTargetAndLinkedActionsSpy = undoHelpers.removeTargetAndLinkedActions as jest.Mock;
    reconstructGameStateSpy = undoHelpers.reconstructGameState as jest.Mock;
  });

  it('should return success false if canUndoAction returns false', () => {
    const game = createMockGame(2, {
      log: [createLogEntry(GameLogActionWithCount.ADD_ACTIONS)],
    });

    // Ensure removeTargetAndLinkedActions returns a valid game
    removeTargetAndLinkedActionsSpy.mockReturnValue(game);

    reconstructGameStateSpy.mockImplementation(() => {
      throw new Error('Simulated error');
    });

    const result = undoModule.undoAction(game, 0);
    expect(result.success).toBe(false);
    expect(result.game).toBe(game);
    expect(removeTargetAndLinkedActionsSpy).toHaveBeenCalledWith(expect.any(Object), 0);
    expect(reconstructGameStateSpy).toHaveBeenCalledWith(expect.any(Object));
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error during game state reconstruction:',
      expect.any(Error)
    );
  });

  it('should return success true and updated game if undo is successful', () => {
    const game = createMockGame(2, {
      log: [createLogEntry(GameLogActionWithCount.ADD_ACTIONS)],
    });
    const updatedGame = { ...game, log: [] };
    removeTargetAndLinkedActionsSpy.mockReturnValue(updatedGame);
    reconstructGameStateSpy.mockReturnValue(updatedGame);

    const result = undoModule.undoAction(game, 0);
    expect(result.success).toBe(true);
    expect(result.game).toEqual(updatedGame);
    expect(removeTargetAndLinkedActionsSpy).toHaveBeenCalledWith(game, 0);
    expect(reconstructGameStateSpy).toHaveBeenCalledWith(updatedGame);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should handle errors during reconstruction and return success false', () => {
    const game = createMockGame(2, {
      log: [createLogEntry(GameLogActionWithCount.ADD_ACTIONS)],
    });
    removeTargetAndLinkedActionsSpy.mockReturnValue(game);
    const error = new Error('Reconstruction error');
    reconstructGameStateSpy.mockImplementation(() => {
      throw error;
    });

    const result = undoModule.undoAction(game, 0);
    expect(result.success).toBe(false);
    expect(result.game).toBe(game);
    expect(removeTargetAndLinkedActionsSpy).toHaveBeenCalledWith(expect.any(Object), 0);
    expect(reconstructGameStateSpy).toHaveBeenCalledWith(expect.any(Object));
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error during game state reconstruction:', error);
  });

  it('should handle NotEnoughSupplyError and return success false', () => {
    const game = createMockGame(2, {
      log: [createLogEntry(GameLogActionWithCount.REMOVE_ESTATES)],
    });
    removeTargetAndLinkedActionsSpy.mockReturnValue(game);
    const error = new NotEnoughSupplyError('estate');
    reconstructGameStateSpy.mockImplementation(() => {
      throw error;
    });

    const result = undoModule.undoAction(game, 0);
    expect(result.success).toBe(false);
    expect(result.game).toBe(game);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error during game state reconstruction:', error);
  });

  it('should handle NotEnoughProphecyError and return success false', () => {
    const game = createMockGame(2, {
      options: {
        curses: false,
        mats: { coffersVillagers: false, debt: false, favors: false },
        expansions: { risingSun: true, prosperity: false, renaissance: false },
      },
      log: [createLogEntry(GameLogActionWithCount.REMOVE_PROPHECY)],
    });
    removeTargetAndLinkedActionsSpy.mockReturnValue(game);
    const error = new NotEnoughProphecyError();
    reconstructGameStateSpy.mockImplementation(() => {
      throw error;
    });

    const result = undoModule.undoAction(game, 0);
    expect(result.success).toBe(false);
    expect(result.game).toBe(game);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error during game state reconstruction:', error);
  });

  it('should return success false if removeTargetAndLinkedActions throws an error', () => {
    const game = createMockGame(2, {
      log: [createLogEntry(GameLogActionWithCount.ADD_ACTIONS)],
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

    const result = undoModule.undoAction(game, 0);
    expect(result.success).toBe(false);
    expect(result.game).toBe(game);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error undoing action:', removalError);
    expect(reconstructGameStateSpy).toHaveBeenCalledWith(game);
  });

  it('should correctly undo a linked action', () => {
    const mainActionId = 'main-action';
    const game = createMockGame(2, {
      log: [
        createLogEntry(GameLogActionWithCount.ADD_ACTIONS, mainActionId),
        {
          ...createLogEntry(GameLogActionWithCount.REMOVE_ACTIONS),
          linkedActionId: mainActionId,
        },
      ],
    });
    const updatedGame = { ...game, log: [] };
    removeTargetAndLinkedActionsSpy.mockReturnValue(updatedGame);
    reconstructGameStateSpy.mockReturnValue(updatedGame);

    const result = undoModule.undoAction(game, 0);
    expect(result.success).toBe(true);
    expect(result.game).toEqual(updatedGame);
    expect(removeTargetAndLinkedActionsSpy).toHaveBeenCalledWith(game, 0);
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
        createLogEntry(GameLogActionWithCount.ADD_ACTIONS),
        createLogEntry(GameLogActionWithCount.ADD_BUYS),
      ],
    });

    const gameAfterFirstUndo = { ...game, log: [game.log[0]] };
    const gameAfterSecondUndo = { ...game, log: [] };

    // First undo

    // Mocks for canUndoAction (first call to removeTargetAndLinkedActions and reconstructGameState)
    removeTargetAndLinkedActionsSpy.mockReturnValueOnce(gameAfterFirstUndo);
    reconstructGameStateSpy.mockReturnValueOnce(gameAfterFirstUndo);

    // Mocks for undoAction (second call to removeTargetAndLinkedActions and reconstructGameState)
    removeTargetAndLinkedActionsSpy.mockReturnValueOnce(gameAfterFirstUndo);
    reconstructGameStateSpy.mockReturnValueOnce(gameAfterFirstUndo);

    let result = undoModule.undoAction(game, 1);
    expect(result.success).toBe(true);
    expect(result.game.log.length).toBe(1);
    expect(result.game.log[0].action).toBe(game.log[0].action);
    expect(removeTargetAndLinkedActionsSpy).toHaveBeenCalledWith(game, 1);
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

    result = undoModule.undoAction(gameAfterFirstUndo, 0);
    expect(result.success).toBe(true);
    expect(result.game.log.length).toBe(0);
    expect(removeTargetAndLinkedActionsSpy).toHaveBeenCalledWith(gameAfterFirstUndo, 0);
    expect(reconstructGameStateSpy).toHaveBeenCalledWith(gameAfterSecondUndo);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should handle NotEnoughSubfieldError and return success false', () => {
    const game = createMockGame(2, {
      log: [createLogEntry(GameLogActionWithCount.ADD_ACTIONS)],
    });
    const error = new NotEnoughSubfieldError('turn', 'actions');

    // First call (from canUndoAction): return a valid game
    removeTargetAndLinkedActionsSpy.mockReturnValueOnce(game);
    reconstructGameStateSpy.mockReturnValueOnce(game);

    // Second call (from undoAction): throw the error
    removeTargetAndLinkedActionsSpy.mockReturnValueOnce(game);
    reconstructGameStateSpy.mockImplementationOnce(() => {
      throw error;
    });

    const result = undoModule.undoAction(game, 0);
    expect(result.success).toBe(false);
    expect(result.game).toBe(game);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Cannot undo action: it would result in negative counters'
    );
    expect(reconstructGameStateSpy).toHaveBeenCalledTimes(2);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});
