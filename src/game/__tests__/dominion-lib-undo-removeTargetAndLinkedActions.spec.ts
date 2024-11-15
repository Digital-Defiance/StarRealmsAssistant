import { removeTargetAndLinkedActions } from '@/game/dominion-lib-undo-helpers';
import { IGame } from '@/game/interfaces/game';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import { createMockGame, createMockLog } from '@/__fixtures__/dominion-lib-fixtures';

describe('removeTargetAndLinkedActions', () => {
  let mockGame: IGame;
  const gameStart = new Date('2022-01-01');

  beforeEach(() => {
    mockGame = createMockGame(2);
  });

  it('should remove the target action when it has no links', () => {
    mockGame.log = [
      createMockLog({ id: '1', action: GameLogAction.START_GAME, timestamp: gameStart }),
      createMockLog({
        id: '2',
        action: GameLogAction.ADD_ACTIONS,
        timestamp: new Date(gameStart.getTime() + 1000),
      }),
      createMockLog({
        id: '3',
        action: GameLogAction.ADD_BUYS,
        timestamp: new Date(gameStart.getTime() + 2000),
      }),
      createMockLog({
        id: '4',
        action: GameLogAction.ADD_COINS,
        timestamp: new Date(gameStart.getTime() + 3000),
      }),
    ];

    const result = removeTargetAndLinkedActions(mockGame, 2);

    expect(result.log).toHaveLength(3);
    expect(result.log[0].id).toBe('1');
    expect(result.log[1].id).toBe('2');
    expect(result.log[2].id).toBe('4');
  });

  it('should remove the main action and all its linked actions', () => {
    mockGame.log = [
      createMockLog({ id: '1', action: GameLogAction.START_GAME, timestamp: gameStart }),
      createMockLog({
        id: '2',
        action: GameLogAction.ADD_ACTIONS,
        timestamp: new Date(gameStart.getTime() + 1000),
      }),
      createMockLog({
        id: '3',
        action: GameLogAction.ADD_BUYS,
        timestamp: new Date(gameStart.getTime() + 2000),
      }),
      createMockLog({
        id: '4',
        action: GameLogAction.REMOVE_BUYS,
        linkedActionId: '3',
        timestamp: new Date(gameStart.getTime() + 3000),
      }),
      createMockLog({
        id: '5',
        action: GameLogAction.ADD_COINS,
        linkedActionId: '3',
        timestamp: new Date(gameStart.getTime() + 4000),
      }),
      createMockLog({
        id: '6',
        action: GameLogAction.ADD_ACTIONS,
        timestamp: new Date(gameStart.getTime() + 5000),
      }),
    ];

    const result = removeTargetAndLinkedActions(mockGame, 2);

    expect(result.log).toHaveLength(3);
    expect(result.log[0].id).toBe('1');
    expect(result.log[1].id).toBe('2');
    expect(result.log[2].id).toBe('6');
  });

  it('should remove the main action and all linked actions when targeting a linked action', () => {
    mockGame.log = [
      createMockLog({ id: '1', action: GameLogAction.START_GAME, timestamp: gameStart }),
      createMockLog({
        id: '2',
        action: GameLogAction.ADD_ACTIONS,
        timestamp: new Date(gameStart.getTime() + 1000),
      }),
      createMockLog({
        id: '3',
        action: GameLogAction.ADD_BUYS,
        timestamp: new Date(gameStart.getTime() + 2000),
      }),
      createMockLog({
        id: '4',
        action: GameLogAction.REMOVE_BUYS,
        linkedActionId: '3',
        timestamp: new Date(gameStart.getTime() + 3000),
      }),
      createMockLog({
        id: '5',
        action: GameLogAction.ADD_COINS,
        linkedActionId: '3',
        timestamp: new Date(gameStart.getTime() + 4000),
      }),
      createMockLog({
        id: '6',
        action: GameLogAction.ADD_ACTIONS,
        timestamp: new Date(gameStart.getTime() + 5000),
      }),
    ];

    const result = removeTargetAndLinkedActions(mockGame, 4);

    expect(result.log).toHaveLength(3);
    expect(result.log[0].id).toBe('1');
    expect(result.log[1].id).toBe('2');
    expect(result.log[2].id).toBe('6');
  });

  it('should handle removing the last action in the log', () => {
    mockGame.log = [
      createMockLog({ id: '1', action: GameLogAction.START_GAME, timestamp: gameStart }),
      createMockLog({
        id: '2',
        action: GameLogAction.ADD_ACTIONS,
        timestamp: new Date(gameStart.getTime() + 1000),
      }),
      createMockLog({
        id: '3',
        action: GameLogAction.ADD_BUYS,
        timestamp: new Date(gameStart.getTime() + 2000),
      }),
    ];

    const result = removeTargetAndLinkedActions(mockGame, 2);

    expect(result.log).toHaveLength(2);
    expect(result.log[0].id).toBe('1');
    expect(result.log[1].id).toBe('2');
  });

  it('should handle removing the first action in the log', () => {
    mockGame.log = [
      createMockLog({ id: '1', action: GameLogAction.START_GAME, timestamp: gameStart }),
      createMockLog({
        id: '2',
        action: GameLogAction.ADD_ACTIONS,
        timestamp: new Date(gameStart.getTime() + 1000),
      }),
      createMockLog({
        id: '3',
        action: GameLogAction.ADD_BUYS,
        timestamp: new Date(gameStart.getTime() + 2000),
      }),
    ];

    const result = removeTargetAndLinkedActions(mockGame, 0);

    expect(result.log).toHaveLength(2);
    expect(result.log[0].id).toBe('2');
    expect(result.log[1].id).toBe('3');
  });

  it('should handle an empty log', () => {
    const result = removeTargetAndLinkedActions(mockGame, 0);

    expect(result.log).toHaveLength(0);
  });

  it('should handle an invalid index', () => {
    mockGame.log = [
      createMockLog({ id: '1', action: GameLogAction.START_GAME, timestamp: gameStart }),
      createMockLog({
        id: '2',
        action: GameLogAction.ADD_ACTIONS,
        timestamp: new Date(gameStart.getTime() + 1000),
      }),
      createMockLog({
        id: '3',
        action: GameLogAction.ADD_BUYS,
        timestamp: new Date(gameStart.getTime() + 2000),
      }),
    ];

    const result = removeTargetAndLinkedActions(mockGame, 5);

    expect(result.log).toHaveLength(3);
    expect(result.log).toEqual(mockGame.log);
  });

  it('should handle complex linking scenarios', () => {
    mockGame.log = [
      createMockLog({ id: '1', action: GameLogAction.START_GAME, timestamp: gameStart }),
      createMockLog({
        id: '2',
        action: GameLogAction.ADD_ACTIONS,
        timestamp: new Date(gameStart.getTime() + 1000),
      }),
      createMockLog({
        id: '3',
        action: GameLogAction.ADD_BUYS,
        timestamp: new Date(gameStart.getTime() + 2000),
      }),
      createMockLog({
        id: '4',
        action: GameLogAction.REMOVE_BUYS,
        linkedActionId: '2',
        timestamp: new Date(gameStart.getTime() + 3000),
      }),
      createMockLog({
        id: '5',
        action: GameLogAction.ADD_COINS,
        linkedActionId: '2',
        timestamp: new Date(gameStart.getTime() + 4000),
      }),
      createMockLog({
        id: '6',
        action: GameLogAction.ADD_ACTIONS,
        timestamp: new Date(gameStart.getTime() + 5000),
      }),
      createMockLog({
        id: '7',
        action: GameLogAction.REMOVE_ACTIONS,
        linkedActionId: '5',
        timestamp: new Date(gameStart.getTime() + 6000),
      }),
      createMockLog({
        id: '8',
        action: GameLogAction.ADD_BUYS,
        linkedActionId: '5',
        timestamp: new Date(gameStart.getTime() + 7000),
      }),
    ];

    const result = removeTargetAndLinkedActions(mockGame, 6);

    expect(result.log).toHaveLength(5);
    expect(result.log.map((entry) => entry.id)).toEqual(['1', '2', '3', '4', '6']);
  });

  it('should handle when the main action for a linked action is not found', () => {
    mockGame.log = [
      createMockLog({ id: '1', action: GameLogAction.START_GAME, timestamp: gameStart }),
      createMockLog({
        id: '2',
        action: GameLogAction.ADD_ACTIONS,
        timestamp: new Date(gameStart.getTime() + 1000),
      }),
      // The linkedAction 'non-existent-id' does not exist in the log
      createMockLog({
        id: '3',
        action: GameLogAction.REMOVE_BUYS,
        linkedActionId: 'non-existent-id',
        timestamp: new Date(gameStart.getTime() + 2000),
      }),
      createMockLog({
        id: '4',
        action: GameLogAction.ADD_COINS,
        timestamp: new Date(gameStart.getTime() + 3000),
      }),
    ];

    const result = removeTargetAndLinkedActions(mockGame, 2);

    // Only the target action and any actions linked to it should be removed
    expect(result.log).toHaveLength(3);
    expect(result.log[0].id).toBe('1');
    expect(result.log[1].id).toBe('2');
    expect(result.log[2].id).toBe('4');
  });
});
