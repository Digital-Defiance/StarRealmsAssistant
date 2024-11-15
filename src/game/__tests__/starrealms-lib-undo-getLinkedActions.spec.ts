import { getLinkedActions } from '@/game/starrealms-lib-undo';
import { ILogEntry } from '@/game/interfaces/log-entry';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import { createMockLog } from '@/__fixtures__/starrealms-lib-fixtures';

describe('getLinkedActions', () => {
  const gameStart = new Date('2021-01-01T00:00:00Z');

  it('should return an empty array when the log entry has a linkedAction', () => {
    const log = [
      createMockLog({ id: '1', action: GameLogAction.START_GAME, timestamp: gameStart }),
      createMockLog({
        id: '2',
        action: GameLogAction.ADD_TRADE,
        timestamp: new Date(gameStart.getTime() + 1000),
      }),
      createMockLog({
        id: '3',
        action: GameLogAction.REMOVE_TRADE,
        linkedActionId: '1',
        timestamp: new Date(gameStart.getTime() + 2000),
      }),
    ];
    const result = getLinkedActions(log, 2);
    expect(result).toEqual([]);
  });

  it('should return the original action and its linked actions', () => {
    const log = [
      createMockLog({ id: '1', action: GameLogAction.ADD_TRADE, timestamp: gameStart }),
      createMockLog({
        id: '2',
        action: GameLogAction.ADD_TRADE,
        timestamp: new Date(gameStart.getTime() + 1000),
      }),
      createMockLog({
        id: '3',
        action: GameLogAction.REMOVE_TRADE,
        linkedActionId: '2',
        timestamp: new Date(gameStart.getTime() + 2000),
      }),
      createMockLog({
        id: '4',
        action: GameLogAction.ADD_COMBAT,
        linkedActionId: '2',
        timestamp: new Date(gameStart.getTime() + 3000),
      }),
    ];
    const result = getLinkedActions(log, 1);
    expect(result).toEqual([log[1], log[2], log[3]]);
  });

  it('should return only the original action when there are no linked actions', () => {
    const log = [
      createMockLog({ id: '1', action: GameLogAction.ADD_TRADE, timestamp: gameStart }),
      createMockLog({
        id: '2',
        action: GameLogAction.ADD_TRADE,
        timestamp: new Date(gameStart.getTime() + 1000),
      }),
      createMockLog({
        id: '3',
        action: GameLogAction.REMOVE_TRADE,
        timestamp: new Date(gameStart.getTime() + 2000),
      }),
    ];
    const result = getLinkedActions(log, 1);
    expect(result).toEqual([log[1]]);
  });

  it('should handle an empty log array', () => {
    const log: ILogEntry[] = [];
    expect(() => getLinkedActions(log, 0)).toThrow();
  });

  it('should handle an invalid index', () => {
    const log = [
      createMockLog({ id: '1', action: GameLogAction.ADD_TRADE, timestamp: gameStart }),
      createMockLog({
        id: '2',
        action: GameLogAction.ADD_TRADE,
        timestamp: new Date(gameStart.getTime() + 1000),
      }),
    ];
    expect(() => getLinkedActions(log, 2)).toThrow();
  });

  it('should not include actions linked to other entries', () => {
    const log = [
      createMockLog({ id: '1', action: GameLogAction.ADD_TRADE, timestamp: gameStart }),
      createMockLog({
        id: '2',
        action: GameLogAction.ADD_TRADE,
        timestamp: new Date(gameStart.getTime() + 1000),
      }),
      createMockLog({
        id: '3',
        action: GameLogAction.REMOVE_TRADE,
        linkedActionId: '2',
        timestamp: new Date(gameStart.getTime() + 2000),
      }),
      createMockLog({
        id: '4',
        action: GameLogAction.ADD_COMBAT,
        timestamp: new Date(gameStart.getTime() + 3000),
      }),
      createMockLog({
        id: '5',
        action: GameLogAction.REMOVE_COMBAT,
        linkedActionId: '3',
        timestamp: new Date(gameStart.getTime() + 4000),
      }),
    ];
    const result = getLinkedActions(log, 1);
    expect(result).toEqual([log[1], log[2]]);
  });
});
