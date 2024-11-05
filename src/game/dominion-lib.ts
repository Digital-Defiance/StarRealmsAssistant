import { v4 as uuidv4 } from 'uuid';
import { GameLogAction } from '@/game/enumerations/game-log-action';
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
  EmptyMatDetails,
  DefaultTurnDetails,
  EmptyVictoryDetails,
  MAX_PLAYERS,
  MIN_PLAYERS,
  DefaultPlayerColors,
  HAND_STARTING_COPPERS_FROM_SUPPLY,
  HAND_STARTING_ESTATES_FROM_SUPPLY,
  NOT_PRESENT,
  NO_PLAYER,
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
import { deepClone } from '@/game/utils';
import { IPlayerGameTurnDetails } from '@/game/interfaces/player-game-turn-details';
import { ILogEntry } from '@/game/interfaces/log-entry';
import { InvalidPlayerIndexError } from '@/game/errors/invalid-player-index';

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
  return deepClone<IGameSupply>({ ...baseSupply, ...prosperitySupply });
}

/**
 * Distribute the initial supply of cards to the players.
 * @param game - The game
 * @returns The updated game
 */
export function distributeInitialSupply(game: IGame): IGame {
  const updatedGame = deepClone<IGame>(game);
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
      ...EmptyVictoryDetails(),
      estates: HAND_STARTING_ESTATES,
    },
  }));
  if (HAND_STARTING_ESTATES_FROM_SUPPLY) {
    // Subtract the distributed estates from the supply
    updatedGame.supply = {
      ...updatedGame.supply,
      estates: updatedGame.supply.estates - playerCount * HAND_STARTING_ESTATES,
    };
  }
  if (HAND_STARTING_COPPERS_FROM_SUPPLY) {
    // Subtract the distributed coppers from the supply
    updatedGame.supply = {
      ...updatedGame.supply,
      coppers: updatedGame.supply.coppers - playerCount * HAND_STARTING_COPPERS,
    };
  }
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
    mats: EmptyMatDetails(),
    turn: DefaultTurnDetails(),
    newTurn: DefaultTurnDetails(),
    victory: EmptyVictoryDetails(),
  };
  return newPlayer;
}

/**
 * Re-Initialize the game state with the given number of players and options.
 * @param gameStateWithOptions - The game state with players and selected options
 * @returns The updated game state
 */
export const NewGameState = (gameStateWithOptions: IGame): IGame => {
  let newGameState = deepClone<IGame>(gameStateWithOptions);
  const playerCount = gameStateWithOptions.players.length;

  // Check for minimum and maximum players
  if (playerCount < MIN_PLAYERS) {
    throw new MinPlayersError();
  }
  if (playerCount > MAX_PLAYERS) {
    throw new MaxPlayersError();
  }

  // Create a new game state with the initial supply, while resetting the player details
  newGameState.players = newGameState.players.map((player, index) => ({
    ...newPlayer(player.name, index),
    color: newGameState.players[index].color,
  }));
  newGameState.supply = calculateInitialSupply(
    gameStateWithOptions.players.length,
    gameStateWithOptions.options
  );
  newGameState.currentStep = CurrentStep.Game;
  newGameState.currentTurn = 1;
  newGameState.log = [
    {
      id: uuidv4(),
      timestamp: new Date(),
      playerIndex: newGameState.firstPlayerIndex,
      currentPlayerIndex: newGameState.firstPlayerIndex,
      turn: 1,
      action: GameLogAction.START_GAME,
    } as ILogEntry,
  ];
  newGameState.selectedPlayerIndex = newGameState.firstPlayerIndex;
  newGameState.currentPlayerIndex = newGameState.firstPlayerIndex;

  // Distribute initial supply to players
  newGameState = distributeInitialSupply(newGameState);

  // Initialize Rising Sun tokens if the expansion is enabled
  newGameState.expansions.risingSun.prophecy.suns = NOT_PRESENT;
  if (newGameState.options.expansions.risingSun) {
    newGameState.expansions.risingSun = {
      greatLeaderProphecy: newGameState.expansions.risingSun.greatLeaderProphecy,
      prophecy: calculateInitialSunTokens(newGameState.players.length),
    };
  } else {
    newGameState.expansions.risingSun = {
      greatLeaderProphecy: false,
      prophecy: { suns: NOT_PRESENT },
    };
  }
  // reset flag bearer
  newGameState.expansions.renaissance.flagBearer = null;

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
  increment: number,
  victoryTrash?: boolean
): IGame {
  const updatedGame = deepClone<IGame>(game);
  if (playerIndex < 0 || playerIndex >= updatedGame.players.length) {
    throw new InvalidPlayerIndexError(playerIndex);
  }
  const player = updatedGame.players[playerIndex];

  // Check if the field is valid
  if (field !== 'victory' && field !== 'turn' && field !== 'mats' && field !== 'newTurn') {
    throw new InvalidFieldError(field as string);
  }

  // Check if the subfield decrement would go below 0
  if (((player[field] as any)[subfield] || 0) + increment < 0) {
    throw new NotEnoughSubfieldError(field, subfield);
  }

  // Check if the supply decrement would go below 0
  const decrementSupply =
    field === 'victory' &&
    ['estates', 'duchies', 'provinces', 'colonies', 'curses'].includes(subfield);

  if (decrementSupply) {
    const supplyCount = updatedGame.supply[subfield as keyof IGameSupply] as number;
    if (increment > 0 && supplyCount < increment) {
      throw new NotEnoughSupplyError(subfield as string);
    }
  }

  // Perform the actual updates
  (player[field] as any)[subfield] = Math.max(
    ((player[field] as any)[subfield] || 0) + increment,
    0
  );

  // Update the supply if the field is a victory field and victoryTrash is not true
  if (decrementSupply && !victoryTrash) {
    (updatedGame.supply[subfield as keyof IGameSupply] as number) -= increment;
  }

  return updatedGame;
}

/**
 * Get the field and subfield from a game log action.
 * @param action - The game log action
 * @returns The field and subfield
 */
export function getFieldAndSubfieldFromAction(action: GameLogAction): {
  field: PlayerField | null;
  subfield: PlayerSubFields | null;
} {
  switch (action) {
    case GameLogAction.ADD_ACTIONS:
    case GameLogAction.REMOVE_ACTIONS:
      return { field: 'turn', subfield: 'actions' };
    case GameLogAction.ADD_BUYS:
    case GameLogAction.REMOVE_BUYS:
      return { field: 'turn', subfield: 'buys' };
    case GameLogAction.ADD_COINS:
    case GameLogAction.REMOVE_COINS:
      return { field: 'turn', subfield: 'coins' };
    case GameLogAction.ADD_CARDS:
    case GameLogAction.REMOVE_CARDS:
      return { field: 'turn', subfield: 'cards' };
    case GameLogAction.ADD_GAINS:
    case GameLogAction.REMOVE_GAINS:
      return { field: 'turn', subfield: 'gains' };
    case GameLogAction.ADD_COFFERS:
    case GameLogAction.REMOVE_COFFERS:
      return { field: 'mats', subfield: 'coffers' };
    case GameLogAction.ADD_VILLAGERS:
    case GameLogAction.REMOVE_VILLAGERS:
      return { field: 'mats', subfield: 'villagers' };
    case GameLogAction.ADD_DEBT:
    case GameLogAction.REMOVE_DEBT:
      return { field: 'mats', subfield: 'debt' };
    case GameLogAction.ADD_FAVORS:
    case GameLogAction.REMOVE_FAVORS:
      return { field: 'mats', subfield: 'favors' };
    case GameLogAction.ADD_CURSES:
    case GameLogAction.REMOVE_CURSES:
      return { field: 'victory', subfield: 'curses' };
    case GameLogAction.ADD_ESTATES:
    case GameLogAction.REMOVE_ESTATES:
      return { field: 'victory', subfield: 'estates' };
    case GameLogAction.ADD_DUCHIES:
    case GameLogAction.REMOVE_DUCHIES:
      return { field: 'victory', subfield: 'duchies' };
    case GameLogAction.ADD_PROVINCES:
    case GameLogAction.REMOVE_PROVINCES:
      return { field: 'victory', subfield: 'provinces' };
    case GameLogAction.ADD_COLONIES:
    case GameLogAction.REMOVE_COLONIES:
      return { field: 'victory', subfield: 'colonies' };
    case GameLogAction.ADD_VP_TOKENS:
    case GameLogAction.REMOVE_VP_TOKENS:
      return { field: 'victory', subfield: 'tokens' };
    case GameLogAction.ADD_OTHER_VP:
    case GameLogAction.REMOVE_OTHER_VP:
      return { field: 'victory', subfield: 'other' };
    case GameLogAction.ADD_NEXT_TURN_ACTIONS:
    case GameLogAction.REMOVE_NEXT_TURN_ACTIONS:
      return { field: 'newTurn', subfield: 'actions' };
    case GameLogAction.ADD_NEXT_TURN_BUYS:
    case GameLogAction.REMOVE_NEXT_TURN_BUYS:
      return { field: 'newTurn', subfield: 'buys' };
    case GameLogAction.ADD_NEXT_TURN_COINS:
    case GameLogAction.REMOVE_NEXT_TURN_COINS:
      return { field: 'newTurn', subfield: 'coins' };
    case GameLogAction.ADD_NEXT_TURN_CARDS:
    case GameLogAction.REMOVE_NEXT_TURN_CARDS:
      return { field: 'newTurn', subfield: 'cards' };
    default:
      return { field: null, subfield: null };
  }
}

/**
 * Gets the index of the previous player in the game.
 * @param prevGame
 * @returns The index of the previous player
 */
export function getPreviousPlayerIndex(prevGame: IGame): number {
  if (prevGame.currentTurn <= 1) {
    return NO_PLAYER;
  }
  return getPreviousPlayerIndexByIndex(prevGame.currentPlayerIndex, prevGame.players.length);
}

/**
 * Gets the index of the previous player in the game.
 * @param currentPlayerIndex - The index of the current player in the game
 * @param playerCount - The number of players in the game
 * @returns The index of the previous player in the game
 */
export function getPreviousPlayerIndexByIndex(
  currentPlayerIndex: number,
  playerCount: number
): number {
  return playerCount === 0 ? NO_PLAYER : (currentPlayerIndex - 1 + playerCount) % playerCount;
}

/**
 * Gets the index of the next player in the game.
 * @param prevGame
 * @returns The index of the next player in the game
 */
export function getNextPlayerIndex(prevGame: IGame): number {
  return getNextPlayerIndexByIndex(prevGame.currentPlayerIndex, prevGame.players.length);
}

/**
 * Gets the index of the next player in the game.
 * @param prevGame
 * @returns The index of the next player in the game
 */
export function getNextPlayerIndexByIndex(currentPlayerIndex: number, playerCount: number): number {
  return playerCount === 0 ? NO_PLAYER : (currentPlayerIndex + 1) % playerCount;
}

/**
 * Increment the turn counters for the game.
 * @param prevGame - The previous game state
 * @returns The updated game state with incremented turn counters
 */
export function incrementTurnCountersAndPlayerIndices(prevGame: IGame): IGame {
  const nextPlayerIndex = getNextPlayerIndex(prevGame);
  const newGame = deepClone<IGame>(prevGame);
  newGame.currentTurn = prevGame.currentTurn + 1;
  newGame.currentPlayerIndex = nextPlayerIndex;
  newGame.selectedPlayerIndex = nextPlayerIndex;
  return newGame;
}

/**
 * Reset the turn counters for all players.
 * @param prevGame - The previous game state
 * @returns The updated game state with reset turn counters
 */
export function resetPlayerTurnCounters(prevGame: IGame): IGame {
  const newGame = deepClone<IGame>(prevGame);
  newGame.players = newGame.players.map((player) => ({
    ...player,
    turn: deepClone<IPlayerGameTurnDetails>(player.newTurn ?? DefaultTurnDetails()),
  }));
  return newGame;
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
