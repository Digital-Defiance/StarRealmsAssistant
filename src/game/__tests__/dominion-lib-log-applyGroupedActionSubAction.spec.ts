import { IGame } from '@/game/interfaces/game';
import { applyGroupedActionSubAction } from '@/game/dominion-lib-log';
import { ILogEntry } from '@/game/interfaces/log-entry';
import { createMockGame } from '@/__fixtures__/dominion-lib-fixtures';
import { v4 as uuidv4 } from 'uuid';
import { InvalidActionError } from '@/game/errors/invalid-action';
import { GameLogAction } from '@/game/enumerations/game-log-action';

describe('applyGroupedActionSubAction', () => {
  let mockGame: IGame;
  let actionDate: Date;
  let groupedActionId: string;

  beforeEach(() => {
    mockGame = createMockGame(2);
    actionDate = new Date();
    groupedActionId = uuidv4();
  });

  it('should throw an error if subAction.action is undefined', () => {
    const subAction: Partial<ILogEntry> = {};
    expect(() =>
      applyGroupedActionSubAction(mockGame, subAction, 0, groupedActionId, actionDate)
    ).toThrow('Action is required for group action sub-actions');
  });

  it('should throw an InvalidActionError if subAction.action is invalid', () => {
    const subAction: Partial<ILogEntry> = { action: 'INVALID_ACTION' as GameLogAction };
    expect(() =>
      applyGroupedActionSubAction(mockGame, subAction, 0, groupedActionId, actionDate)
    ).toThrow(InvalidActionError);
  });

  it('should create a valid log entry and apply it to the game state', () => {
    const subAction: Partial<ILogEntry> = {
      action: GameLogAction.ADD_ACTIONS,
      count: 2,
    };
    const updatedGame = applyGroupedActionSubAction(
      mockGame,
      subAction,
      0,
      groupedActionId,
      actionDate
    );

    const lastLogEntry = updatedGame.log[updatedGame.log.length - 1];
    expect(lastLogEntry.action).toBe(GameLogAction.ADD_ACTIONS);
    expect(lastLogEntry.count).toBe(2);
    expect(lastLogEntry.playerIndex).toBe(0);
    expect(lastLogEntry.currentPlayerIndex).toBe(mockGame.currentPlayerIndex);
    expect(lastLogEntry.turn).toBe(mockGame.currentTurn);
    expect(lastLogEntry.linkedActionId).toBe(groupedActionId);
    expect(lastLogEntry.timestamp).toEqual(actionDate);
  });

  it('should update the game state correctly for a valid sub-action', () => {
    const subAction: Partial<ILogEntry> = {
      action: GameLogAction.ADD_ACTIONS,
      count: 2,
    };
    const updatedGame = applyGroupedActionSubAction(
      mockGame,
      subAction,
      0,
      groupedActionId,
      actionDate
    );

    expect(updatedGame.players[0].turn.actions).toBe(3);
  });

  it('should handle multiple sub-actions correctly', () => {
    const subAction1: Partial<ILogEntry> = {
      action: GameLogAction.ADD_ACTIONS,
      count: 2,
    };
    const subAction2: Partial<ILogEntry> = {
      action: GameLogAction.ADD_BUYS,
      count: 1,
    };

    let updatedGame = applyGroupedActionSubAction(
      mockGame,
      subAction1,
      0,
      groupedActionId,
      actionDate
    );
    updatedGame = applyGroupedActionSubAction(
      updatedGame,
      subAction2,
      0,
      groupedActionId,
      actionDate
    );

    expect(updatedGame.players[0].turn.actions).toBe(3);
    expect(updatedGame.players[0].turn.buys).toBe(2);
  });
});
