import { CurrentStep } from '@/game/enumerations/current-step';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import { IGameSupply } from '@/game/interfaces/game-supply';
import { IMatDetails } from '@/game/interfaces/mat-details';
import { IPlayerGameTurnDetails } from '@/game/interfaces/player-game-turn-details';
import { IVictoryDetails } from '@/game/interfaces/victory-details';
import { IMatsEnabled } from '@/game/interfaces/mats-enabled';
import { IGameOptions } from '@/game/interfaces/game-options';
import { deepClone } from '@/game/utils';
import { IGame } from '@/game/interfaces/game';

export const VERSION_NUMBER = '0.7.0';

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
export function DefaultMatsEnabled(): IMatsEnabled {
  return deepClone<IMatsEnabled>({
    coffersVillagers: false,
    debt: false,
    favors: false,
  });
}

/**
 * Default values for the game options.
 */
export function DefaultGameOptions(): IGameOptions {
  return deepClone<IGameOptions>({
    curses: false,
    expansions: {
      renaissance: false,
      prosperity: false,
      risingSun: false,
    },
    mats: DefaultMatsEnabled(),
  });
}

/**
 * Default (zero) values for the game supply.
 */
export function EmptyGameSupply(): IGameSupply {
  return deepClone<IGameSupply>({
    coppers: 0,
    silvers: 0,
    golds: 0,
    platinums: 0,
    estates: 0,
    duchies: 0,
    provinces: 0,
    colonies: 0,
    curses: 0,
  });
}

/**
 * Default (zero) values for the mat details.
 */
export function EmptyMatDetails(): IMatDetails {
  return deepClone<IMatDetails>({
    villagers: 0,
    coffers: 0,
    debt: 0,
    favors: 0,
  });
}

/**
 * Default (zero) values for the player game turn details.
 */
export function DefaultTurnDetails(): IPlayerGameTurnDetails {
  return deepClone<IPlayerGameTurnDetails>({
    actions: 1,
    buys: 1,
    coins: 0,
    cards: 5,
    gains: 0,
  });
}

/**
 * Default (zero) values for the victory details.
 */
export function EmptyVictoryDetails(): IVictoryDetails {
  return deepClone<IVictoryDetails>({
    tokens: 0,
    estates: 0,
    duchies: 0,
    provinces: 0,
    colonies: 0,
    other: 0,
    curses: 0,
  });
}

/**
 * A basic game state with no players or options.
 */
export function EmptyGameState(): IGame {
  return deepClone<IGame>({
    currentStep: 1,
    players: [],
    setsRequired: 1,
    supply: EmptyGameSupply(),
    options: {
      curses: true,
      expansions: { prosperity: false, renaissance: false, risingSun: false },
      mats: {
        coffersVillagers: false,
        debt: false,
        favors: false,
      },
    },
    currentTurn: 1,
    risingSun: {
      prophecy: { suns: NOT_PRESENT },
      greatLeaderProphecy: false,
    },
    currentPlayerIndex: NO_PLAYER,
    firstPlayerIndex: NO_PLAYER,
    selectedPlayerIndex: NO_PLAYER,
    log: [],
    timeCache: [],
  });
}

/**
 * A list of actions that do not affect player state.
 */
export const NoPlayerActions = [
  GameLogAction.END_GAME,
  GameLogAction.SAVE_GAME,
  GameLogAction.LOAD_GAME,
  GameLogAction.PAUSE,
  GameLogAction.UNPAUSE,
];

export const AdjustmentActions = [
  // turn actions
  GameLogAction.ADD_ACTIONS,
  GameLogAction.REMOVE_ACTIONS,
  GameLogAction.ADD_COINS,
  GameLogAction.REMOVE_COINS,
  GameLogAction.ADD_BUYS,
  GameLogAction.REMOVE_BUYS,
  GameLogAction.ADD_CARDS,
  GameLogAction.REMOVE_CARDS,
  GameLogAction.ADD_GAINS,
  GameLogAction.REMOVE_GAINS,
  // mats
  GameLogAction.ADD_COFFERS,
  GameLogAction.REMOVE_COFFERS,
  GameLogAction.ADD_VILLAGERS,
  GameLogAction.REMOVE_VILLAGERS,
  GameLogAction.ADD_DEBT,
  GameLogAction.REMOVE_DEBT,
  GameLogAction.ADD_FAVORS,
  GameLogAction.REMOVE_FAVORS,
  // global mats
  GameLogAction.ADD_PROPHECY,
  GameLogAction.REMOVE_PROPHECY,
  // victory points
  GameLogAction.ADD_ESTATES,
  GameLogAction.REMOVE_ESTATES,
  GameLogAction.ADD_DUCHIES,
  GameLogAction.REMOVE_DUCHIES,
  GameLogAction.ADD_PROVINCES,
  GameLogAction.REMOVE_PROVINCES,
  GameLogAction.ADD_COLONIES,
  GameLogAction.REMOVE_COLONIES,
  GameLogAction.ADD_VP_TOKENS,
  GameLogAction.REMOVE_VP_TOKENS,
  GameLogAction.ADD_OTHER_VP,
  GameLogAction.REMOVE_OTHER_VP,
  GameLogAction.ADD_CURSES,
  GameLogAction.REMOVE_CURSES,
  // next turn actions
  GameLogAction.ADD_NEXT_TURN_ACTIONS,
  GameLogAction.REMOVE_NEXT_TURN_ACTIONS,
  GameLogAction.ADD_NEXT_TURN_BUYS,
  GameLogAction.REMOVE_NEXT_TURN_BUYS,
  GameLogAction.ADD_NEXT_TURN_COINS,
  GameLogAction.REMOVE_NEXT_TURN_COINS,
  GameLogAction.ADD_NEXT_TURN_CARDS,
  GameLogAction.REMOVE_NEXT_TURN_CARDS,
];

export const NegativeAdjustmentActions = [
  // turn actions
  GameLogAction.REMOVE_ACTIONS,
  GameLogAction.REMOVE_COINS,
  GameLogAction.REMOVE_BUYS,
  GameLogAction.REMOVE_CARDS,
  GameLogAction.REMOVE_GAINS,
  // mats
  GameLogAction.REMOVE_COFFERS,
  GameLogAction.REMOVE_VILLAGERS,
  GameLogAction.REMOVE_DEBT,
  GameLogAction.REMOVE_FAVORS,
  // global mats
  GameLogAction.REMOVE_PROPHECY,
  // victory points
  GameLogAction.REMOVE_ESTATES,
  GameLogAction.REMOVE_DUCHIES,
  GameLogAction.REMOVE_PROVINCES,
  GameLogAction.REMOVE_COLONIES,
  GameLogAction.REMOVE_VP_TOKENS,
  GameLogAction.REMOVE_OTHER_VP,
  GameLogAction.REMOVE_CURSES,
  // next turn actions
  GameLogAction.REMOVE_NEXT_TURN_ACTIONS,
  GameLogAction.REMOVE_NEXT_TURN_BUYS,
  GameLogAction.REMOVE_NEXT_TURN_COINS,
  GameLogAction.REMOVE_NEXT_TURN_CARDS,
];

/**
 * Actions that have an associated player index. Others are expected to have NO_PLAYER (-1).
 */
export const ActionsWithPlayer = [
  ...AdjustmentActions,
  GameLogAction.START_GAME,
  GameLogAction.NEXT_TURN,
  GameLogAction.SELECT_PLAYER,
];

/**
 * Actions that can only be undone if they are the last action in the game log.
 */
export const ActionsWithOnlyLastActionUndo = [GameLogAction.SELECT_PLAYER, GameLogAction.NEXT_TURN];

/**
 * Actions that cannot be undone.
 */
export const NoUndoActions = [...NoPlayerActions, GameLogAction.START_GAME];

export const StepTransitions: Record<CurrentStep, CurrentStep> = {
  [CurrentStep.AddPlayerNames]: CurrentStep.SelectFirstPlayer,
  [CurrentStep.SelectFirstPlayer]: CurrentStep.SetGameOptions,
  [CurrentStep.SetGameOptions]: CurrentStep.GameScreen,
  [CurrentStep.GameScreen]: CurrentStep.EndGame,
  [CurrentStep.EndGame]: CurrentStep.EndGame,
};

export const SaveGameStorageKey = '@dominion_saved_games';
export const SaveGameStorageKeyPrefix = '@dominion_game_';
export const AutoSaveGameSaveName = 'AutoSave';
export const AutoSaveGameSaveId = 'autosave';

export const DefaultPlayerColors = [
  '#e57373',
  '#64b5f6',
  '#81c784',
  '#ffd54f',
  '#ba68c8',
  '#4db6ac',
];
