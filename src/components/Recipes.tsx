import React from 'react';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import { IGroupedAction } from '@/game/interfaces/grouped-action';
import { GroupedActionDest } from '@/game/enumerations/grouped-action-dest';
import { GroupedActionTrigger } from '@/game/enumerations/grouped-action-trigger';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faStore,
  faFlask,
  faHome,
  faHammer,
  faGlassCheers,
  faShoppingCart,
  faMonument,
  faCoins,
  faUserFriends,
  faShoppingBag,
  faTasks,
  faCrown,
  faHandshake,
  faLandmark,
  faChessBishop,
  faFishingRod,
  faCactus,
  faShip,
  faGear,
  faCastle,
  faSailboat,
  faGem,
  faWreathLaurel,
  faPaw,
  faPaintBrush,
} from '@fortawesome/pro-solid-svg-icons';
import { RecipeSection } from '@/game/interfaces/recipe-section';

export type RecipeSections =
  | 'General'
  | 'Base'
  | 'Seaside'
  | 'Prosperity'
  | 'Empires'
  | 'Menagerie'
  | 'CornucopiaGuilds'
  | 'Renaissance';

export const Recipes: Record<RecipeSections, RecipeSection> = {
  General: {
    title: 'General',
    icon: <FontAwesomeIcon icon={faGear} />,
    recipes: {
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
        icon: <FontAwesomeIcon icon={faHome} />,
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
        icon: <FontAwesomeIcon icon={faShoppingBag} />,
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
        icon: <FontAwesomeIcon icon={faTasks} />,
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
    },
  },
  Base: {
    title: 'Dominion Base',
    icon: <FontAwesomeIcon icon={faCastle} />,
    recipes: {
      Festival: {
        name: 'Festival',
        icon: <FontAwesomeIcon icon={faGlassCheers} />,
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
        icon: <FontAwesomeIcon icon={faFlask} />,
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
        icon: <FontAwesomeIcon icon={faHammer} />,
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
        icon: <FontAwesomeIcon icon={faUserFriends} />,
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
        icon: <FontAwesomeIcon icon={faShoppingCart} />,
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
    },
  },
  Seaside: {
    title: 'Seaside',
    icon: <FontAwesomeIcon icon={faSailboat} />,
    recipes: {
      FishingVillage: {
        name: 'Fishing Village',
        icon: <FontAwesomeIcon icon={faFishingRod} />,
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
              action: GameLogAction.ADD_COINS,
              count: 1,
            },
          ],
          [GroupedActionDest.SelectedPlayerIndex]: [],
          [GroupedActionDest.AllPlayers]: [],
          [GroupedActionDest.AllPlayersExceptCurrent]: [],
          [GroupedActionDest.AllPlayersExceptSelected]: [],
        },
        triggers: {
          [GroupedActionTrigger.AfterNextTurnBegins]: {
            [GroupedActionDest.CurrentPlayerIndex]: [
              {
                action: GameLogAction.ADD_ACTIONS,
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
      },
      Caravan: {
        name: 'Caravan',
        icon: <FontAwesomeIcon icon={faCactus} />,
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
        triggers: {
          [GroupedActionTrigger.AfterNextTurnBegins]: {
            [GroupedActionDest.CurrentPlayerIndex]: [
              {
                action: GameLogAction.ADD_CARDS,
                count: 1,
              },
            ],
            [GroupedActionDest.AllPlayers]: [],
            [GroupedActionDest.AllPlayersExceptCurrent]: [],
            [GroupedActionDest.AllPlayersExceptSelected]: [],
            [GroupedActionDest.SelectedPlayerIndex]: [],
          },
        },
      },
      Wharf: {
        name: 'Wharf',
        icon: <FontAwesomeIcon icon={faShip} />,
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
              action: GameLogAction.ADD_BUYS,
              count: 1,
            },
          ],
          [GroupedActionDest.SelectedPlayerIndex]: [],
          [GroupedActionDest.AllPlayers]: [],
          [GroupedActionDest.AllPlayersExceptCurrent]: [],
          [GroupedActionDest.AllPlayersExceptSelected]: [],
        },
        triggers: {
          [GroupedActionTrigger.AfterNextTurnBegins]: {
            [GroupedActionDest.CurrentPlayerIndex]: [
              {
                action: GameLogAction.ADD_CARDS,
                count: 2,
              },
              {
                action: GameLogAction.ADD_BUYS,
                count: 1,
              },
            ],
            [GroupedActionDest.AllPlayers]: [],
            [GroupedActionDest.AllPlayersExceptCurrent]: [],
            [GroupedActionDest.AllPlayersExceptSelected]: [],
            [GroupedActionDest.SelectedPlayerIndex]: [],
          },
        },
      },
    },
  },
  Prosperity: {
    title: 'Prosperity',
    icon: <FontAwesomeIcon icon={faGem} />,
    recipes: {
      GrandMarket: {
        name: 'Grand Market',
        icon: <FontAwesomeIcon icon={faStore} />,
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
      BishopEstate: {
        name: 'Bishop an Estate',
        icon: <FontAwesomeIcon icon={faChessBishop} />,
        actions: {
          [GroupedActionDest.CurrentPlayerIndex]: [
            {
              action: GameLogAction.REMOVE_ACTIONS,
              count: 1,
            },
            {
              action: GameLogAction.ADD_COINS,
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
        icon: <FontAwesomeIcon icon={faMonument} />,
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
    },
  },
  Empires: {
    title: 'Empires',
    icon: <FontAwesomeIcon icon={faWreathLaurel} />,
    recipes: {
      Dominate: {
        name: 'Dominate',
        icon: <FontAwesomeIcon icon={faCrown} />,
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
    },
  },
  Menagerie: {
    title: 'Menagerie',
    icon: <FontAwesomeIcon icon={faPaw} />,
    recipes: {
      Alliance: {
        name: 'Alliance',
        icon: <FontAwesomeIcon icon={faHandshake} />,
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
    },
  },
  CornucopiaGuilds: {
    title: 'Cornucopia & Guilds',
    icon: <FontAwesomeIcon icon={faHammer} />,
    recipes: {
      Demesne: {
        name: 'Demesne',
        icon: <FontAwesomeIcon icon={faLandmark} />,
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
    },
  },
  Renaissance: {
    title: 'Renaissance',
    icon: <FontAwesomeIcon icon={faPaintBrush} />,
    recipes: {
      Ducat: {
        name: 'Ducat',
        icon: <FontAwesomeIcon icon={faCoins} />,
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
    },
  },
};

type RecipeKeysFromSection<T> = T extends { actions: Record<infer K, IGroupedAction> } ? K : never;
export type RecipeKey = RecipeKeysFromSection<(typeof Recipes)[keyof typeof Recipes]>;
