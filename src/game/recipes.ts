import { GameLogAction } from '@/game/enumerations/game-log-action';
import { IGroupedAction } from '@/game/interfaces/grouped-action';
import { GroupedActionDest } from '@/game/enumerations/grouped-action-dest';
import { GroupedActionTrigger } from '@/game/enumerations/grouped-action-trigger';

export const Recipes: Record<string, IGroupedAction> = {
  OneCardOneAction: {
    name: 'One Card, One Action',
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
          count: 1,
        },
      ],
      [GroupedActionDest.SelectedPlayerIndex]: [],
      [GroupedActionDest.AllPlayers]: [],
      [GroupedActionDest.AllPlayersExceptCurrent]: [],
      [GroupedActionDest.AllPlayersExceptSelected]: [],
    },
  },
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
  OneCardTwoActionsOneBuy: {
    name: 'One Card, Two Actions, One Buy',
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
        {
          action: GameLogAction.ADD_BUYS,
          count: 1,
        },
      ],
      [GroupedActionDest.SelectedPlayerIndex]: [],
      [GroupedActionDest.AllPlayers]: [],
      [GroupedActionDest.AllPlayersExceptCurrent]: [],
      [GroupedActionDest.AllPlayersExceptSelected]: [],
    },
  },
  OneCardThreeActions: {
    name: 'One Card, Three Actions',
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
          count: 3,
        },
      ],
      [GroupedActionDest.SelectedPlayerIndex]: [],
      [GroupedActionDest.AllPlayers]: [],
      [GroupedActionDest.AllPlayersExceptCurrent]: [],
      [GroupedActionDest.AllPlayersExceptSelected]: [],
    },
  },
  Festival: {
    name: 'Festival',
    actions: {
      [GroupedActionDest.CurrentPlayerIndex]: [
        {
          action: GameLogAction.REMOVE_ACTIONS,
          count: 1,
        },
        {
          action: GameLogAction.ADD_ACTIONS,
          count: 2,
        },
        {
          action: GameLogAction.ADD_BUYS,
          count: 1,
        },
        {
          action: GameLogAction.ADD_COINS,
          count: 2,
        },
      ],
      [GroupedActionDest.SelectedPlayerIndex]: [],
      [GroupedActionDest.AllPlayers]: [],
      [GroupedActionDest.AllPlayersExceptCurrent]: [],
      [GroupedActionDest.AllPlayersExceptSelected]: [],
    },
  },
  Laboratory: {
    name: 'Laboratory',
    actions: {
      [GroupedActionDest.CurrentPlayerIndex]: [
        {
          action: GameLogAction.REMOVE_ACTIONS,
          count: 1,
        },
        {
          action: GameLogAction.ADD_CARDS,
          count: 2,
        },
        {
          action: GameLogAction.ADD_ACTIONS,
          count: 1,
        },
      ],
      [GroupedActionDest.SelectedPlayerIndex]: [],
      [GroupedActionDest.AllPlayers]: [],
      [GroupedActionDest.AllPlayersExceptCurrent]: [],
      [GroupedActionDest.AllPlayersExceptSelected]: [],
    },
  },
  Smithy: {
    name: 'Smithy',
    actions: {
      [GroupedActionDest.CurrentPlayerIndex]: [
        {
          action: GameLogAction.REMOVE_ACTIONS,
          count: 1,
        },
        {
          action: GameLogAction.ADD_CARDS,
          count: 3,
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
  Market: {
    name: 'Market',
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
          count: 1,
        },
        {
          action: GameLogAction.ADD_BUYS,
          count: 1,
        },
        {
          action: GameLogAction.ADD_COINS,
          count: 1,
        },
      ],
      [GroupedActionDest.SelectedPlayerIndex]: [],
      [GroupedActionDest.AllPlayers]: [],
      [GroupedActionDest.AllPlayersExceptCurrent]: [],
      [GroupedActionDest.AllPlayersExceptSelected]: [],
    },
  },
  GrandMarket: {
    name: 'Grand Market',
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
          count: 1,
        },
        {
          action: GameLogAction.ADD_BUYS,
          count: 1,
        },
        {
          action: GameLogAction.ADD_COINS,
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
  Alliance: {
    name: 'Alliance',
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
          action: GameLogAction.ADD_DUCHIES,
          count: 1,
        },
        {
          action: GameLogAction.ADD_ESTATES,
          count: 1,
        },
      ],
      [GroupedActionDest.SelectedPlayerIndex]: [],
      [GroupedActionDest.AllPlayers]: [],
      [GroupedActionDest.AllPlayersExceptCurrent]: [],
      [GroupedActionDest.AllPlayersExceptSelected]: [],
    },
  },
  Demesne: {
    name: 'Demesne',
    actions: {
      [GroupedActionDest.CurrentPlayerIndex]: [
        {
          action: GameLogAction.REMOVE_ACTIONS,
          count: 1,
        },
        {
          action: GameLogAction.ADD_ACTIONS,
          count: 2,
        },
        {
          action: GameLogAction.ADD_BUYS,
          count: 2,
        },
      ],
      [GroupedActionDest.SelectedPlayerIndex]: [],
      [GroupedActionDest.AllPlayers]: [],
      [GroupedActionDest.AllPlayersExceptCurrent]: [],
      [GroupedActionDest.AllPlayersExceptSelected]: [],
    },
  },
  BishopEstate: {
    name: 'Bishop an Estate',
    actions: {
      [GroupedActionDest.CurrentPlayerIndex]: [
        {
          action: GameLogAction.REMOVE_ACTIONS,
          count: 1,
        },
        {
          action: GameLogAction.REMOVE_ESTATES,
          count: 1,
          trash: true,
        },
        {
          action: GameLogAction.ADD_VP_TOKENS,
          count: 2,
        },
      ],
      [GroupedActionDest.SelectedPlayerIndex]: [],
      [GroupedActionDest.AllPlayers]: [],
      [GroupedActionDest.AllPlayersExceptCurrent]: [],
      [GroupedActionDest.AllPlayersExceptSelected]: [],
    },
  },
  Monument: {
    name: 'Monument',
    actions: {
      [GroupedActionDest.CurrentPlayerIndex]: [
        {
          action: GameLogAction.REMOVE_ACTIONS,
          count: 1,
        },
        {
          action: GameLogAction.ADD_COINS,
          count: 2,
        },
        {
          action: GameLogAction.ADD_VP_TOKENS,
          count: 1,
        },
      ],
      [GroupedActionDest.SelectedPlayerIndex]: [],
      [GroupedActionDest.AllPlayers]: [],
      [GroupedActionDest.AllPlayersExceptCurrent]: [],
      [GroupedActionDest.AllPlayersExceptSelected]: [],
    },
  },
  Ducat: {
    name: 'Ducat',
    actions: {
      [GroupedActionDest.CurrentPlayerIndex]: [
        {
          action: GameLogAction.ADD_COFFERS,
          count: 1,
        },
        {
          action: GameLogAction.ADD_BUYS,
          count: 1,
        },
      ],
      [GroupedActionDest.SelectedPlayerIndex]: [],
      [GroupedActionDest.AllPlayers]: [],
      [GroupedActionDest.AllPlayersExceptCurrent]: [],
      [GroupedActionDest.AllPlayersExceptSelected]: [],
    },
  },
};
