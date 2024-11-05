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
import { ISupplyInfo } from '@/game/interfaces/supply-info';
import { IRenaissanceFeatures } from '@/game/interfaces/set-features/renaissance';
import { IRisingSunFeatures } from '@/game/interfaces/set-features/rising-sun';
import { IExpansionsEnabled } from '@/game/interfaces/expansions-enabled';
import { calculateInitialSunTokens } from '@/game/interfaces/set-mats/prophecy';

export const VERSION_NUMBER = '0.10.0';
export const LAST_COMPATIBLE_SAVE_VERSION = '0.10.0';

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
export const COPPER_VALUE = 1;
export const SILVER_COST = 3;
export const SILVER_VALUE = 2;
export const GOLD_COST = 6;
export const GOLD_VALUE = 3;
export const HAND_STARTING_ESTATES = 3;
export const HAND_STARTING_ESTATES_FROM_SUPPLY = false;
export const HAND_STARTING_COPPERS = 7;
export const HAND_STARTING_COPPERS_FROM_SUPPLY = true;
// Prosperity Kingdom
export const PLATINUM_TOTAL_COUNT = 12;
export const PLATINUM_COST = 9;
export const PLATINUM_VALUE = 5;
export const COLONY_TOTAL_COUNT_2P = 8;
export const COLONY_TOTAL_COUNT = 12;
export const COLONY_COST = 11;
export const COLONY_VP = 10;

// game defaults
export const DEFAULT_TURN_ACTIONS = 1;
export const DEFAULT_TURN_BUYS = 1;
export const DEFAULT_TURN_COINS = 0;
export const DEFAULT_TURN_CARDS = 5;

/**
 * Default values for the expansions enabled.
 * @returns The default expansions enabled.
 */
export function DefaultExpansionsEnabled(): IExpansionsEnabled {
  return deepClone<IExpansionsEnabled>({
    prosperity: false,
    renaissance: false,
    risingSun: false,
  });
}

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
    curses: true,
    expansions: DefaultExpansionsEnabled(),
    mats: DefaultMatsEnabled(),
    trackCardCounts: true,
    trackCardGains: true,
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
    actions: DEFAULT_TURN_ACTIONS,
    buys: DEFAULT_TURN_BUYS,
    coins: DEFAULT_TURN_COINS,
    cards: DEFAULT_TURN_CARDS,
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
 * Default values for the renaissance set
 * @returns The default renaissance features.
 */
export function DefaultRenaissanceFeatures(): IRenaissanceFeatures {
  return deepClone<IRenaissanceFeatures>({
    flagBearerEnabled: false,
    flagBearer: null,
  });
}

export function DefaultRisingSunFeatures(): IRisingSunFeatures {
  return deepClone<IRisingSunFeatures>({
    prophecy: { suns: NOT_PRESENT },
    greatLeaderProphecy: false,
  });
}

export function EnabledRisingSunFeatures(
  numPlayers: number,
  greatLeaderProphecy = true
): IRisingSunFeatures {
  return deepClone<IRisingSunFeatures>({
    prophecy: calculateInitialSunTokens(numPlayers),
    greatLeaderProphecy,
  });
}

// Base Supply calculations from https://wiki.dominionstrategy.com/index.php/Gameplay
// Prosperity Supply calculations from https://wiki.dominionstrategy.com/index.php/Prosperity

/**
 * Calculate the supply for a two player game.
 * @param prosperity Whether prosperity is enabled.
 * @returns The supply information.
 */
export function TwoPlayerSupply(prosperity: boolean): ISupplyInfo {
  return {
    setsRequired: 1,
    supply: deepClone<IGameSupply>({
      estates: 8,
      duchies: 8,
      provinces: 8,
      coppers: 46,
      silvers: 40,
      golds: 30,
      curses: 10,
      colonies: prosperity ? 8 : NOT_PRESENT,
      platinums: prosperity ? 12 : NOT_PRESENT,
    }),
  };
}

/**
 * Calculate the supply for a three player game.
 * @param prosperity Whether prosperity is enabled.
 * @returns The supply information.
 */
export function ThreePlayerSupply(prosperity: boolean): ISupplyInfo {
  return {
    setsRequired: 1,
    supply: deepClone<IGameSupply>({
      estates: 12,
      duchies: 12,
      provinces: 12,
      coppers: 39,
      silvers: 40,
      golds: 30,
      curses: 20,
      colonies: prosperity ? 12 : NOT_PRESENT,
      platinums: prosperity ? 12 : NOT_PRESENT,
    }),
  };
}

/**
 * Calculate the supply for a four player game.
 * @param prosperity Whether prosperity is enabled.
 * @returns The supply information.
 */
export function FourPlayerSupply(prosperity: boolean): ISupplyInfo {
  return {
    setsRequired: 1,
    supply: deepClone<IGameSupply>({
      estates: 12,
      duchies: 12,
      provinces: 12,
      coppers: 32,
      silvers: 40,
      golds: 30,
      curses: 30,
      colonies: prosperity ? 12 : NOT_PRESENT,
      platinums: prosperity ? 12 : NOT_PRESENT,
    }),
  };
}

/**
 * Calculate the supply for a five player game.
 * @param prosperity Whether prosperity is enabled.
 * @returns The supply information.
 */
export function FivePlayerSupply(prosperity: boolean): ISupplyInfo {
  return {
    setsRequired: 2,
    supply: deepClone<IGameSupply>({
      estates: 12,
      duchies: 12,
      provinces: 15,
      coppers: 85, // Two sets
      silvers: 80, // Two sets
      golds: 60, // Two sets
      curses: 40,
      colonies: prosperity ? 12 : NOT_PRESENT,
      platinums: prosperity ? 12 : NOT_PRESENT,
    }),
  };
}

/**
 * Calculate the supply for a six player game.
 * @param prosperity Whether prosperity is enabled.
 * @returns The supply information.
 */
export function SixPlayerSupply(prosperity: boolean): ISupplyInfo {
  return {
    setsRequired: 2,
    supply: deepClone<IGameSupply>({
      estates: 12,
      duchies: 12,
      provinces: 18,
      coppers: 78, // Two sets
      silvers: 80, // Two sets
      golds: 60, // Two sets
      curses: 50,
      colonies: prosperity ? 12 : NOT_PRESENT,
      platinums: prosperity ? 12 : NOT_PRESENT,
    }),
  };
}

/**
 * Calculate the supply for a given player count.
 * @param playerCount The number of players.
 * @param prosperity Whether prosperity is enabled.
 * @returns The supply information.
 */
export function SupplyForPlayerCount(playerCount: number, prosperity: boolean): ISupplyInfo {
  switch (playerCount) {
    case 2:
      return TwoPlayerSupply(prosperity);
    case 3:
      return ThreePlayerSupply(prosperity);
    case 4:
      return FourPlayerSupply(prosperity);
    case 5:
      return FivePlayerSupply(prosperity);
    case 6:
      return SixPlayerSupply(prosperity);
    default:
      throw new Error(`Invalid player count: ${playerCount}`);
  }
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
      expansions: DefaultExpansionsEnabled(),
      mats: DefaultMatsEnabled(),
      trackCardCounts: true,
      trackCardGains: true,
    },
    currentTurn: 1,
    expansions: {
      renaissance: DefaultRenaissanceFeatures(),
      risingSun: DefaultRisingSunFeatures(),
    },
    currentPlayerIndex: NO_PLAYER,
    firstPlayerIndex: NO_PLAYER,
    selectedPlayerIndex: NO_PLAYER,
    log: [],
    timeCache: [],
    turnStatisticsCache: [],
    gameVersion: VERSION_NUMBER,
    pendingGroupedActions: [],
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

/**
 * A list of actions that require a count
 */
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

/**
 * A list of actions that have a negative adjustment.
 */
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
  GameLogAction.GROUPED_ACTION,
];

/**
 * Actions that can only be undone if they are the last action in the game log.
 */
export const ActionsWithOnlyLastActionUndo = [GameLogAction.SELECT_PLAYER, GameLogAction.NEXT_TURN];

/**
 * Actions that cannot be undone.
 */
export const NoUndoActions = [...NoPlayerActions, GameLogAction.START_GAME];

/**
 * State machine transitions for the game steps.
 */
export const StepTransitions: Record<CurrentStep, CurrentStep> = {
  [CurrentStep.AddPlayerNames]: CurrentStep.SelectFirstPlayer,
  [CurrentStep.SelectFirstPlayer]: CurrentStep.SetGameOptions,
  [CurrentStep.SetGameOptions]: CurrentStep.Game,
  [CurrentStep.Game]: CurrentStep.EndGame,
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
