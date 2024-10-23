import { removeTargetAndLinkedActions } from '@/game/dominion-lib-undo-helpers';
import { IGame } from '@/game/interfaces/game';
import { ILogEntry } from '@/game/interfaces/log-entry';
import { GameLogActionWithCount } from '@/game/enumerations/game-log-action-with-count';
import { createMockGame } from '@/__fixtures__/dominion-lib-fixtures';

describe('removeTargetAndLinkedActions', () => {
  let mockGame: IGame;

  beforeEach(() => {
    mockGame = createMockGame(2);
  });

  const createLogEntry = (
    id: string,
    action: GameLogActionWithCount,
    linkedActionId?: string
  ): ILogEntry => ({
    id,
    action,
    timestamp: new Date(),
    playerIndex: 0,
    currentPlayerIndex: 0,
    count: 1,
    linkedActionId,
  });

  it('should remove the target action when it has no links', () => {
    mockGame.log = [
      createLogEntry('1', GameLogActionWithCount.ADD_ACTIONS),
      createLogEntry('2', GameLogActionWithCount.ADD_BUYS),
      createLogEntry('3', GameLogActionWithCount.ADD_COINS),
    ];

    const result = removeTargetAndLinkedActions(mockGame, 1);

    expect(result.log).toHaveLength(2);
    expect(result.log[0].id).toBe('1');
    expect(result.log[1].id).toBe('3');
  });

  it('should remove the main action and all its linked actions', () => {
    mockGame.log = [
      createLogEntry('1', GameLogActionWithCount.ADD_ACTIONS),
      createLogEntry('2', GameLogActionWithCount.ADD_BUYS),
      createLogEntry('3', GameLogActionWithCount.REMOVE_BUYS, '2'),
      createLogEntry('4', GameLogActionWithCount.ADD_COINS, '2'),
      createLogEntry('5', GameLogActionWithCount.ADD_ACTIONS),
    ];

    const result = removeTargetAndLinkedActions(mockGame, 1);

    expect(result.log).toHaveLength(2);
    expect(result.log[0].id).toBe('1');
    expect(result.log[1].id).toBe('5');
  });

  it('should remove the main action and all linked actions when targeting a linked action', () => {
    mockGame.log = [
      createLogEntry('1', GameLogActionWithCount.ADD_ACTIONS),
      createLogEntry('2', GameLogActionWithCount.ADD_BUYS),
      createLogEntry('3', GameLogActionWithCount.REMOVE_BUYS, '2'),
      createLogEntry('4', GameLogActionWithCount.ADD_COINS, '2'),
      createLogEntry('5', GameLogActionWithCount.ADD_ACTIONS),
    ];

    const result = removeTargetAndLinkedActions(mockGame, 3);

    expect(result.log).toHaveLength(2);
    expect(result.log[0].id).toBe('1');
    expect(result.log[1].id).toBe('5');
  });

  it('should handle removing the last action in the log', () => {
    mockGame.log = [
      createLogEntry('1', GameLogActionWithCount.ADD_ACTIONS),
      createLogEntry('2', GameLogActionWithCount.ADD_BUYS),
    ];

    const result = removeTargetAndLinkedActions(mockGame, 1);

    expect(result.log).toHaveLength(1);
    expect(result.log[0].id).toBe('1');
  });

  it('should handle removing the first action in the log', () => {
    mockGame.log = [
      createLogEntry('1', GameLogActionWithCount.ADD_ACTIONS),
      createLogEntry('2', GameLogActionWithCount.ADD_BUYS),
    ];

    const result = removeTargetAndLinkedActions(mockGame, 0);

    expect(result.log).toHaveLength(1);
    expect(result.log[0].id).toBe('2');
  });

  it('should handle an empty log', () => {
    const result = removeTargetAndLinkedActions(mockGame, 0);

    expect(result.log).toHaveLength(0);
  });

  it('should handle an invalid index', () => {
    mockGame.log = [
      createLogEntry('1', GameLogActionWithCount.ADD_ACTIONS),
      createLogEntry('2', GameLogActionWithCount.ADD_BUYS),
    ];

    const result = removeTargetAndLinkedActions(mockGame, 5);

    expect(result.log).toHaveLength(2);
    expect(result.log).toEqual(mockGame.log);
  });

  it('should handle complex linking scenarios', () => {
    mockGame.log = [
      createLogEntry('1', GameLogActionWithCount.ADD_ACTIONS),
      createLogEntry('2', GameLogActionWithCount.ADD_BUYS),
      createLogEntry('3', GameLogActionWithCount.REMOVE_BUYS, '2'),
      createLogEntry('4', GameLogActionWithCount.ADD_COINS, '2'),
      createLogEntry('5', GameLogActionWithCount.ADD_ACTIONS),
      createLogEntry('6', GameLogActionWithCount.REMOVE_ACTIONS, '5'),
      createLogEntry('7', GameLogActionWithCount.ADD_BUYS, '5'),
    ];

    const result = removeTargetAndLinkedActions(mockGame, 5);

    expect(result.log).toHaveLength(4);
    expect(result.log.map((entry) => entry.id)).toEqual(['1', '2', '3', '4']);
  });

  it('should handle when the main action for a linked action is not found', () => {
    mockGame.log = [
      createLogEntry('1', GameLogActionWithCount.ADD_ACTIONS),
      // The linkedAction 'non-existent-id' does not exist in the log
      createLogEntry('2', GameLogActionWithCount.REMOVE_BUYS, 'non-existent-id'),
      createLogEntry('3', GameLogActionWithCount.ADD_COINS),
    ];

    const result = removeTargetAndLinkedActions(mockGame, 1);

    // Only the target action and any actions linked to it should be removed
    expect(result.log).toHaveLength(2);
    expect(result.log[0].id).toBe('1');
    expect(result.log[1].id).toBe('3');
  });
});
