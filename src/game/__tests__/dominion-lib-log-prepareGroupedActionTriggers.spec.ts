import { IGame } from '@/game/interfaces/game';
import { IGroupedAction } from '@/game/interfaces/grouped-action';
import { GroupedActionDest } from '@/game/enumerations/grouped-action-dest';
import { GroupedActionTrigger } from '@/game/enumerations/grouped-action-trigger';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import { getPlayerNextTurnCount, prepareGroupedActionTriggers } from '@/game/dominion-lib-log';
import { createMockGame } from '@/__fixtures__/dominion-lib-fixtures';
import { ILogEntry } from '@/game/interfaces/log-entry';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid'),
}));

describe('prepareGroupedActionTriggers', () => {
  let mockGame: IGame;
  let mockGroupedAction: IGroupedAction;

  beforeEach(() => {
    mockGame = createMockGame(4);
    mockGroupedAction = {
      name: 'Test Grouped Action',
      actions: {
        [GroupedActionDest.AllPlayers]: [],
        [GroupedActionDest.AllPlayersExceptCurrent]: [],
        [GroupedActionDest.AllPlayersExceptSelected]: [],
        [GroupedActionDest.CurrentPlayerIndex]: [],
        [GroupedActionDest.SelectedPlayerIndex]: [],
      },
      triggers: {
        [GroupedActionTrigger.AfterNextTurnBegins]: {
          [GroupedActionDest.AllPlayers]: [],
          [GroupedActionDest.AllPlayersExceptCurrent]: [],
          [GroupedActionDest.AllPlayersExceptSelected]: [],
          [GroupedActionDest.CurrentPlayerIndex]: [],
          [GroupedActionDest.SelectedPlayerIndex]: [],
        },
      },
    };
  });

  it('should return the game unchanged if there are no triggers', () => {
    const result = prepareGroupedActionTriggers(mockGame, mockGroupedAction, 'test-id');
    expect(result).toEqual(mockGame);
  });

  it('should add pending actions for AfterNextTurnBegins trigger', () => {
    mockGroupedAction.triggers = {
      [GroupedActionTrigger.AfterNextTurnBegins]: {
        [GroupedActionDest.CurrentPlayerIndex]: [{ action: GameLogAction.ADD_CARDS, count: 1 }],
        [GroupedActionDest.AllPlayers]: [],
        [GroupedActionDest.AllPlayersExceptCurrent]: [],
        [GroupedActionDest.AllPlayersExceptSelected]: [],
        [GroupedActionDest.SelectedPlayerIndex]: [],
      },
    };

    const result = prepareGroupedActionTriggers(mockGame, mockGroupedAction, 'test-id');

    expect(result.pendingGroupedActions).toHaveLength(1);
    expect(result.pendingGroupedActions[0]).toEqual(
      expect.objectContaining({
        action: GameLogAction.ADD_CARDS,
        count: 1,
        linkedActionId: 'test-id',
        playerIndex: mockGame.currentPlayerIndex,
        currentPlayerIndex: mockGame.currentPlayerIndex,
        turn: mockGame.currentTurn + 4, // 4 players, so in 4 turns
      })
    );
  });

  it('should add pending actions for AfterNextTurnBegins trigger for all players and compute the turns', () => {
    mockGroupedAction.triggers = {
      [GroupedActionTrigger.AfterNextTurnBegins]: {
        [GroupedActionDest.CurrentPlayerIndex]: [],
        [GroupedActionDest.AllPlayers]: [{ action: GameLogAction.ADD_CARDS, count: 1 }],
        [GroupedActionDest.AllPlayersExceptCurrent]: [],
        [GroupedActionDest.AllPlayersExceptSelected]: [],
        [GroupedActionDest.SelectedPlayerIndex]: [],
      },
    };

    const result = prepareGroupedActionTriggers(mockGame, mockGroupedAction, 'test-id');

    expect(result.pendingGroupedActions).toHaveLength(4);
    // actions are added in player index order, not turn order
    expect(result.pendingGroupedActions).toEqual([
      expect.objectContaining({
        action: GameLogAction.ADD_CARDS,
        count: 1,
        linkedActionId: 'test-id',
        playerIndex: 0,
        currentPlayerIndex: 0,
        turn: getPlayerNextTurnCount(mockGame, 0, true),
      }),
      expect.objectContaining({
        action: GameLogAction.ADD_CARDS,
        count: 1,
        linkedActionId: 'test-id',
        playerIndex: 1,
        currentPlayerIndex: 1,
        turn: getPlayerNextTurnCount(mockGame, 1, true),
      }),
      expect.objectContaining({
        action: GameLogAction.ADD_CARDS,
        count: 1,
        linkedActionId: 'test-id',
        playerIndex: 2,
        currentPlayerIndex: 2,
        turn: getPlayerNextTurnCount(mockGame, 2, true),
      }),
      expect.objectContaining({
        action: GameLogAction.ADD_CARDS,
        count: 1,
        linkedActionId: 'test-id',
        playerIndex: 3,
        currentPlayerIndex: 3,
        turn: getPlayerNextTurnCount(mockGame, 3, true),
      }),
    ]);
  });

  it('should handle multiple actions for different destinations', () => {
    mockGroupedAction.triggers = {
      [GroupedActionTrigger.AfterNextTurnBegins]: {
        [GroupedActionDest.CurrentPlayerIndex]: [{ action: GameLogAction.ADD_CARDS, count: 1 }],
        [GroupedActionDest.AllPlayersExceptCurrent]: [
          { action: GameLogAction.REMOVE_CARDS, count: 1 },
        ],
        [GroupedActionDest.AllPlayers]: [],
        [GroupedActionDest.AllPlayersExceptSelected]: [],
        [GroupedActionDest.SelectedPlayerIndex]: [],
      },
    };

    const result = prepareGroupedActionTriggers(mockGame, mockGroupedAction, 'test-id');

    expect(result.pendingGroupedActions).toHaveLength(4); // 1 for current player, 3 for others
    expect(result.pendingGroupedActions[0].action).toBe(GameLogAction.ADD_CARDS);
    expect(result.pendingGroupedActions[1].action).toBe(GameLogAction.REMOVE_CARDS);
    expect(result.pendingGroupedActions[2].action).toBe(GameLogAction.REMOVE_CARDS);
    expect(result.pendingGroupedActions[3].action).toBe(GameLogAction.REMOVE_CARDS);
  });

  it('should throw an error if action is missing in trigger sub-actions', () => {
    mockGroupedAction.triggers = {
      [GroupedActionTrigger.AfterNextTurnBegins]: {
        [GroupedActionDest.CurrentPlayerIndex]: [
          { action: undefined, count: 1 } as Partial<ILogEntry>, // Missing action
        ],
        [GroupedActionDest.AllPlayers]: [],
        [GroupedActionDest.AllPlayersExceptCurrent]: [],
        [GroupedActionDest.AllPlayersExceptSelected]: [],
        [GroupedActionDest.SelectedPlayerIndex]: [],
      },
    };

    expect(() => prepareGroupedActionTriggers(mockGame, mockGroupedAction, 'test-id')).toThrow(
      'Action is required for trigger sub-actions'
    );
  });

  it('should handle empty trigger actions without errors', () => {
    mockGroupedAction.triggers = {
      [GroupedActionTrigger.AfterNextTurnBegins]: {
        [GroupedActionDest.AllPlayers]: [],
        [GroupedActionDest.AllPlayersExceptCurrent]: [],
        [GroupedActionDest.AllPlayersExceptSelected]: [],
        [GroupedActionDest.CurrentPlayerIndex]: [],
        [GroupedActionDest.SelectedPlayerIndex]: [],
      },
    };

    const result = prepareGroupedActionTriggers(mockGame, mockGroupedAction, 'test-id');
    expect(result.pendingGroupedActions).toHaveLength(0);
  });

  it('should handle triggers for the selected player', () => {
    mockGame.selectedPlayerIndex = 2;
    mockGroupedAction.triggers = {
      [GroupedActionTrigger.AfterNextTurnBegins]: {
        [GroupedActionDest.SelectedPlayerIndex]: [{ action: GameLogAction.ADD_COINS, count: 2 }],
        [GroupedActionDest.AllPlayers]: [],
        [GroupedActionDest.AllPlayersExceptCurrent]: [],
        [GroupedActionDest.AllPlayersExceptSelected]: [],
        [GroupedActionDest.CurrentPlayerIndex]: [],
      },
    };

    const result = prepareGroupedActionTriggers(mockGame, mockGroupedAction, 'test-id');

    expect(result.pendingGroupedActions).toHaveLength(1);
    expect(result.pendingGroupedActions[0]).toEqual(
      expect.objectContaining({
        action: GameLogAction.ADD_COINS,
        count: 2,
        playerIndex: 2,
        currentPlayerIndex: 2,
      })
    );
  });

  it('should handle triggers for all players', () => {
    mockGroupedAction.triggers = {
      [GroupedActionTrigger.AfterNextTurnBegins]: {
        [GroupedActionDest.AllPlayers]: [{ action: GameLogAction.ADD_ACTIONS, count: 1 }],
        [GroupedActionDest.AllPlayersExceptCurrent]: [],
        [GroupedActionDest.AllPlayersExceptSelected]: [],
        [GroupedActionDest.CurrentPlayerIndex]: [],
        [GroupedActionDest.SelectedPlayerIndex]: [],
      },
    };

    const result = prepareGroupedActionTriggers(mockGame, mockGroupedAction, 'test-id');

    expect(result.pendingGroupedActions).toHaveLength(4); // One for each player
    result.pendingGroupedActions.forEach((action, index) => {
      expect(action).toEqual(
        expect.objectContaining({
          action: GameLogAction.ADD_ACTIONS,
          count: 1,
          playerIndex: index,
          currentPlayerIndex: index,
        })
      );
    });
  });

  it('should handle triggers for all players except selected', () => {
    mockGame.selectedPlayerIndex = 1;
    mockGroupedAction.triggers = {
      [GroupedActionTrigger.AfterNextTurnBegins]: {
        [GroupedActionDest.AllPlayersExceptSelected]: [
          { action: GameLogAction.REMOVE_CARDS, count: 1 },
        ],
        [GroupedActionDest.AllPlayers]: [],
        [GroupedActionDest.AllPlayersExceptCurrent]: [],
        [GroupedActionDest.CurrentPlayerIndex]: [],
        [GroupedActionDest.SelectedPlayerIndex]: [],
      },
    };

    const result = prepareGroupedActionTriggers(mockGame, mockGroupedAction, 'test-id');

    expect(result.pendingGroupedActions).toHaveLength(3); // All players except selected
    result.pendingGroupedActions.forEach((action) => {
      expect(action.playerIndex).not.toBe(1);
      expect(action.action).toBe(GameLogAction.REMOVE_CARDS);
    });
  });

  it('should handle empty triggers object', () => {
    mockGroupedAction.triggers = {
      [GroupedActionTrigger.AfterNextTurnBegins]: {
        [GroupedActionDest.AllPlayers]: [],
        [GroupedActionDest.AllPlayersExceptCurrent]: [],
        [GroupedActionDest.AllPlayersExceptSelected]: [],
        [GroupedActionDest.CurrentPlayerIndex]: [],
        [GroupedActionDest.SelectedPlayerIndex]: [],
      },
    };

    const result = prepareGroupedActionTriggers(mockGame, mockGroupedAction, 'test-id');

    expect(result).toEqual(mockGame);
    expect(result.pendingGroupedActions).toHaveLength(0);
  });

  it('should handle undefined triggers', () => {
    mockGroupedAction.triggers = undefined;

    const result = prepareGroupedActionTriggers(mockGame, mockGroupedAction, 'test-id');

    expect(result).toEqual(mockGame);
    expect(result.pendingGroupedActions).toHaveLength(0);
  });

  it('should handle invalid destination in triggers', () => {
    mockGroupedAction.triggers = {
      [GroupedActionTrigger.AfterNextTurnBegins]: {
        ['InvalidDest' as GroupedActionDest]: [{ action: GameLogAction.ADD_CARDS, count: 1 }],
        [GroupedActionDest.AllPlayers]: [],
        [GroupedActionDest.AllPlayersExceptCurrent]: [],
        [GroupedActionDest.AllPlayersExceptSelected]: [],
        [GroupedActionDest.CurrentPlayerIndex]: [],
        [GroupedActionDest.SelectedPlayerIndex]: [],
      },
    };

    expect(() => prepareGroupedActionTriggers(mockGame, mockGroupedAction, 'test-id')).toThrow(
      Error('Invalid GroupedActionDest: InvalidDest')
    );
  });
});
