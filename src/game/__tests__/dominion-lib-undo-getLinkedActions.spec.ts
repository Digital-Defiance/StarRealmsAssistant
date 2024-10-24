import { getLinkedActions } from '@/game/dominion-lib-undo';
import { ILogEntry } from '@/game/interfaces/log-entry';
import { GameLogActionWithCount } from '@/game/enumerations/game-log-action-with-count';

describe('getLinkedActions', () => {
  const createLogEntry = (
    id: string,
    action: GameLogActionWithCount,
    linkedActionId?: string
  ): ILogEntry => ({
    id,
    timestamp: new Date(),
    action,
    playerIndex: 0,
    currentPlayerIndex: 0,
    turn: 1,
    count: 1,
    linkedActionId,
  });

  it('should return an empty array when the log entry has a linkedAction', () => {
    const log = [
      createLogEntry('1', GameLogActionWithCount.ADD_ACTIONS),
      createLogEntry('2', GameLogActionWithCount.REMOVE_ACTIONS, '1'),
    ];
    const result = getLinkedActions(log, 1);
    expect(result).toEqual([]);
  });

  it('should return the original action and its linked actions', () => {
    const log = [
      createLogEntry('1', GameLogActionWithCount.ADD_ACTIONS),
      createLogEntry('2', GameLogActionWithCount.REMOVE_ACTIONS, '1'),
      createLogEntry('3', GameLogActionWithCount.ADD_BUYS, '1'),
    ];
    const result = getLinkedActions(log, 0);
    expect(result).toEqual([log[0], log[1], log[2]]);
  });

  it('should return only the original action when there are no linked actions', () => {
    const log = [
      createLogEntry('1', GameLogActionWithCount.ADD_ACTIONS),
      createLogEntry('2', GameLogActionWithCount.REMOVE_ACTIONS),
    ];
    const result = getLinkedActions(log, 0);
    expect(result).toEqual([log[0]]);
  });

  it('should handle an empty log array', () => {
    const log: ILogEntry[] = [];
    expect(() => getLinkedActions(log, 0)).toThrow();
  });

  it('should handle an invalid index', () => {
    const log = [createLogEntry('1', GameLogActionWithCount.ADD_ACTIONS)];
    expect(() => getLinkedActions(log, 1)).toThrow();
  });

  it('should not include actions linked to other entries', () => {
    const log = [
      createLogEntry('1', GameLogActionWithCount.ADD_ACTIONS),
      createLogEntry('2', GameLogActionWithCount.REMOVE_ACTIONS, '1'),
      createLogEntry('3', GameLogActionWithCount.ADD_BUYS),
      createLogEntry('4', GameLogActionWithCount.REMOVE_BUYS, '3'),
    ];
    const result = getLinkedActions(log, 0);
    expect(result).toEqual([log[0], log[1]]);
  });
});
