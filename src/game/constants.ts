import { CurrentStep } from '@/game/enumerations/current-step';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import { IGameSupply } from '@/game/interfaces/game-supply';
import { IPlayerGameTurnDetails } from '@/game/interfaces/player-game-turn-details';
import { IAuthorityDetails } from '@/game/interfaces/authority-details';
import { IGameOptions } from '@/game/interfaces/game-options';
import { deepClone } from '@/game/utils';
import { IGame } from '@/game/interfaces/game';
import { ISupplyInfo } from '@/game/interfaces/supply-info';

export const VERSION_NUMBER = '0.0.1';
export const LAST_COMPATIBLE_SAVE_VERSION = '0.0.1';

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 6;
export const NO_PLAYER = -1;
export const NOT_PRESENT = -1;
// Base Set
export const STARTING_EXPLORERS = 10;
export const STARTING_VIPERS = 2;
export const STARTING_SCOUTS = 8;

// game defaults
export const DEFAULT_TURN_CARDS = 5;
export const DEFAULT_FIRST_TURN_CARDS = 3;
export const DEFAULT_STARTING_AUTHORITY = 50;

/**
 * Default values for the game options.
 */
export function DefaultGameOptions(): IGameOptions {
  return deepClone<IGameOptions>({
    trackCardCounts: true,
    trackCardGains: true,
    trackDiscard: true,
    startingAuthorityByPlayerIndex: {
      [0]: DEFAULT_STARTING_AUTHORITY,
      [1]: DEFAULT_STARTING_AUTHORITY,
    },
    startingCardsByPlayerIndex: {
      [0]: DEFAULT_TURN_CARDS,
      [1]: DEFAULT_TURN_CARDS,
    },
  });
}

/**
 * Default (zero) values for the game supply.
 */
export function EmptyGameSupply(): IGameSupply {
  return deepClone<IGameSupply>({
    explorers: 0,
    scouts: 0,
    vipers: 0,
  });
}

/**
 * Default (zero) values for the player game turn details.
 */
export function DefaultTurnDetails(): IPlayerGameTurnDetails {
  return deepClone<IPlayerGameTurnDetails>({
    combat: 0,
    trade: 0,
    cards: DEFAULT_TURN_CARDS,
    gains: 0,
    discard: 0,
    scrap: 0,
  });
}

/**
 * Default (zero) values for the victory details.
 */
export function EmptyVictoryDetails(): IAuthorityDetails {
  return deepClone<IAuthorityDetails>({
    authority: 0,
  });
}

// Base Supply calculations from https://wiki.dominionstrategy.com/index.php/Gameplay
// Prosperity Supply calculations from https://wiki.dominionstrategy.com/index.php/Prosperity

/**
 * Calculate the supply for a two player game.
 * @returns The supply information.
 */
export function GameSupplyForPlayers(playerCount: number): ISupplyInfo {
  const sets = Math.ceil(playerCount / 2);
  return {
    setsRequired: sets,
    supply: deepClone<IGameSupply>({
      explorers: sets * 10,
      scouts: sets * 16,
      vipers: sets * 4,
    }),
  };
}

/**
 * Calculate the supply for a given player count.
 * @param playerCount The number of players.
 * @param prosperity Whether prosperity is enabled.
 * @returns The supply information.
 */
export function SupplyForPlayerCount(playerCount: number): ISupplyInfo {
  switch (playerCount) {
    case 2:
    case 3:
    case 4:
    case 5:
    case 6:
      return GameSupplyForPlayers(playerCount);
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
    options: DefaultGameOptions(),
    currentTurn: 1,
    currentPlayerIndex: NO_PLAYER,
    firstPlayerIndex: NO_PLAYER,
    selectedPlayerIndex: NO_PLAYER,
    log: [],
    turnStatisticsCache: [],
    gameVersion: VERSION_NUMBER,
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
  GameLogAction.ADD_AUTHORITY,
  GameLogAction.REMOVE_AUTHORITY,
  GameLogAction.ADD_TRADE,
  GameLogAction.REMOVE_TRADE,
  GameLogAction.ADD_COMBAT,
  GameLogAction.REMOVE_COMBAT,
  GameLogAction.ADD_CARDS,
  GameLogAction.REMOVE_CARDS,
  GameLogAction.ADD_GAINS,
  GameLogAction.REMOVE_GAINS,
  GameLogAction.ADD_DISCARD,
  GameLogAction.REMOVE_DISCARD,
  GameLogAction.SCRAP,
  GameLogAction.UNSCRAP,
];

/**
 * A list of actions that have a negative adjustment.
 */
export const NegativeAdjustmentActions = [
  // turn actions
  GameLogAction.REMOVE_TRADE,
  GameLogAction.REMOVE_AUTHORITY,
  GameLogAction.REMOVE_COMBAT,
  GameLogAction.REMOVE_CARDS,
  GameLogAction.REMOVE_GAINS,
  GameLogAction.REMOVE_DISCARD,
  GameLogAction.SCRAP,
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

export const SaveGameStorageKey = '@starrealms_saved_games';
export const SaveGameStorageKeyPrefix = '@starrealms_game_';
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
