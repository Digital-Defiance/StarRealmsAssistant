import { GameLogAction } from '@/game/enumerations/game-log-action';
import { IGroupedAction } from '@/game/interfaces/grouped-action';
import { GroupedActionDest } from '@/game/enumerations/grouped-action-dest';
import { GroupedActionTrigger } from '@/game/enumerations/grouped-action-trigger';

export const Recipes: Record<string, IGroupedAction> = {
  OneCardTwoActions: {
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
  Dominate: {
    name: 'Dominate',
    actions: {
      [GroupedActionDest.CurrentPlayerIndex]: [
        {
          action: GameLogAction.REMOVE_BUYS,
          count: 1,
        },
        {
          action: GameLogAction.ADD_PROVINCES,
          count: 1,
        },
        {
          action: GameLogAction.ADD_VP_TOKENS,
          count: 9,
        },
      ],
      [GroupedActionDest.SelectedPlayerIndex]: [],
      [GroupedActionDest.AllPlayers]: [],
      [GroupedActionDest.AllPlayersExceptCurrent]: [],
      [GroupedActionDest.AllPlayersExceptSelected]: [],
    },
  },
  CouncilRoom: {
    name: 'Council Room',
    actions: {
      [GroupedActionDest.CurrentPlayerIndex]: [
        {
          action: GameLogAction.REMOVE_ACTIONS,
          count: 1,
        },
        {
          action: GameLogAction.ADD_CARDS,
          count: 4,
        },
        {
          action: GameLogAction.ADD_BUYS,
          count: 1,
        },
      ],
      [GroupedActionDest.SelectedPlayerIndex]: [],
      [GroupedActionDest.AllPlayers]: [],
      [GroupedActionDest.AllPlayersExceptCurrent]: [
        {
          action: GameLogAction.ADD_NEXT_TURN_CARDS,
          count: 1,
        },
      ],
      [GroupedActionDest.AllPlayersExceptSelected]: [],
    },
    triggers: {
      [GroupedActionTrigger.AfterNextTurnBegins]: {
        [GroupedActionDest.AllPlayersExceptCurrent]: [
          {
            action: GameLogAction.REMOVE_NEXT_TURN_CARDS,
            count: 1,
          },
        ],
        [GroupedActionDest.AllPlayersExceptSelected]: [],
        [GroupedActionDest.CurrentPlayerIndex]: [],
        [GroupedActionDest.SelectedPlayerIndex]: [],
        [GroupedActionDest.AllPlayers]: [],
      },
    },
  },
};
