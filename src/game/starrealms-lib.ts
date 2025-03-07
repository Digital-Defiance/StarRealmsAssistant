import { v4 as uuidv4 } from 'uuid';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import { IGame } from '@/game/interfaces/game';
import { IGameSupply } from '@/game/interfaces/game-supply';
import {
  DefaultTurnDetails,
  EmptyAuthorityDetails as EmptyAuthorityDetails,
  MAX_PLAYERS,
  MIN_PLAYERS,
  DefaultPlayerColors,
  NO_PLAYER,
  GameSupplyForPlayers,
  DEFAULT_STARTING_AUTHORITY,
  STARTING_SCOUTS,
  STARTING_VIPERS,
  DEFAULT_TURN_CARDS,
} from '@/game/constants';
import { IPlayer } from '@/game/interfaces/player';
import { PlayerField, PlayerFieldMap, PlayerSubFields } from '@/game/types';
import { CurrentStep } from '@/game/enumerations/current-step';
import { InvalidFieldError } from '@/game/errors/invalid-field';
import { MinPlayersError } from '@/game/errors/min-players';
import { MaxPlayersError } from '@/game/errors/max-players';
import { NotEnoughSubfieldError } from '@/game/errors/not-enough-subfield';
import { RankedPlayer } from '@/game/interfaces/ranked-player';
import { deepClone } from '@/game/utils';
import { IPlayerGameTurnDetails } from '@/game/interfaces/player-game-turn-details';
import { ILogEntry } from '@/game/interfaces/log-entry';
import { InvalidPlayerIndexError } from '@/game/errors/invalid-player-index';

/**
 * Calculate the initial game kingdom card supply based on the number of players and options.
 * @param numPlayers - The number of players
 * @returns The initial game supply
 */
export function calculateInitialSupply(numPlayers: number): IGameSupply {
  const baseSupply = GameSupplyForPlayers(numPlayers);
  return deepClone<IGameSupply>(baseSupply.supply);
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
    authority: {
      ...EmptyAuthorityDetails(),
      authority: DEFAULT_STARTING_AUTHORITY,
    },
  }));
  // Subtract the distributed scouts from the supply
  updatedGame.supply = {
    ...updatedGame.supply,
    scouts: updatedGame.supply.scouts - playerCount * STARTING_SCOUTS,
  };
  // Subtract the distributed vipers from the supply
  updatedGame.supply = {
    ...updatedGame.supply,
    vipers: updatedGame.supply.vipers - playerCount * STARTING_VIPERS,
  };
  return updatedGame;
}

/**
 * Create a new player object with default values
 * @param playerName - The name of the player
 * @param index - The index of the player
 * @returns The new player object
 */
export function newPlayer(playerName: string, index: number): IPlayer {
  const newPlayer: IPlayer = {
    name: playerName.trim(),
    color: DefaultPlayerColors[index],
    turn: DefaultTurnDetails(),
    newTurn: DefaultTurnDetails(),
    authority: EmptyAuthorityDetails(),
  };
  return newPlayer;
}

/**
 * Re-Initialize the game state with the given number of players and options.
 * @param gameStateWithOptions - The game state with players and selected options
 * @param gameStart - The start time of the game
 * @returns The updated game state
 */
export const NewGameState = (gameStateWithOptions: IGame, gameStart: Date): IGame => {
  let newGameState = deepClone<IGame>(gameStateWithOptions);
  const playerCount = gameStateWithOptions.players.length;

  // Check for minimum and maximum players
  if (playerCount < MIN_PLAYERS) {
    throw new MinPlayersError();
  }
  if (playerCount > MAX_PLAYERS) {
    throw new MaxPlayersError();
  }
  // ensure there's a value for starting authorities and hand size for all players
  newGameState.players.forEach((player, index) => {
    if (gameStateWithOptions.options.startingAuthorityByPlayerIndex[index] === undefined) {
      gameStateWithOptions.options.startingAuthorityByPlayerIndex[index] =
        DEFAULT_STARTING_AUTHORITY;
    }
    if (gameStateWithOptions.options.startingCardsByPlayerIndex[index] === undefined) {
      gameStateWithOptions.options.startingCardsByPlayerIndex[index] = DEFAULT_TURN_CARDS;
    }
  });

  // Create a new game state with the initial supply, while resetting the player details
  newGameState.players = newGameState.players.map((player, index) => ({
    ...newPlayer(player.name, index),
    color: newGameState.players[index].color,
    authority: {
      authority: gameStateWithOptions.options.startingAuthorityByPlayerIndex[index],
    },
    newTurn: {
      ...DefaultTurnDetails(),
      cards: gameStateWithOptions.options.startingCardsByPlayerIndex[index],
    },
    turn: {
      ...DefaultTurnDetails(),
      cards: gameStateWithOptions.options.startingCardsByPlayerIndex[index],
    },
  }));
  newGameState.supply = calculateInitialSupply(gameStateWithOptions.players.length);
  newGameState.currentStep = CurrentStep.Game;
  newGameState.currentTurn = 1;
  newGameState.log = [
    {
      id: uuidv4(),
      timestamp: gameStart,
      gameTime: 0,
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

  return newGameState;
};

/**
 * Update the player field with the given increment.
 * @param game - The game state
 * @param playerIndex - The index of the player
 * @param field - The field to update
 * @param subfield - The subfield to update
 * @param increment - The amount to increment the field by
 * @param victoryTrash - Whether to trash the victory card (does not go back into supply)
 * @returns The updated game state
 */
export function updatePlayerField<T extends keyof PlayerFieldMap>(
  game: IGame,
  playerIndex: number,
  field: T,
  subfield: PlayerFieldMap[T],
  increment: number
): IGame {
  const updatedGame = deepClone<IGame>(game);
  if (playerIndex < 0 || playerIndex >= updatedGame.players.length) {
    throw new InvalidPlayerIndexError(playerIndex);
  }
  const player = updatedGame.players[playerIndex];

  // Check if the field is valid
  if (field !== 'authority' && field !== 'turn' && field !== 'newTurn') {
    throw new InvalidFieldError(field as string);
  }

  // Check if the subfield decrement would go below 0
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (((player[field] as any)[subfield] || 0) + increment < 0) {
    throw new NotEnoughSubfieldError(field, subfield);
  }

  // Perform the actual updates
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (player[field] as any)[subfield] = Math.max(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ((player[field] as any)[subfield] || 0) + increment,
    0
  );

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
    case GameLogAction.ADD_AUTHORITY:
    case GameLogAction.REMOVE_AUTHORITY:
      return { field: 'authority', subfield: 'authority' };
    case GameLogAction.ADD_TRADE:
    case GameLogAction.REMOVE_TRADE:
      return { field: 'turn', subfield: 'trade' };
    case GameLogAction.ADD_COMBAT:
    case GameLogAction.REMOVE_COMBAT:
      return { field: 'turn', subfield: 'combat' };
    case GameLogAction.ADD_CARDS:
    case GameLogAction.REMOVE_CARDS:
      return { field: 'turn', subfield: 'cards' };
    case GameLogAction.ADD_GAINS:
    case GameLogAction.REMOVE_GAINS:
      return { field: 'turn', subfield: 'gains' };
    case GameLogAction.ADD_DISCARD:
    case GameLogAction.REMOVE_DISCARD:
      return { field: 'turn', subfield: 'discard' };
    case GameLogAction.SCRAP:
      return { field: 'turn', subfield: 'scrap' };
    case GameLogAction.ADD_NEXT_TURN_TRADE:
    case GameLogAction.REMOVE_NEXT_TURN_TRADE:
      return { field: 'newTurn', subfield: 'trade' };
    case GameLogAction.ADD_NEXT_TURN_COMBAT:
    case GameLogAction.REMOVE_NEXT_TURN_COMBAT:
      return { field: 'newTurn', subfield: 'combat' };
    case GameLogAction.ADD_NEXT_TURN_CARDS:
    case GameLogAction.REMOVE_NEXT_TURN_CARDS:
      return { field: 'newTurn', subfield: 'cards' };
    case GameLogAction.ADD_NEXT_TURN_DISCARD:
    case GameLogAction.REMOVE_NEXT_TURN_DISCARD:
      return { field: 'newTurn', subfield: 'discard' };
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
 * @param currentPlayerIndex - The index of the current player in the game
 * @param playerCount - The number of players in the game
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
 * Rank players based on their authority.
 * @param players - The list of players
 *  * @returns An array of ranked players, sorted by score (descending) and then by name (ascending)
 */
export function rankPlayers(players: IPlayer[]): RankedPlayer[] {
  // Calculate scores for each player
  const playersWithScores = players.map((player, index) => ({
    index,
    score: player.authority.authority,
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
