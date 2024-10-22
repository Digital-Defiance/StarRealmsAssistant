import { CurrentStep } from '@/game/enumerations/current-step';
import { GameLogActionWithCount } from '@/game/enumerations/game-log-action-with-count';
import { IGameSupply } from '@/game/interfaces/game-supply';
import { IMatDetails } from '@/game/interfaces/mat-details';
import { IPlayerGameTurnDetails } from '@/game/interfaces/player-game-turn-details';
import { IVictoryDetails } from '@/game/interfaces/victory-details';
import { IMatsEnabled } from '@/game/interfaces/mats-enabled';
import { IGameOptions } from '@/game/interfaces/game-options';

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 6;
export const NO_PLAYER = -1;
export const NOT_PRESENT = -1;
// Base Set
export const ESTATE_COST = 2;
export const ESTATE_VP = 1;
export const DUCHY_COST = 5;
export const DUCHY_VP = 3;
export const PROVINCE_COST = 8;
export const PROVINCE_VP = 6;
export const CURSE_COST = 0;
export const CURSE_VP = -1;
export const COPPER_COST = 0;
export const COPPER_COUNT = 60;
export const COPPER_VALUE = 1;
export const SILVER_COST = 3;
export const SILVER_COUNT = 40;
export const SILVER_VALUE = 2;
export const GOLD_COST = 6;
export const GOLD_COUNT = 30;
export const GOLD_VALUE = 3;
export const HAND_STARTING_ESTATES = 3;
export const HAND_STARTING_COPPERS = 7;
// Prosperity Kingdom
export const PLATINUM_TOTAL_COUNT = 12;
export const PLATINUM_COST = 9;
export const PLATINUM_VALUE = 5;
export const COLONY_TOTAL_COUNT_2P = 8;
export const COLONY_TOTAL_COUNT = 12;
export const COLONY_COST = 11;
export const COLONY_VP = 10;

/**
 * Default (zero) values for the mats enabled.
 */
export const DefaultMatsEnabled: IMatsEnabled = {
  coffersVillagers: false,
  debt: false,
  favors: false,
};

/**
 * Default values for the game options.
 */
export const DefaultGameOptions: IGameOptions = {
  curses: false,
  expansions: {
    renaissance: false,
    prosperity: false,
    risingSun: false,
  },
  mats: DefaultMatsEnabled,
};

/**
 * Default (zero) values for the game supply.
 */
export const EmptyGameSupply: IGameSupply = {
  coppers: 0,
  silvers: 0,
  golds: 0,
  platinums: 0,
  estates: 0,
  duchies: 0,
  provinces: 0,
  colonies: 0,
  curses: 0,
};

/**
 * Default (zero) values for the mat details.
 */
export const EmptyMatDetails: IMatDetails = {
  villagers: 0,
  coffers: 0,
  debt: 0,
  favors: 0,
};

/**
 * Default (zero) values for the player game turn details.
 */
export const DefaultTurnDetails: IPlayerGameTurnDetails = {
  actions: 1,
  buys: 1,
  coins: 0,
};

/**
 * Default (zero) values for the victory details.
 */
export const EmptyVictoryDetails: IVictoryDetails = {
  tokens: 0,
  estates: 0,
  duchies: 0,
  provinces: 0,
  colonies: 0,
  other: 0,
  curses: 0,
};

/**
 * A list of actions that do not affect player state.
 */
export const NoPlayerActions = [
  GameLogActionWithCount.START_GAME,
  GameLogActionWithCount.END_GAME,
  GameLogActionWithCount.SAVE_GAME,
  GameLogActionWithCount.LOAD_GAME,
  GameLogActionWithCount.NEXT_TURN,
  GameLogActionWithCount.SELECT_PLAYER,
];

export const AdjustmentActions = [
  // turn actions
  GameLogActionWithCount.ADD_ACTIONS,
  GameLogActionWithCount.REMOVE_ACTIONS,
  GameLogActionWithCount.ADD_COINS,
  GameLogActionWithCount.REMOVE_COINS,
  GameLogActionWithCount.ADD_BUYS,
  GameLogActionWithCount.REMOVE_BUYS,
  // mats
  GameLogActionWithCount.ADD_COFFERS,
  GameLogActionWithCount.REMOVE_COFFERS,
  GameLogActionWithCount.ADD_VILLAGERS,
  GameLogActionWithCount.REMOVE_VILLAGERS,
  GameLogActionWithCount.ADD_DEBT,
  GameLogActionWithCount.REMOVE_DEBT,
  GameLogActionWithCount.ADD_FAVORS,
  GameLogActionWithCount.REMOVE_FAVORS,
  // global mats
  GameLogActionWithCount.ADD_PROPHECY,
  GameLogActionWithCount.REMOVE_PROPHECY,
  // victory points
  GameLogActionWithCount.ADD_ESTATES,
  GameLogActionWithCount.REMOVE_ESTATES,
  GameLogActionWithCount.ADD_DUCHIES,
  GameLogActionWithCount.REMOVE_DUCHIES,
  GameLogActionWithCount.ADD_PROVINCES,
  GameLogActionWithCount.REMOVE_PROVINCES,
  GameLogActionWithCount.ADD_COLONIES,
  GameLogActionWithCount.REMOVE_COLONIES,
  GameLogActionWithCount.ADD_VP_TOKENS,
  GameLogActionWithCount.REMOVE_VP_TOKENS,
  GameLogActionWithCount.ADD_OTHER_VP,
  GameLogActionWithCount.REMOVE_OTHER_VP,
  GameLogActionWithCount.ADD_CURSES,
  GameLogActionWithCount.REMOVE_CURSES,
  // next turn actions
  GameLogActionWithCount.ADD_NEXT_TURN_ACTIONS,
  GameLogActionWithCount.REMOVE_NEXT_TURN_ACTIONS,
  GameLogActionWithCount.ADD_NEXT_TURN_BUYS,
  GameLogActionWithCount.REMOVE_NEXT_TURN_BUYS,
  GameLogActionWithCount.ADD_NEXT_TURN_COINS,
  GameLogActionWithCount.REMOVE_NEXT_TURN_COINS,
];

export const StepTransitions: Record<CurrentStep, CurrentStep> = {
  [CurrentStep.AddPlayerNames]: CurrentStep.SelectFirstPlayer,
  [CurrentStep.SelectFirstPlayer]: CurrentStep.SetGameOptions,
  [CurrentStep.SetGameOptions]: CurrentStep.GameScreen,
  [CurrentStep.GameScreen]: CurrentStep.EndGame,
  [CurrentStep.EndGame]: CurrentStep.EndGame,
};

export const SaveGameStorageKey = '@dominion_saved_games';
export const SaveGameStorageKeyPrefix = '@dominion_game_';

export const DefaultPlayerColors = [
  '#e57373',
  '#64b5f6',
  '#81c784',
  '#ffd54f',
  '#ba68c8',
  '#4db6ac',
];
