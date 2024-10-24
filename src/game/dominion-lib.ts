import { v4 as uuidv4 } from 'uuid';
import { GameLogActionWithCount } from '@/game/enumerations/game-log-action-with-count';
import { IGame } from '@/game/interfaces/game';
import { IGameSupply } from '@/game/interfaces/game-supply';
import {
  CURSE_VP,
  DUCHY_VP,
  ESTATE_VP,
  HAND_STARTING_COPPERS,
  HAND_STARTING_ESTATES,
  PROVINCE_VP,
  COLONY_VP,
  NO_PLAYER,
  EmptyGameSupply,
  EmptyMatDetails,
  DefaultTurnDetails,
  EmptyVictoryDetails,
  NoPlayerActions,
  MAX_PLAYERS,
  MIN_PLAYERS,
  NOT_PRESENT,
  DefaultPlayerColors,
} from '@/game/constants';
import { computeStartingSupply as computeBaseStartingSupply } from '@/game/interfaces/set-kingdom/base';
import {
  computeStartingSupply as computeProsperityStartingSupply,
  NullSet as ProsperityNullSet,
} from '@/game/interfaces/set-kingdom/prosperity';
import { IPlayer } from '@/game/interfaces/player';
import { PlayerField, PlayerFieldMap, PlayerSubFields } from '@/game/types';
import { CurrentStep } from '@/game/enumerations/current-step';
import { calculateInitialSunTokens } from '@/game/interfaces/set-mats/prophecy';
import { IGameOptions } from '@/game/interfaces/game-options';
import { InvalidFieldError } from '@/game/errors/invalid-field';
import { NotEnoughSupplyError } from '@/game/errors/not-enough-supply';
import { MinPlayersError } from '@/game/errors/min-players';
import { MaxPlayersError } from '@/game/errors/max-players';
import { NotEnoughSubfieldError } from '@/game/errors/not-enough-subfield';
import { RankedPlayer } from '@/game/interfaces/ranked-player';

/**
 * Calculate the victory points for a player.
 * @param player - The player
 * @returns The victory points
 */
export function calculateVictoryPoints(player: IPlayer): number {
  // Add null checks and default values
  const estatePoints = (player.victory.estates || 0) * ESTATE_VP;
  const duchyPoints = (player.victory.duchies || 0) * DUCHY_VP;
  const provincePoints = (player.victory.provinces || 0) * PROVINCE_VP;
  const colonyPoints = (player.victory.colonies || 0) * COLONY_VP;
  const tokenPoints = player.victory.tokens || 0;
  const otherPoints = player.victory.other || 0;
  const cursePoints = (player.victory.curses || 0) * CURSE_VP;

  return (
    estatePoints +
    duchyPoints +
    provincePoints +
    colonyPoints +
    tokenPoints +
    otherPoints +
    cursePoints
  );
}

/**
 * Calculate the initial game kingdom card supply based on the number of players and options.
 * @param numPlayers - The number of players
 * @param curses - Whether curses are included
 * @param prosperity - Whether Prosperity cards are included
 * @returns The initial game supply
 */
export function calculateInitialSupply(numPlayers: number, options: IGameOptions): IGameSupply {
  const baseSupply = computeBaseStartingSupply(numPlayers, options.curses);
  const prosperitySupply = options.expansions.prosperity
    ? computeProsperityStartingSupply(numPlayers)
    : ProsperityNullSet;
  return { ...baseSupply, ...prosperitySupply };
}

/**
 * Distribute the initial supply of cards to the players.
 * @param game - The game
 * @returns The updated game
 */
export function distributeInitialSupply(game: IGame): IGame {
  const updatedGame = { ...game };
  const playerCount = updatedGame.players.length;

  // If there are no players, return the game as is
  if (playerCount === 0) {
    return updatedGame;
  }

  /* do not subtract estates from the supply- the supply should
   * start with the specified number
   */
  updatedGame.players = updatedGame.players.map((player) => ({
    ...player,
    victory: {
      ...EmptyVictoryDetails,
      estates: HAND_STARTING_ESTATES,
    },
  }));
  // Subtract the distributed coppers from the supply
  updatedGame.supply = {
    ...updatedGame.supply,
    coppers: updatedGame.supply.coppers - playerCount * HAND_STARTING_COPPERS,
  };
  return updatedGame;
}

/**
 * Create a new player object with default values
 * @param playerName - The name of the player
 * @returns The new player object
 */
export function newPlayer(playerName: string, index: number): IPlayer {
  const newPlayer: IPlayer = {
    name: playerName.trim(),
    color: DefaultPlayerColors[index],
    mats: { ...EmptyMatDetails },
    turn: { ...DefaultTurnDetails },
    newTurn: { ...DefaultTurnDetails },
    victory: { ...EmptyVictoryDetails },
  };
  return newPlayer;
}

/**
 * A basic game state with no players or options.
 */
export const EmptyGameState: IGame = {
  currentStep: 1,
  players: [],
  setsRequired: 1,
  supply: EmptyGameSupply,
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
};

/**
 * Initialize the game state with the given number of players and options.
 * @param gameStateWithOptions - The game state with players and selected options
 * @returns The updated game state
 */
export const NewGameState = (gameStateWithOptions: IGame): IGame => {
  const playerCount = gameStateWithOptions.players.length;

  // Check for minimum and maximum players
  if (playerCount < MIN_PLAYERS) {
    throw new MinPlayersError();
  }
  if (playerCount > MAX_PLAYERS) {
    throw new MaxPlayersError();
  }

  // Calculate initial supply
  const initialSupply = calculateInitialSupply(
    gameStateWithOptions.players.length,
    gameStateWithOptions.options
  );

  // Create a new game state with the initial supply, while resetting the player details
  let newGameState: IGame = {
    ...gameStateWithOptions,
    players: gameStateWithOptions.players.map((player, index) => ({
      ...newPlayer(player.name, index),
      color: gameStateWithOptions.players[index].color,
    })),
    supply: initialSupply,
    currentStep: CurrentStep.GameScreen,
    currentTurn: 1,
    log: [
      {
        id: uuidv4(),
        timestamp: new Date(),
        playerIndex: gameStateWithOptions.firstPlayerIndex,
        currentPlayerIndex: gameStateWithOptions.firstPlayerIndex,
        turn: 1,
        action: GameLogActionWithCount.START_GAME,
      },
    ],
    selectedPlayerIndex: gameStateWithOptions.firstPlayerIndex,
    currentPlayerIndex: gameStateWithOptions.firstPlayerIndex,
    firstPlayerIndex: gameStateWithOptions.firstPlayerIndex,
  };

  // Distribute initial supply to players
  newGameState = distributeInitialSupply(newGameState);

  // Initialize Rising Sun tokens if the expansion is enabled
  if (newGameState.options.expansions.risingSun) {
    newGameState.risingSun = {
      ...newGameState.risingSun,
      prophecy: calculateInitialSunTokens(newGameState.players.length),
    };
  }

  return newGameState;
};

/**
 * Update the player field with the given increment.
 * @param game - The game state
 * @param playerIndex - The index of the player
 * @param field - The field to update
 * @param subfield - The subfield to update
 * @param increment - The amount to increment the field by
 * @returns The updated game state
 */
export function updatePlayerField<T extends keyof PlayerFieldMap>(
  game: IGame,
  playerIndex: number,
  field: T,
  subfield: PlayerFieldMap[T],
  increment: number
): IGame {
  const updatedGame = { ...game };
  const player = { ...updatedGame.players[playerIndex] };

  if (field === 'victory' || field === 'turn' || field === 'mats' || field === 'newTurn') {
    if (((player[field] as any)[subfield] || 0) + increment < 0) {
      throw new NotEnoughSubfieldError(field, subfield);
    }
    (player[field] as any)[subfield] = Math.max(
      ((player[field] as any)[subfield] || 0) + increment,
      0
    );
  } else {
    throw new InvalidFieldError(field as string);
  }

  updatedGame.players[playerIndex] = player;

  // update the supply if the field is a victory field
  if (
    field === 'victory' &&
    ['estates', 'duchies', 'provinces', 'colonies', 'curses'].includes(subfield)
  ) {
    (updatedGame.supply[subfield as keyof IGameSupply] as number) -= increment;

    const supplyCount = updatedGame.supply[subfield as keyof IGameSupply] as number;
    if (increment > 0 && supplyCount < increment) {
      throw new NotEnoughSupplyError(subfield as string);
    }
  }
  return updatedGame;
}

/**
 * Get the field and subfield from a game log action.
 * @param action - The game log action
 * @returns The field and subfield
 */
export function getFieldAndSubfieldFromAction(action: GameLogActionWithCount): {
  field: PlayerField | null;
  subfield: PlayerSubFields | null;
} {
  switch (action) {
    case GameLogActionWithCount.ADD_ACTIONS:
    case GameLogActionWithCount.REMOVE_ACTIONS:
      return { field: 'turn', subfield: 'actions' };
    case GameLogActionWithCount.ADD_BUYS:
    case GameLogActionWithCount.REMOVE_BUYS:
      return { field: 'turn', subfield: 'buys' };
    case GameLogActionWithCount.ADD_COINS:
    case GameLogActionWithCount.REMOVE_COINS:
      return { field: 'turn', subfield: 'coins' };
    case GameLogActionWithCount.ADD_COFFERS:
    case GameLogActionWithCount.REMOVE_COFFERS:
      return { field: 'mats', subfield: 'coffers' };
    case GameLogActionWithCount.ADD_VILLAGERS:
    case GameLogActionWithCount.REMOVE_VILLAGERS:
      return { field: 'mats', subfield: 'villagers' };
    case GameLogActionWithCount.ADD_DEBT:
    case GameLogActionWithCount.REMOVE_DEBT:
      return { field: 'mats', subfield: 'debt' };
    case GameLogActionWithCount.ADD_FAVORS:
    case GameLogActionWithCount.REMOVE_FAVORS:
      return { field: 'mats', subfield: 'favors' };
    case GameLogActionWithCount.ADD_CURSES:
    case GameLogActionWithCount.REMOVE_CURSES:
      return { field: 'victory', subfield: 'curses' };
    case GameLogActionWithCount.ADD_ESTATES:
    case GameLogActionWithCount.REMOVE_ESTATES:
      return { field: 'victory', subfield: 'estates' };
    case GameLogActionWithCount.ADD_DUCHIES:
    case GameLogActionWithCount.REMOVE_DUCHIES:
      return { field: 'victory', subfield: 'duchies' };
    case GameLogActionWithCount.ADD_PROVINCES:
    case GameLogActionWithCount.REMOVE_PROVINCES:
      return { field: 'victory', subfield: 'provinces' };
    case GameLogActionWithCount.ADD_COLONIES:
    case GameLogActionWithCount.REMOVE_COLONIES:
      return { field: 'victory', subfield: 'colonies' };
    case GameLogActionWithCount.ADD_VP_TOKENS:
    case GameLogActionWithCount.REMOVE_VP_TOKENS:
      return { field: 'victory', subfield: 'tokens' };
    case GameLogActionWithCount.ADD_OTHER_VP:
    case GameLogActionWithCount.REMOVE_OTHER_VP:
      return { field: 'victory', subfield: 'other' };
    case GameLogActionWithCount.ADD_NEXT_TURN_ACTIONS:
    case GameLogActionWithCount.REMOVE_NEXT_TURN_ACTIONS:
      return { field: 'newTurn', subfield: 'actions' };
    case GameLogActionWithCount.ADD_NEXT_TURN_BUYS:
    case GameLogActionWithCount.REMOVE_NEXT_TURN_BUYS:
      return { field: 'newTurn', subfield: 'buys' };
    case GameLogActionWithCount.ADD_NEXT_TURN_COINS:
    case GameLogActionWithCount.REMOVE_NEXT_TURN_COINS:
      return { field: 'newTurn', subfield: 'coins' };
    default:
      return { field: null, subfield: null };
  }
}

/**
 * Get the increment for the given action.
 * @param action - The game log action
 * @returns The increment multiplier (positive or negative)
 */
export function getActionIncrementMultiplier(action: GameLogActionWithCount): number {
  if (action === undefined || action === null) {
    return 0;
  }

  if (NoPlayerActions.includes(action)) {
    return 0;
  }

  if (action.startsWith('Add')) {
    return 1;
  }

  if (action.startsWith('Remove')) {
    return -1;
  }

  // If the action doesn't match any known pattern, return 0
  return 0;
}

/**
 * Gets the index of the previous player in the game.
 * @param prevGame
 * @returns The index of the previous player
 */
export function getPreviousPlayerIndex(prevGame: IGame): number {
  const currentPlayerIndex = prevGame.currentPlayerIndex;
  const previousPlayerIndex =
    prevGame.players.length === 0
      ? -1
      : (currentPlayerIndex - 1 + prevGame.players.length) % prevGame.players.length;
  return previousPlayerIndex;
}

/**
 * Gets the index of the next player in the game.
 * @param prevGame
 * @returns The index of the next player in the game
 */
export function getNextPlayerIndex(prevGame: IGame): number {
  const currentPlayerIndex = prevGame.currentPlayerIndex;
  const nextPlayerIndex =
    prevGame.players.length === 0 ? -1 : (currentPlayerIndex + 1) % prevGame.players.length;
  return nextPlayerIndex;
}

/**
 * Increment the turn counters for the game.
 * @param prevGame - The previous game state
 * @returns The updated game state with incremented turn counters
 */
export function incrementTurnCountersAndPlayerIndices(prevGame: IGame): IGame {
  const nextPlayerIndex = getNextPlayerIndex(prevGame);
  return {
    ...prevGame,
    currentTurn: prevGame.currentTurn + 1,
    currentPlayerIndex: nextPlayerIndex,
    selectedPlayerIndex: nextPlayerIndex,
  };
}

/**
 * Reset the turn counters for all players.
 * @param prevGame - The previous game state
 * @returns The updated game state with reset turn counters
 */
export function resetPlayerTurnCounters(prevGame: IGame): IGame {
  return {
    ...prevGame,
    players: prevGame.players.map((player) => ({
      ...player,
      turn: { ...player.newTurn },
    })),
  };
}

/**
 * Rank players based on their victory points.
 * @param players - The list of players
 * @param calculateVictoryPoints - A function to calculate the victory points for a player
 * @returns An array of ranked players, sorted by score (descending) and then by name (ascending)
 */
export function rankPlayers(
  players: IPlayer[],
  calculateVictoryPoints: (player: IPlayer) => number
): RankedPlayer[] {
  // Calculate scores for each player
  const playersWithScores = players.map((player, index) => ({
    index,
    score: calculateVictoryPoints(player),
  }));

  // Sort players by score (descending) and then by name (ascending)
  playersWithScores.sort((a, b) => {
    if (b.score === a.score) {
      return players[a.index].name.localeCompare(players[b.index].name);
    }
    return b.score - a.score;
  });

  // Assign ranks considering ties
  const rankedPlayers: RankedPlayer[] = [];
  let currentRank = 1;

  for (let i = 0; i < playersWithScores.length; i++) {
    if (i > 0 && playersWithScores[i].score !== playersWithScores[i - 1].score) {
      currentRank = i + 1;
    }
    rankedPlayers.push({
      index: playersWithScores[i].index,
      score: playersWithScores[i].score,
      rank: currentRank,
    });
  }

  // Sort the final array by rank and then by name within the same rank
  rankedPlayers.sort((a, b) => {
    if (a.rank === b.rank) {
      return players[a.index].name.localeCompare(players[b.index].name);
    }
    return a.rank - b.rank;
  });

  return rankedPlayers;
}
