import { createMockGame } from '@/__fixtures__/dominion-lib-fixtures';
import { IGame } from '@/game/interfaces/game';
import { IGroupedAction } from '@/game/interfaces/grouped-action';
import { GroupedActionDest } from '@/game/enumerations/grouped-action-dest';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import { ILogEntry } from '@/game/interfaces/log-entry';
import {
  applyGroupedAction,
  applyGroupedActionSubAction,
  getGameStartTime,
  prepareGroupedActionTriggers,
} from '@/game/dominion-lib-log';
import { RecipeKey, Recipes } from '@/components/Recipes';
import { GroupedActionTrigger } from '../enumerations/grouped-action-trigger';

function createGroupedActionBase(): IGroupedAction {
  return {
    name: 'Test Grouped Action',
    actions: {
      [GroupedActionDest.CurrentPlayerIndex]: [],
      [GroupedActionDest.AllPlayersExceptCurrent]: [],
      [GroupedActionDest.AllPlayersExceptSelected]: [],
      [GroupedActionDest.AllPlayers]: [],
      [GroupedActionDest.SelectedPlayerIndex]: [],
    },
  };
}

describe('applyGroupedAction', () => {
  let mockGame: IGame;
  let groupedAction: IGroupedAction;
  let consoleErrorSpy: jest.SpyInstance;
  let actionDate: Date;
  const applyGroupedActionSubActionMock: jest.Mock = jest
    .fn()
    .mockImplementation(
      (
        game: IGame,
        subAction: Partial<ILogEntry>,
        playerIndex: number,
        groupedActionId: string,
        actionDate: Date
      ): IGame =>
        applyGroupedActionSubAction(game, subAction, playerIndex, groupedActionId, actionDate)
    );
  const prepareGroupedActionTriggersMock: jest.Mock = jest
    .fn()
    .mockImplementation(
      (game: IGame, groupedAction: IGroupedAction, groupedActionId: string): IGame =>
        prepareGroupedActionTriggers(game, groupedAction, groupedActionId)
    );

  beforeEach(() => {
    jest.clearAllMocks();
    mockGame = createMockGame(4, {
      currentPlayerIndex: 0,
      selectedPlayerIndex: 0,
      firstPlayerIndex: 0,
    });
    groupedAction = createGroupedActionBase();

    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {
      // do nothing
    });
    actionDate = new Date(getGameStartTime(mockGame).getTime() + 10000);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should create a set of grouped action log entries and apply the actions appropriately', () => {
    groupedAction.actions[GroupedActionDest.CurrentPlayerIndex] = [
      { action: GameLogAction.ADD_ACTIONS, count: 2 },
    ];
    groupedAction.actions[GroupedActionDest.AllPlayersExceptCurrent] = [
      { action: GameLogAction.ADD_BUYS, count: 1 },
    ];
    const updatedGame = applyGroupedAction(
      mockGame,
      groupedAction,
      actionDate,
      applyGroupedActionSubActionMock,
      prepareGroupedActionTriggersMock
    );
    expect(applyGroupedActionSubActionMock).toHaveBeenCalledTimes(4);
    // this will generate 5 log entries, one for the grouped action itself and four for the individual actions
    expect(updatedGame.log.length).toBe(6); // plus one for the start of the game already in the log
    expect(updatedGame.log[1].action).toBe(GameLogAction.GROUPED_ACTION);
    expect(updatedGame.log[1].playerIndex).toBe(updatedGame.selectedPlayerIndex);
    expect(updatedGame.log[2].action).toBe(GameLogAction.ADD_ACTIONS);
    expect(updatedGame.log[2].playerIndex).toBe(updatedGame.currentPlayerIndex);
    expect(updatedGame.log[3].action).toBe(GameLogAction.ADD_BUYS);
    expect(updatedGame.log[3].playerIndex).toBe(1);
    expect(updatedGame.log[4].action).toBe(GameLogAction.ADD_BUYS);
    expect(updatedGame.log[4].playerIndex).toBe(2);
    expect(updatedGame.log[5].action).toBe(GameLogAction.ADD_BUYS);
    expect(updatedGame.log[5].playerIndex).toBe(3);
    const currentPlayer = updatedGame.players[updatedGame.currentPlayerIndex];
    expect(currentPlayer.turn.actions).toBe(3); // 1 + the added 2
    for (let i = 0; i < updatedGame.players.length; i++) {
      if (i !== updatedGame.currentPlayerIndex) {
        expect(updatedGame.players[i].turn.buys).toBe(2);
      } else {
        expect(updatedGame.players[i].turn.buys).toBe(1);
      }
    }
    expect(prepareGroupedActionTriggersMock).toHaveBeenCalledTimes(1);
    expect(updatedGame.pendingGroupedActions).toStrictEqual([]);
  });

  it('should handle actions for the selected player index', () => {
    groupedAction.actions[GroupedActionDest.SelectedPlayerIndex] = [
      { action: GameLogAction.ADD_COINS, count: 3 },
    ];

    const updatedGame = applyGroupedAction(
      mockGame,
      groupedAction,
      actionDate,
      applyGroupedActionSubActionMock,
      prepareGroupedActionTriggersMock
    );
    const selectedPlayer = updatedGame.players[updatedGame.selectedPlayerIndex];
    expect(selectedPlayer.turn.coins).toBe(3);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(applyGroupedActionSubActionMock).toHaveBeenCalledTimes(1);
    expect(updatedGame.log.length).toBe(3);
    expect(updatedGame.log[1].action).toBe(GameLogAction.GROUPED_ACTION);
    expect(updatedGame.log[2].action).toBe(GameLogAction.ADD_COINS);
    expect(prepareGroupedActionTriggersMock).toHaveBeenCalledTimes(1);
    expect(updatedGame.pendingGroupedActions).toStrictEqual([]);
  });

  it('should handle actions for all players', () => {
    groupedAction.actions[GroupedActionDest.AllPlayers] = [
      { action: GameLogAction.ADD_VILLAGERS, count: 1 },
    ];

    const updatedGame = applyGroupedAction(
      mockGame,
      groupedAction,
      actionDate,
      applyGroupedActionSubActionMock,
      prepareGroupedActionTriggersMock
    );
    updatedGame.players.forEach((player) => {
      expect(player.mats.villagers).toBe(1);
    });
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(applyGroupedActionSubActionMock).toHaveBeenCalledTimes(4);
    expect(updatedGame.log.length).toBe(6);
    expect(updatedGame.log[1].action).toBe(GameLogAction.GROUPED_ACTION);
    expect(updatedGame.log[2].action).toBe(GameLogAction.ADD_VILLAGERS);
    expect(updatedGame.log[3].action).toBe(GameLogAction.ADD_VILLAGERS);
    expect(updatedGame.log[4].action).toBe(GameLogAction.ADD_VILLAGERS);
    expect(updatedGame.log[5].action).toBe(GameLogAction.ADD_VILLAGERS);
    expect(prepareGroupedActionTriggersMock).toHaveBeenCalledTimes(1);
    expect(updatedGame.pendingGroupedActions).toStrictEqual([]);
  });

  it('should handle actions for all players except the selected player', () => {
    groupedAction.actions[GroupedActionDest.AllPlayersExceptSelected] = [
      { action: GameLogAction.ADD_COFFERS, count: 2 },
    ];

    const updatedGame = applyGroupedAction(
      mockGame,
      groupedAction,
      actionDate,
      applyGroupedActionSubActionMock,
      prepareGroupedActionTriggersMock
    );
    updatedGame.players.forEach((player, index) => {
      if (index !== updatedGame.selectedPlayerIndex) {
        expect(player.mats.coffers).toBe(2);
      } else {
        expect(player.mats.coffers).toBe(0);
      }
    });
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(applyGroupedActionSubActionMock).toHaveBeenCalledTimes(3);
    expect(updatedGame.log.length).toBe(5);
    expect(updatedGame.log[1].action).toBe(GameLogAction.GROUPED_ACTION);
    expect(updatedGame.log[2].action).toBe(GameLogAction.ADD_COFFERS);
    expect(updatedGame.log[3].action).toBe(GameLogAction.ADD_COFFERS);
    expect(updatedGame.log[4].action).toBe(GameLogAction.ADD_COFFERS);
    expect(prepareGroupedActionTriggersMock).toHaveBeenCalledTimes(1);
    expect(updatedGame.pendingGroupedActions).toStrictEqual([]);
  });

  it('should handle actions for all players except the current player', () => {
    groupedAction.actions[GroupedActionDest.AllPlayersExceptCurrent] = [
      { action: GameLogAction.ADD_VP_TOKENS, count: 1 },
    ];

    const updatedGame = applyGroupedAction(
      mockGame,
      groupedAction,
      actionDate,
      applyGroupedActionSubActionMock,
      prepareGroupedActionTriggersMock
    );
    updatedGame.players.forEach((player, index) => {
      if (index !== updatedGame.currentPlayerIndex) {
        expect(player.victory.tokens).toBe(1);
      } else {
        expect(player.victory.tokens).toBe(0);
      }
    });
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(applyGroupedActionSubActionMock).toHaveBeenCalledTimes(3);
    expect(updatedGame.log.length).toBe(5);
    expect(updatedGame.log[1].action).toBe(GameLogAction.GROUPED_ACTION);
    expect(updatedGame.log[2].action).toBe(GameLogAction.ADD_VP_TOKENS);
    expect(updatedGame.log[3].action).toBe(GameLogAction.ADD_VP_TOKENS);
    expect(updatedGame.log[4].action).toBe(GameLogAction.ADD_VP_TOKENS);
    expect(prepareGroupedActionTriggersMock).toHaveBeenCalledTimes(1);
    expect(updatedGame.pendingGroupedActions).toStrictEqual([]);
  });

  it('should handle multiple actions for the same destination', () => {
    groupedAction.actions[GroupedActionDest.CurrentPlayerIndex] = [
      { action: GameLogAction.ADD_ACTIONS, count: 2 },
      { action: GameLogAction.ADD_BUYS, count: 1 },
    ];

    const updatedGame = applyGroupedAction(
      mockGame,
      groupedAction,
      actionDate,
      applyGroupedActionSubActionMock,
      prepareGroupedActionTriggersMock
    );
    const currentPlayer = updatedGame.players[updatedGame.currentPlayerIndex];
    expect(currentPlayer.turn.actions).toBe(3); // 1 + the added 2
    expect(currentPlayer.turn.buys).toBe(2); // 1 + the added 1
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(applyGroupedActionSubActionMock).toHaveBeenCalledTimes(2);
    expect(updatedGame.log.length).toBe(4);
    expect(updatedGame.log[1].action).toBe(GameLogAction.GROUPED_ACTION);
    expect(updatedGame.log[2].action).toBe(GameLogAction.ADD_ACTIONS);
    expect(updatedGame.log[3].action).toBe(GameLogAction.ADD_BUYS);
    expect(prepareGroupedActionTriggersMock).toHaveBeenCalledTimes(1);
    expect(updatedGame.pendingGroupedActions).toStrictEqual([]);
  });

  it('should handle no actions gracefully', () => {
    const updatedGame = applyGroupedAction(
      mockGame,
      groupedAction,
      actionDate,
      applyGroupedActionSubActionMock,
      prepareGroupedActionTriggersMock
    );
    expect(updatedGame.log.length).toBe(2); // plus one for the start of the game already in the log
    expect(updatedGame.log[1].action).toBe(GameLogAction.GROUPED_ACTION);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(applyGroupedActionSubActionMock).not.toHaveBeenCalled();
    expect(prepareGroupedActionTriggersMock).toHaveBeenCalledTimes(1);
    expect(updatedGame.pendingGroupedActions).toStrictEqual([]);
  });

  it('should handle actions with no count specified', () => {
    groupedAction.actions[GroupedActionDest.CurrentPlayerIndex] = [
      { action: GameLogAction.ADD_ACTIONS },
    ];

    const updatedGame = applyGroupedAction(
      mockGame,
      groupedAction,
      actionDate,
      applyGroupedActionSubActionMock,
      prepareGroupedActionTriggersMock
    );
    const currentPlayer = updatedGame.players[updatedGame.currentPlayerIndex];
    expect(currentPlayer.turn.actions).toBe(2); // 1 + the default added 1
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(applyGroupedActionSubActionMock).toHaveBeenCalledTimes(1);
    expect(updatedGame.log.length).toBe(3);
    expect(updatedGame.log[1].action).toBe(GameLogAction.GROUPED_ACTION);
    expect(updatedGame.log[2].action).toBe(GameLogAction.ADD_ACTIONS);
    expect(prepareGroupedActionTriggersMock).toHaveBeenCalledTimes(1);
    expect(updatedGame.pendingGroupedActions).toStrictEqual([]);
  });

  it('should handle actions with negative counts', () => {
    groupedAction.actions[GroupedActionDest.CurrentPlayerIndex] = [
      { action: GameLogAction.ADD_ACTIONS, count: -1 },
    ];

    expect(() =>
      applyGroupedAction(
        mockGame,
        groupedAction,
        actionDate,
        applyGroupedActionSubActionMock,
        prepareGroupedActionTriggersMock
      )
    ).toThrow('Invalid log entry count: -1');
    expect(mockGame.log.length).toBe(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error applying grouped action:',
      Error('Invalid log entry count: -1')
    );
    expect(applyGroupedActionSubActionMock).not.toHaveBeenCalled();
    const currentPlayer = mockGame.players[mockGame.currentPlayerIndex];
    expect(currentPlayer.turn.actions).toBe(1); // unchanged
    expect(prepareGroupedActionTriggersMock).not.toHaveBeenCalled();
    expect(mockGame.pendingGroupedActions).toStrictEqual([]);
  });

  it('should handle empty actions for specific destinations', () => {
    groupedAction.actions[GroupedActionDest.AllPlayersExceptCurrent] = [
      { action: GameLogAction.ADD_BUYS, count: 1 },
    ];

    const updatedGame = applyGroupedAction(
      mockGame,
      groupedAction,
      actionDate,
      applyGroupedActionSubActionMock,
      prepareGroupedActionTriggersMock
    );
    expect(updatedGame.players[updatedGame.currentPlayerIndex].turn.buys).toBe(1); // Unchanged
    expect(updatedGame.players[(updatedGame.currentPlayerIndex + 1) % 4].turn.buys).toBe(2);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(applyGroupedActionSubActionMock).toHaveBeenCalledTimes(3);
    expect(updatedGame.log.length).toBe(5);
    expect(updatedGame.log[1].action).toBe(GameLogAction.GROUPED_ACTION);
    expect(updatedGame.log[2].action).toBe(GameLogAction.ADD_BUYS);
    expect(updatedGame.log[3].action).toBe(GameLogAction.ADD_BUYS);
    expect(updatedGame.log[4].action).toBe(GameLogAction.ADD_BUYS);
    expect(prepareGroupedActionTriggersMock).toHaveBeenCalledTimes(1);
    expect(updatedGame.pendingGroupedActions).toStrictEqual([]);
  });

  it('should handle actions with zero count', () => {
    groupedAction.actions[GroupedActionDest.CurrentPlayerIndex] = [
      { action: GameLogAction.ADD_ACTIONS, count: 0 },
    ];

    expect(() =>
      applyGroupedAction(
        mockGame,
        groupedAction,
        actionDate,
        applyGroupedActionSubActionMock,
        prepareGroupedActionTriggersMock
      )
    ).toThrow('Invalid log entry count: 0');
    expect(mockGame.players[mockGame.currentPlayerIndex].turn.actions).toBe(1); // Unchanged
    expect(mockGame.log.length).toBe(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error applying grouped action:',
      Error('Invalid log entry count: 0')
    );
    expect(applyGroupedActionSubActionMock).not.toHaveBeenCalled();
    expect(prepareGroupedActionTriggersMock).not.toHaveBeenCalled();
    expect(mockGame.pendingGroupedActions).toStrictEqual([]);
  });

  it('should handle actions for all players when current and selected players are the same', () => {
    mockGame.selectedPlayerIndex = mockGame.currentPlayerIndex;
    groupedAction.actions[GroupedActionDest.AllPlayers] = [
      { action: GameLogAction.ADD_COFFERS, count: 1 },
    ];
    groupedAction.actions[GroupedActionDest.AllPlayersExceptCurrent] = [
      { action: GameLogAction.ADD_VILLAGERS, count: 1 },
    ];
    groupedAction.actions[GroupedActionDest.AllPlayersExceptSelected] = [
      { action: GameLogAction.ADD_VP_TOKENS, count: 1 },
    ];

    const updatedGame = applyGroupedAction(
      mockGame,
      groupedAction,
      actionDate,
      applyGroupedActionSubActionMock,
      prepareGroupedActionTriggersMock
    );
    updatedGame.players.forEach((player, index) => {
      expect(player.mats.coffers).toBe(1);
      if (index === mockGame.currentPlayerIndex) {
        expect(player.mats.villagers).toBe(0);
        expect(player.victory.tokens).toBe(0);
      } else {
        expect(player.mats.villagers).toBe(1);
        expect(player.victory.tokens).toBe(1);
      }
    });
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(applyGroupedActionSubActionMock).toHaveBeenCalledTimes(10);
    expect(updatedGame.log.length).toBe(12);
    expect(updatedGame.log[1].action).toBe(GameLogAction.GROUPED_ACTION);
    // AllPlayersExceptCurrent
    expect(updatedGame.log[2].action).toBe(GameLogAction.ADD_VILLAGERS);
    expect(updatedGame.log[3].action).toBe(GameLogAction.ADD_VILLAGERS);
    expect(updatedGame.log[4].action).toBe(GameLogAction.ADD_VILLAGERS);
    // AllPlayersExceptSelected
    expect(updatedGame.log[5].action).toBe(GameLogAction.ADD_VP_TOKENS);
    expect(updatedGame.log[6].action).toBe(GameLogAction.ADD_VP_TOKENS);
    expect(updatedGame.log[7].action).toBe(GameLogAction.ADD_VP_TOKENS);
    // AllPlayers
    expect(updatedGame.log[8].action).toBe(GameLogAction.ADD_COFFERS);
    expect(updatedGame.log[9].action).toBe(GameLogAction.ADD_COFFERS);
    expect(updatedGame.log[10].action).toBe(GameLogAction.ADD_COFFERS);
    expect(updatedGame.log[11].action).toBe(GameLogAction.ADD_COFFERS);
    expect(prepareGroupedActionTriggersMock).toHaveBeenCalledTimes(1);
    expect(updatedGame.pendingGroupedActions).toStrictEqual([]);
  });

  it('should handle complex combinations of actions for different destinations', () => {
    groupedAction.actions[GroupedActionDest.CurrentPlayerIndex] = [
      { action: GameLogAction.ADD_ACTIONS, count: 2 },
      { action: GameLogAction.ADD_BUYS, count: 1 },
    ];
    groupedAction.actions[GroupedActionDest.AllPlayersExceptCurrent] = [
      { action: GameLogAction.ADD_COFFERS, count: 1 },
      { action: GameLogAction.ADD_VILLAGERS, count: 1 },
    ];
    groupedAction.actions[GroupedActionDest.AllPlayersExceptSelected] = [
      { action: GameLogAction.ADD_VP_TOKENS, count: 1 },
    ];
    groupedAction.actions[GroupedActionDest.AllPlayers] = [
      { action: GameLogAction.ADD_COINS, count: 2 },
    ];
    groupedAction.actions[GroupedActionDest.SelectedPlayerIndex] = [
      { action: GameLogAction.ADD_BUYS, count: 2 },
    ];

    const updatedGame = applyGroupedAction(
      mockGame,
      groupedAction,
      actionDate,
      applyGroupedActionSubActionMock,
      prepareGroupedActionTriggersMock
    );

    // Check current player
    const currentPlayer = updatedGame.players[updatedGame.currentPlayerIndex];
    expect(currentPlayer.turn.actions).toBe(3);
    expect(currentPlayer.turn.buys).toBe(4); // 1 default + 1 + 2
    expect(currentPlayer.turn.coins).toBe(2);
    expect(currentPlayer.mats.coffers).toBe(0);
    expect(currentPlayer.mats.villagers).toBe(0);
    expect(currentPlayer.victory.tokens).toBe(0);

    // Check selected player (if different from current)
    if (updatedGame.selectedPlayerIndex !== updatedGame.currentPlayerIndex) {
      const selectedPlayer = updatedGame.players[updatedGame.selectedPlayerIndex];
      expect(selectedPlayer.turn.buys).toBe(3);
      expect(selectedPlayer.turn.coins).toBe(2);
      expect(selectedPlayer.mats.coffers).toBe(1);
      expect(selectedPlayer.mats.villagers).toBe(1);
      expect(selectedPlayer.victory.tokens).toBe(0);
    }

    // Check other players
    updatedGame.players.forEach((player, index) => {
      if (index !== updatedGame.currentPlayerIndex && index !== updatedGame.selectedPlayerIndex) {
        expect(player.turn.coins).toBe(2);
        expect(player.mats.coffers).toBe(1);
        expect(player.mats.villagers).toBe(1);
        expect(player.victory.tokens).toBe(1);
      }
    });

    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(applyGroupedActionSubActionMock).toHaveBeenCalledTimes(16);
    expect(updatedGame.log.length).toBe(18);
    expect(updatedGame.log[1].action).toBe(GameLogAction.GROUPED_ACTION);
    expect(updatedGame.log[2].action).toBe(GameLogAction.ADD_ACTIONS);
    expect(updatedGame.log[3].action).toBe(GameLogAction.ADD_BUYS);
    expect(updatedGame.log[4].action).toBe(GameLogAction.ADD_COFFERS);
    expect(updatedGame.log[5].action).toBe(GameLogAction.ADD_VILLAGERS);
    expect(updatedGame.log[6].action).toBe(GameLogAction.ADD_COFFERS);
    expect(updatedGame.log[7].action).toBe(GameLogAction.ADD_VILLAGERS);
    expect(updatedGame.log[8].action).toBe(GameLogAction.ADD_COFFERS);
    expect(updatedGame.log[9].action).toBe(GameLogAction.ADD_VILLAGERS);
    expect(updatedGame.log[10].action).toBe(GameLogAction.ADD_VP_TOKENS);
    expect(updatedGame.log[11].action).toBe(GameLogAction.ADD_VP_TOKENS);
    expect(updatedGame.log[12].action).toBe(GameLogAction.ADD_VP_TOKENS);
    expect(updatedGame.log[13].action).toBe(GameLogAction.ADD_COINS);
    expect(updatedGame.log[14].action).toBe(GameLogAction.ADD_COINS);
    expect(updatedGame.log[15].action).toBe(GameLogAction.ADD_COINS);
    expect(updatedGame.log[16].action).toBe(GameLogAction.ADD_COINS);
    expect(updatedGame.log[17].action).toBe(GameLogAction.ADD_BUYS);
    expect(prepareGroupedActionTriggersMock).toHaveBeenCalledTimes(1);
    expect(updatedGame.pendingGroupedActions).toStrictEqual([]);
  });

  it('should handle actions with very large counts', () => {
    const largeCount = Number.MAX_SAFE_INTEGER;

    groupedAction.actions[GroupedActionDest.CurrentPlayerIndex] = [
      { action: GameLogAction.ADD_ACTIONS, count: largeCount },
    ];
    const updatedGame = applyGroupedAction(
      mockGame,
      groupedAction,
      actionDate,
      applyGroupedActionSubActionMock,
      prepareGroupedActionTriggersMock
    );
    const currentPlayer = updatedGame.players[updatedGame.currentPlayerIndex];
    expect(currentPlayer.turn.actions).toBe(largeCount + 1);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(updatedGame.log.length).toBe(3);
    expect(applyGroupedActionSubActionMock).toHaveBeenCalledTimes(1);
    expect(prepareGroupedActionTriggersMock).toHaveBeenCalledTimes(1);
    expect(updatedGame.pendingGroupedActions).toStrictEqual([]);
  });

  it('should handle actions with undefined count', () => {
    groupedAction.actions[GroupedActionDest.CurrentPlayerIndex] = [
      { action: GameLogAction.ADD_ACTIONS, count: undefined },
    ];
    const updatedGame = applyGroupedAction(
      mockGame,
      groupedAction,
      actionDate,
      applyGroupedActionSubActionMock,
      prepareGroupedActionTriggersMock
    );
    const currentPlayer = updatedGame.players[updatedGame.currentPlayerIndex];
    expect(currentPlayer.turn.actions).toBe(2); // Default to 1 if count is undefined
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(updatedGame.log.length).toBe(3);
    expect(applyGroupedActionSubActionMock).toHaveBeenCalledWith(
      {
        ...mockGame,
        log: [
          ...mockGame.log,
          {
            action: GameLogAction.GROUPED_ACTION,
            actionName: 'Test Grouped Action',
            currentPlayerIndex: mockGame.currentPlayerIndex,
            id: expect.any(String),
            playerIndex: mockGame.currentPlayerIndex,
            timestamp: actionDate,
            turn: mockGame.currentTurn,
          },
        ],
        timeCache: expect.any(Array),
      },
      {
        action: GameLogAction.ADD_ACTIONS,
        count: undefined,
        playerIndex: mockGame.currentPlayerIndex,
        turn: mockGame.currentTurn,
      },
      mockGame.currentPlayerIndex,
      expect.any(String),
      actionDate
    );
    expect(prepareGroupedActionTriggersMock).toHaveBeenCalledTimes(1);
    expect(updatedGame.pendingGroupedActions).toStrictEqual([]);
  });

  it('should throw an error if an invalid action is provided', () => {
    groupedAction.actions[GroupedActionDest.CurrentPlayerIndex] = [
      { action: 'INVALID_ACTION' as GameLogAction, count: 1 },
    ];
    expect(() =>
      applyGroupedAction(
        mockGame,
        groupedAction,
        actionDate,
        applyGroupedActionSubActionMock,
        prepareGroupedActionTriggersMock
      )
    ).toThrow('Invalid log entry action: INVALID_ACTION');
    expect(mockGame.log.length).toBe(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error applying grouped action:',
      Error('Invalid log entry action: INVALID_ACTION')
    );
    expect(applyGroupedActionSubActionMock).not.toHaveBeenCalled();
    expect(prepareGroupedActionTriggersMock).not.toHaveBeenCalled();
    expect(mockGame.pendingGroupedActions).toStrictEqual([]);
  });

  it('should maintain the correct order of actions in the game log', () => {
    groupedAction.actions[GroupedActionDest.CurrentPlayerIndex] = [
      { action: GameLogAction.ADD_ACTIONS, count: 1 },
    ];
    groupedAction.actions[GroupedActionDest.AllPlayers] = [
      { action: GameLogAction.ADD_BUYS, count: 1 },
    ];
    groupedAction.actions[GroupedActionDest.SelectedPlayerIndex] = [
      { action: GameLogAction.ADD_COINS, count: 1 },
    ];

    const updatedGame = applyGroupedAction(
      mockGame,
      groupedAction,
      actionDate,
      applyGroupedActionSubActionMock,
      prepareGroupedActionTriggersMock
    );
    expect(applyGroupedActionSubActionMock).toHaveBeenCalledTimes(6);
    expect(updatedGame.log.length).toBe(8);
    expect(updatedGame.log[1].action).toBe(GameLogAction.GROUPED_ACTION);
    expect(updatedGame.log[2].action).toBe(GameLogAction.ADD_ACTIONS);
    expect(updatedGame.log[3].action).toBe(GameLogAction.ADD_BUYS);
    expect(updatedGame.log[4].action).toBe(GameLogAction.ADD_BUYS);
    expect(updatedGame.log[5].action).toBe(GameLogAction.ADD_BUYS);
    expect(updatedGame.log[6].action).toBe(GameLogAction.ADD_BUYS);
    expect(updatedGame.log[7].action).toBe(GameLogAction.ADD_COINS);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(prepareGroupedActionTriggersMock).toHaveBeenCalledTimes(1);
    expect(updatedGame.pendingGroupedActions).toStrictEqual([]);
  });

  it('should throw an error for an invalid grouped action key', () => {
    const invalidGroupedActionKey = 'InvalidKey' as RecipeKey;
    expect(() => {
      applyGroupedAction(
        mockGame,
        groupedAction,
        actionDate,
        applyGroupedActionSubActionMock,
        prepareGroupedActionTriggersMock,
        invalidGroupedActionKey
      );
    }).toThrow(`Invalid recipe key: ${invalidGroupedActionKey}`);
  });

  it('should create a log with the actionKey if provided and valid', () => {
    groupedAction = Recipes.General.recipes.OneCardOneAction;
    const updatedGame = applyGroupedAction(
      mockGame,
      groupedAction,
      actionDate,
      applyGroupedActionSubActionMock,
      prepareGroupedActionTriggersMock,
      'OneCardOneAction' as RecipeKey
    );
    expect(updatedGame.log.length).toBe(5);
    expect(updatedGame.log[1].action).toBe(GameLogAction.GROUPED_ACTION);
    expect(updatedGame.log[1].actionKey).toBe('OneCardOneAction');
  });

  it('should throw an error if the grouped action name does not match the recipe for the key', () => {
    const invalidGroupedAction: IGroupedAction = {
      ...groupedAction,
      name: 'Invalid Grouped Action Name',
    };

    const validRecipeKey: RecipeKey = 'OneCardOneAction' as RecipeKey;

    // Ensure the valid recipe key exists in the Recipes
    Recipes.General.recipes[validRecipeKey] = groupedAction;

    expect(() =>
      applyGroupedAction(
        mockGame,
        invalidGroupedAction,
        actionDate,
        applyGroupedActionSubActionMock,
        prepareGroupedActionTriggersMock,
        validRecipeKey
      )
    ).toThrow(
      `Invalid grouped action. The passed in grouped action does not match the recipe for key '${validRecipeKey}'.`
    );

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error applying grouped action:',
      new Error(
        `Invalid grouped action. The passed in grouped action does not match the recipe for key '${validRecipeKey}'.`
      )
    );
  });

  it('should handle actions with count as a callback function', () => {
    mockGame.players[mockGame.currentPlayerIndex].mats.coffers = 2;
    groupedAction.actions[GroupedActionDest.CurrentPlayerIndex] = [
      {
        action: GameLogAction.ADD_COINS,
        count: (game: IGame, playerIndex: number) => game.players[playerIndex].mats.coffers + 1,
      },
    ];

    const updatedGame = applyGroupedAction(
      mockGame,
      groupedAction,
      actionDate,
      applyGroupedActionSubActionMock,
      prepareGroupedActionTriggersMock
    );

    const currentPlayer = updatedGame.players[updatedGame.currentPlayerIndex];
    expect(currentPlayer.turn.coins).toBe(3);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(applyGroupedActionSubActionMock).toHaveBeenCalledTimes(1);
    expect(updatedGame.log.length).toBe(3);
    expect(updatedGame.log[1].action).toBe(GameLogAction.GROUPED_ACTION);
    expect(updatedGame.log[2].action).toBe(GameLogAction.ADD_COINS);
    expect(updatedGame.log[2].count).toBe(3);
    expect(prepareGroupedActionTriggersMock).toHaveBeenCalledTimes(1);
    expect(updatedGame.pendingGroupedActions).toStrictEqual([]);
  });

  it('should handle actions with trigger action having count as a callback function', () => {
    mockGame.players[mockGame.currentPlayerIndex].mats.coffers = 2;
    groupedAction.actions[GroupedActionDest.CurrentPlayerIndex] = [
      {
        action: GameLogAction.ADD_COFFERS,
        count: 1,
      },
    ];
    groupedAction.triggers = {
      [GroupedActionTrigger.AfterNextTurnBegins]: {
        [GroupedActionDest.CurrentPlayerIndex]: [
          {
            action: GameLogAction.ADD_COINS,
            count: (game: IGame, playerIndex: number) => game.players[playerIndex].mats.coffers + 1,
          },
        ],
        [GroupedActionDest.SelectedPlayerIndex]: [],
        [GroupedActionDest.AllPlayers]: [],
        [GroupedActionDest.AllPlayersExceptCurrent]: [],
        [GroupedActionDest.AllPlayersExceptSelected]: [],
      },
    };

    const updatedGame = applyGroupedAction(
      mockGame,
      groupedAction,
      actionDate,
      applyGroupedActionSubActionMock,
      prepareGroupedActionTriggersMock
    );

    const currentPlayer = updatedGame.players[updatedGame.currentPlayerIndex];
    expect(currentPlayer.mats.coffers).toBe(3);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(applyGroupedActionSubActionMock).toHaveBeenCalledTimes(1);
    expect(updatedGame.log.length).toBe(3);
    expect(updatedGame.log[1].action).toBe(GameLogAction.GROUPED_ACTION);
    expect(updatedGame.log[2].action).toBe(GameLogAction.ADD_COFFERS);
    expect(updatedGame.log[2].count).toBe(1);
    expect(prepareGroupedActionTriggersMock).toHaveBeenCalledTimes(1);
    expect(updatedGame.pendingGroupedActions).toStrictEqual([
      expect.objectContaining({
        action: GameLogAction.ADD_COINS,
        count: expect.any(Function),
        playerIndex: updatedGame.currentPlayerIndex,
        turn: 5,
      }),
    ]);
  });
});

describe('applyGroupedAction with different current and selected players', () => {
  let mockGame: IGame;
  let groupedAction: IGroupedAction;
  let consoleErrorSpy: jest.SpyInstance;
  let actionDate: Date;
  const applyGroupedActionSubActionMock: jest.Mock = jest
    .fn()
    .mockImplementation(
      (
        game: IGame,
        subAction: Partial<ILogEntry>,
        playerIndex: number,
        groupedActionId: string,
        actionDate: Date
      ): IGame =>
        applyGroupedActionSubAction(game, subAction, playerIndex, groupedActionId, actionDate)
    );
  const prepareGroupedActionTriggersMock: jest.Mock = jest
    .fn()
    .mockImplementation(
      (game: IGame, groupedAction: IGroupedAction, groupedActionId: string): IGame =>
        prepareGroupedActionTriggers(game, groupedAction, groupedActionId)
    );

  beforeEach(() => {
    jest.clearAllMocks();
    mockGame = createMockGame(4);
    groupedAction = createGroupedActionBase();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {
      // do nothing
    });
    actionDate = new Date(getGameStartTime(mockGame).getTime() + 10000);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    jest.restoreAllMocks();
  });

  it('should handle actions when current player is last and selected player is first', () => {
    mockGame.currentPlayerIndex = 3;
    mockGame.selectedPlayerIndex = 0;
    groupedAction.actions = {
      [GroupedActionDest.CurrentPlayerIndex]: [
        { action: GameLogAction.ADD_ACTIONS, count: 2 },
        { action: GameLogAction.ADD_BUYS, count: 1 },
      ],
      [GroupedActionDest.AllPlayersExceptCurrent]: [
        { action: GameLogAction.ADD_COFFERS, count: 1 },
      ],
      [GroupedActionDest.AllPlayersExceptSelected]: [
        { action: GameLogAction.ADD_VP_TOKENS, count: 1 },
      ],
      [GroupedActionDest.AllPlayers]: [{ action: GameLogAction.ADD_COINS, count: 2 }],
      [GroupedActionDest.SelectedPlayerIndex]: [{ action: GameLogAction.ADD_BUYS, count: 2 }],
    };

    const updatedGame = applyGroupedAction(
      mockGame,
      groupedAction,
      actionDate,
      applyGroupedActionSubActionMock,
      prepareGroupedActionTriggersMock
    );

    // Check current player (last player)
    expect(updatedGame.players[3].turn.actions).toBe(3);
    expect(updatedGame.players[3].turn.buys).toBe(2);
    expect(updatedGame.players[3].turn.coins).toBe(2);
    expect(updatedGame.players[3].mats.coffers).toBe(0);
    expect(updatedGame.players[3].victory.tokens).toBe(1);

    // Check selected player (first player)
    expect(updatedGame.players[0].turn.buys).toBe(3);
    expect(updatedGame.players[0].turn.coins).toBe(2);
    expect(updatedGame.players[0].mats.coffers).toBe(1);
    expect(updatedGame.players[0].victory.tokens).toBe(0);

    // Check other players
    [1, 2].forEach((index) => {
      expect(updatedGame.players[index].turn.coins).toBe(2);
      expect(updatedGame.players[index].mats.coffers).toBe(1);
      expect(updatedGame.players[index].victory.tokens).toBe(1);
    });

    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(updatedGame.log.length).toBe(15); // 13 + start game + grouped action
    expect(applyGroupedActionSubActionMock).toHaveBeenCalledTimes(13);
    expect(prepareGroupedActionTriggersMock).toHaveBeenCalledTimes(1);
    expect(updatedGame.pendingGroupedActions).toStrictEqual([]);
  });

  it('should handle actions when current player is first and selected player is last', () => {
    mockGame.currentPlayerIndex = 0;
    mockGame.selectedPlayerIndex = 3;
    groupedAction.actions = {
      [GroupedActionDest.CurrentPlayerIndex]: [
        { action: GameLogAction.ADD_ACTIONS, count: 2 },
        { action: GameLogAction.ADD_BUYS, count: 1 },
      ],
      [GroupedActionDest.AllPlayersExceptCurrent]: [
        { action: GameLogAction.ADD_VILLAGERS, count: 1 },
      ],
      [GroupedActionDest.AllPlayersExceptSelected]: [
        { action: GameLogAction.ADD_VP_TOKENS, count: 1 },
      ],
      [GroupedActionDest.AllPlayers]: [{ action: GameLogAction.ADD_COINS, count: 2 }],
      [GroupedActionDest.SelectedPlayerIndex]: [{ action: GameLogAction.ADD_COFFERS, count: 2 }],
    };

    const updatedGame = applyGroupedAction(
      mockGame,
      groupedAction,
      actionDate,
      applyGroupedActionSubActionMock,
      prepareGroupedActionTriggersMock
    );

    expect(applyGroupedActionSubActionMock).toHaveBeenCalledTimes(13);
    expect(updatedGame.log.length).toBe(15);

    // Check current player (first player)
    expect(updatedGame.players[0].turn.actions).toBe(3);
    expect(updatedGame.players[0].turn.buys).toBe(2);
    expect(updatedGame.players[0].turn.coins).toBe(2);
    expect(updatedGame.players[0].mats.villagers).toBe(0);
    expect(updatedGame.players[0].victory.tokens).toBe(1);

    // Check selected player (last player)
    expect(updatedGame.players[3].turn.coins).toBe(2);
    expect(updatedGame.players[3].mats.villagers).toBe(1);
    expect(updatedGame.players[3].mats.coffers).toBe(2);
    expect(updatedGame.players[3].victory.tokens).toBe(0);

    // Check other players
    [1, 2].forEach((index) => {
      expect(updatedGame.players[index].turn.coins).toBe(2);
      expect(updatedGame.players[index].mats.villagers).toBe(1);
      expect(updatedGame.players[index].victory.tokens).toBe(1);
    });

    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(updatedGame.log[1].action).toBe(GameLogAction.GROUPED_ACTION);
    expect(updatedGame.log[2].action).toBe(GameLogAction.ADD_ACTIONS);
    expect(updatedGame.log[3].action).toBe(GameLogAction.ADD_BUYS);
    expect(updatedGame.log[4].action).toBe(GameLogAction.ADD_VILLAGERS);
    expect(updatedGame.log[5].action).toBe(GameLogAction.ADD_VILLAGERS);
    expect(updatedGame.log[6].action).toBe(GameLogAction.ADD_VILLAGERS);
    expect(updatedGame.log[7].action).toBe(GameLogAction.ADD_VP_TOKENS);
    expect(updatedGame.log[8].action).toBe(GameLogAction.ADD_VP_TOKENS);
    expect(updatedGame.log[9].action).toBe(GameLogAction.ADD_VP_TOKENS);
    expect(updatedGame.log[10].action).toBe(GameLogAction.ADD_COINS);
    expect(updatedGame.log[11].action).toBe(GameLogAction.ADD_COINS);
    expect(updatedGame.log[12].action).toBe(GameLogAction.ADD_COINS);
    expect(updatedGame.log[13].action).toBe(GameLogAction.ADD_COINS);
    expect(updatedGame.log[14].action).toBe(GameLogAction.ADD_COFFERS);
    expect(prepareGroupedActionTriggersMock).toHaveBeenCalledTimes(1);
    expect(updatedGame.pendingGroupedActions).toStrictEqual([]);
  });

  it('should handle actions when current player and selected player are adjacent', () => {
    mockGame.currentPlayerIndex = 1;
    mockGame.selectedPlayerIndex = 2;
    groupedAction.actions = {
      [GroupedActionDest.CurrentPlayerIndex]: [
        { action: GameLogAction.ADD_ACTIONS, count: 2 },
        { action: GameLogAction.ADD_BUYS, count: 1 },
      ],
      [GroupedActionDest.AllPlayersExceptCurrent]: [{ action: GameLogAction.ADD_DEBT, count: 1 }],
      [GroupedActionDest.AllPlayersExceptSelected]: [
        { action: GameLogAction.ADD_FAVORS, count: 1 },
      ],
      [GroupedActionDest.AllPlayers]: [{ action: GameLogAction.ADD_COINS, count: 2 }],
      [GroupedActionDest.SelectedPlayerIndex]: [{ action: GameLogAction.ADD_VP_TOKENS, count: 2 }],
    };

    const updatedGame = applyGroupedAction(
      mockGame,
      groupedAction,
      actionDate,
      applyGroupedActionSubActionMock,
      prepareGroupedActionTriggersMock
    );

    // Check current player
    expect(updatedGame.players[1].turn.actions).toBe(3);
    expect(updatedGame.players[1].turn.buys).toBe(2);
    expect(updatedGame.players[1].turn.coins).toBe(2);
    expect(updatedGame.players[1].mats.debt).toBe(0);
    expect(updatedGame.players[1].mats.favors).toBe(1);

    // Check selected player (adjacent to current)
    expect(updatedGame.players[2].turn.coins).toBe(2);
    expect(updatedGame.players[2].mats.debt).toBe(1);
    expect(updatedGame.players[2].mats.favors).toBe(0);
    expect(updatedGame.players[2].victory.tokens).toBe(2);

    // Check other players
    [0, 3].forEach((index) => {
      expect(updatedGame.players[index].turn.coins).toBe(2);
      expect(updatedGame.players[index].mats.debt).toBe(1);
      expect(updatedGame.players[index].mats.favors).toBe(1);
      expect(updatedGame.players[index].victory.tokens).toBe(0);
    });

    expect(consoleErrorSpy).not.toHaveBeenCalled();
    expect(updatedGame.log.length).toBe(15);
    expect(applyGroupedActionSubActionMock).toHaveBeenCalledTimes(13);
    expect(updatedGame.log[1].action).toBe(GameLogAction.GROUPED_ACTION);
    expect(updatedGame.log[2].action).toBe(GameLogAction.ADD_ACTIONS);
    expect(updatedGame.log[3].action).toBe(GameLogAction.ADD_BUYS);
    expect(updatedGame.log[4].action).toBe(GameLogAction.ADD_DEBT);
    expect(updatedGame.log[5].action).toBe(GameLogAction.ADD_DEBT);
    expect(updatedGame.log[6].action).toBe(GameLogAction.ADD_DEBT);
    expect(updatedGame.log[7].action).toBe(GameLogAction.ADD_FAVORS);
    expect(updatedGame.log[8].action).toBe(GameLogAction.ADD_FAVORS);
    expect(updatedGame.log[9].action).toBe(GameLogAction.ADD_FAVORS);
    expect(updatedGame.log[10].action).toBe(GameLogAction.ADD_COINS);
    expect(updatedGame.log[11].action).toBe(GameLogAction.ADD_COINS);
    expect(updatedGame.log[12].action).toBe(GameLogAction.ADD_COINS);
    expect(updatedGame.log[13].action).toBe(GameLogAction.ADD_COINS);
    expect(updatedGame.log[14].action).toBe(GameLogAction.ADD_VP_TOKENS);
    expect(prepareGroupedActionTriggersMock).toHaveBeenCalledTimes(1);
    expect(updatedGame.pendingGroupedActions).toStrictEqual([]);
  });

  it('should not change the game if an error is thrown', () => {
    const mockGame = createMockGame(4);
    const actionDate = new Date(getGameStartTime(mockGame).getTime() + 10000);
    mockGame.players[mockGame.currentPlayerIndex].turn.actions = 0;
    expect(() =>
      applyGroupedAction(
        mockGame,
        {
          name: 'One Card, Two Actions',
          actions: {
            [GroupedActionDest.CurrentPlayerIndex]: [
              {
                action: GameLogAction.REMOVE_ACTIONS,
                count: 1,
              },
              {
                action: GameLogAction.ADD_CARDS,
                count: 1,
              },
              {
                action: GameLogAction.ADD_ACTIONS,
                count: 2,
              },
            ],
            [GroupedActionDest.SelectedPlayerIndex]: [],
            [GroupedActionDest.AllPlayers]: [],
            [GroupedActionDest.AllPlayersExceptCurrent]: [],
            [GroupedActionDest.AllPlayersExceptSelected]: [],
          },
        },
        actionDate,
        applyGroupedActionSubAction,
        prepareGroupedActionTriggers
      )
    ).toThrow('Not enough actions in turn field');
    expect(mockGame.log.length).toBe(1);
  });
});
