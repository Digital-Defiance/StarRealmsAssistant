import { CurrentStep } from '@/game/enumerations/current-step';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import { IGameSupply } from '@/game/interfaces/game-supply';
import { IPlayerGameTurnDetails } from '@/game/interfaces/player-game-turn-details';
import { IAuthorityDetails } from '@/game/interfaces/authority-details';
import { IGameOptions } from '@/game/interfaces/game-options';
import { MaxPlayersError } from '@/game/errors/max-players';
import { deepClone } from '@/game/utils';
import { IGame } from '@/game/interfaces/game';
import { ISupplyInfo } from '@/game/interfaces/supply-info';
import { MinPlayersError } from './errors/min-players';

/**
 * The current game version
 */
export const VERSION_NUMBER = '0.0.8' as const;
/**
 * The lowest version of the game that is compatible with this version of the save game format.
 */
export const MINIMUM_COMPATIBLE_SAVE_VERSION = '0.0.8' as const;

export const MIN_PLAYERS = 2 as const;
export const MAX_PLAYERS = 6 as const;
export const NO_PLAYER = -1 as const;
export const NOT_PRESENT = -1 as const;
// Base Set
export const STARTING_EXPLORERS = 10 as const;
export const STARTING_VIPERS = 2 as const;
export const STARTING_SCOUTS = 8 as const;

// game defaults
export const DEFAULT_TURN_CARDS = 5 as const;
export const DEFAULT_FIRST_TURN_CARDS = 3 as const;
export const DEFAULT_STARTING_AUTHORITY = 50 as const;

/**
 * Default values for the game options.
 */
export function DefaultGameOptions(): IGameOptions {
  return deepClone<IGameOptions>({
    trackCardCounts: true,
    trackCardGains: true,
    trackDiscard: true,
    trackAssimilation: false,
    startingAuthorityByPlayerIndex: [DEFAULT_STARTING_AUTHORITY, DEFAULT_STARTING_AUTHORITY],
    startingCardsByPlayerIndex: [DEFAULT_TURN_CARDS, DEFAULT_TURN_CARDS],
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
 * Default (zero) values for the authority details.
 */
export function EmptyAuthorityDetails(): IAuthorityDetails {
  return deepClone<IAuthorityDetails>({
    authority: 0,
    assimilation: 0,
  });
}

/**
 * Calculate the supply for a two player game.
 * @returns The supply information.
 */
export function GameSupplyForPlayers(playerCount: number): ISupplyInfo {
  if (playerCount < MIN_PLAYERS) {
    throw new MinPlayersError();
  } else if (playerCount > MAX_PLAYERS) {
    throw new MaxPlayersError();
  }
  const sets = Math.ceil(playerCount / 2);
  return {
    setsRequired: sets,
    supply: deepClone<IGameSupply>({
      explorers: sets * STARTING_EXPLORERS,
      scouts: sets * STARTING_SCOUTS,
      vipers: sets * STARTING_VIPERS,
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
  GameLogAction.ADD_ASSIMILATION,
  GameLogAction.REMOVE_ASSIMILATION,
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
  GameLogAction.REMOVE_ASSIMILATION,
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
export const NoUndoActions = [
  ...NoPlayerActions,
  GameLogAction.START_GAME,
  GameLogAction.BOSS_SKIPPED,
];

/**
 * State machine transitions for the game steps.
 */
export const StepTransitions: Record<CurrentStep, CurrentStep> = {
  [CurrentStep.AddPlayerNames]: CurrentStep.SetPlayerOrder,
  [CurrentStep.SetPlayerOrder]: CurrentStep.SetGameOptions,
  [CurrentStep.SetGameOptions]: CurrentStep.Game,
  [CurrentStep.Game]: CurrentStep.EndGame,
  [CurrentStep.EndGame]: CurrentStep.EndGame,
};

export const SaveGameStorageKey = '@starrealms_saved_games' as const;
export const SaveGameStorageKeyPrefix = '@starrealms_game_' as const;
export const AutoSaveGameSaveName = 'AutoSave' as const;
export const AutoSaveGameSaveId = 'autosave' as const;

export const BossColor = '#8B0000' as const;
export const DefaultPlayerColors = [
  '#e57373', // Red
  '#64b5f6', // Blue
  '#81c784', // Green
  '#ffd54f', // Yellow
  '#ba68c8', // Purple
  '#4db6ac', // Teal
] as const;
export const DefaultPlayerColorsWithBoss = [
  '#ffb74d', // Orange (replacing red)
  '#64b5f6', // Blue
  '#81c784', // Green
  '#ffd54f', // Yellow
  '#ba68c8', // Purple
  '#4db6ac', // Teal
] as const;

export const APP_FEATURES = [
  'Player Management: Add, remove, and track multiple players',
  'Dynamic Scoring: Real-time calculation and leaderboard',
  'Game Setup Wizard: Customizable game modes and expansions',
  'Turn Tracking: Keep track of player turns and phases',
  'Detailed Game Log: Record and review game events',
  'Save/Load Games: Save progress and resume later',
  'Intuitive UI: User-friendly Material-UI components',
  'Authority graphing/statistics',
  'Most-recent move is auto-saved to local storage',
] as const;
export const APP_MINI_DISCLAIMER =
  'Unofficial Star Realms Assistant is an open-source project and not affiliated with or endorsed by the makers of Star Realms or White Wizard Games. It is offered free of charge and is provided as-is, and with limited support. Please consider supporting Digital Defiance to promote open source and help us to serve the open source community.' as const;
export const APP_MINI_DISCLAIMER_NOTE =
  'Please note that this tool requires the physical game of Star Realms to play.' as const;
