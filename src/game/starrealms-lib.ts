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
  DefaultPlayerColorsWithBoss,
  BossColor,
  NOT_PRESENT,
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
import { IAuthorityDetails } from './interfaces/authority-details';

/**
 * Updates a specific authority subfield for a player by applying the given increment.
 *
 * This function adjusts the value of a designated subfield in the player's authority details,
 * ensuring that the result is not negative. If the new value would be below zero, it throws a
 * {@link NotEnoughSubfieldError} to prevent invalid state.
 *
 * @param playerAuthority - The player's authority details.
 * @param subfield - The subfield within the authority details to update.
 * @param increment - The value to add to the current subfield value.
 *
 * @throws {NotEnoughSubfieldError} If the update would result in a negative value.
 */
function updateAuthorityDetail(
  playerAuthority: IAuthorityDetails,
  subfield: keyof IAuthorityDetails,
  increment: number
): void {
  const currentVal = playerAuthority[subfield] || 0;
  if (currentVal + increment < 0) {
    throw new NotEnoughSubfieldError('authority', subfield);
  }
  playerAuthority[subfield] = currentVal + increment;
}
/**
 * Updates a player's turn detail by adding the specified increment to the provided subfield.
 *
 * If the resulting value would be negative, a {@link NotEnoughSubfieldError} is thrown.
 *
 * @param playerTurn The player's current turn details.
 * @param subfield The property of the turn details to update.
 * @param increment The value to add to the subfield (can be positive or negative).
 *
 * @throws {NotEnoughSubfieldError} Thrown when the updated subfield value would be negative.
 */
function updateTurnDetail(
  playerTurn: IPlayerGameTurnDetails,
  subfield: keyof IPlayerGameTurnDetails,
  increment: number
): void {
  const currentVal = playerTurn[subfield] || 0;
  if (currentVal + increment < 0) {
    throw new NotEnoughSubfieldError('turn', subfield); // Or 'newTurn' depending on context
  }
  playerTurn[subfield] = Math.max(currentVal + increment, 0);
}

// --- End Helper Functions ---

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
  updatedGame.players = updatedGame.players.map((player, index) => ({
    ...player,
    authority: {
      ...EmptyAuthorityDetails(),
      authority:
        updatedGame.options.startingAuthorityByPlayerIndex[index] ?? DEFAULT_STARTING_AUTHORITY,
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
 * @param boss - Whether the player is the boss
 * @param color - The color of the player
 * @returns The new player object
 */
export function newPlayer(playerName: string, boss: boolean, color: string): IPlayer {
  const newPlayer: IPlayer = {
    name: playerName.trim(),
    color: boss ? BossColor : color,
    turn: DefaultTurnDetails(),
    newTurn: DefaultTurnDetails(),
    authority: EmptyAuthorityDetails(),
    boss,
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
    ...newPlayer(player.name, player.boss, newGameState.players[index].color),
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
      playerIndex: 0,
      currentPlayerIndex: 0,
      turn: 1,
      action: GameLogAction.START_GAME,
    } as ILogEntry,
  ];
  newGameState.selectedPlayerIndex = 0;
  newGameState.currentPlayerIndex = 0;

  // Distribute initial supply to players
  newGameState = distributeInitialSupply(newGameState);

  return newGameState;
};

/**
 * Updates a specified field for a given player in the game state.
 *
 * This function creates a deep copy of the game state and modifies a particular field on the player,
 * delegating the update to specific helper functions based on the field type:
 * - For the 'victory' field, it verifies that the game supply has enough cards for subfields corresponding
 *   to card piles (such as estates, duchies, provinces, colonies, or curses) and adjusts the supply accordingly,
 *   unless the update is marked as a trash operation.
 * - For 'turn', 'mats', and 'newTurn', it updates the corresponding subfield using their respective helpers.
 *
 * @param game - The current game state.
 * @param playerIndex - The index of the player to update.
 * @param field - The player field to update (either 'victory', 'turn', 'mats', or 'newTurn').
 * @param subfield - The specific subfield within the selected field to update.
 * @param increment - The amount to adjust the subfield by.
 * @param victoryTrash - When updating the 'victory' field, if true, the increment does not affect the supply.
 * @returns The new game state with the updated player field.
 *
 * @throws {InvalidPlayerIndexError} If the player index is out of bounds.
 * @throws {NotEnoughSupplyError} If there is insufficient supply when decrementing a victory subfield.
 * @throws {InvalidFieldError} If the provided field type is not recognized.
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

  if (field === 'authority') {
    updateAuthorityDetail(player.authority, subfield as keyof IAuthorityDetails, increment);
  } else if (field === 'turn') {
    updateTurnDetail(player.turn, subfield as keyof IPlayerGameTurnDetails, increment);
  } else if (field === 'newTurn') {
    // Assuming newTurn has the same structure as turn for subfields
    updateTurnDetail(player.newTurn, subfield as keyof IPlayerGameTurnDetails, increment);
  } else {
    // This path should be unreachable due to the generic constraint
    throw new InvalidFieldError(`Unhandled field type: ${field as string}`);
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
    case GameLogAction.ADD_AUTHORITY:
    case GameLogAction.REMOVE_AUTHORITY:
      return { field: 'authority', subfield: 'authority' };
    case GameLogAction.ADD_ASSIMILATION:
    case GameLogAction.REMOVE_ASSIMILATION:
      return { field: 'authority', subfield: 'assimilation' };
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

/**
 * Whether the game is being played against a Boss
 * @param players The game's players array
 * @returns True if any of the players (should only be one or none) are a Boss.
 */
export function hasBoss(players: IPlayer[]): boolean {
  return players.some((value) => value.boss === true);
}

/**
 * Returns the next available player color from the appropriate color palette.
 * @param players An array of players with color properties
 * @param bossEnabled Whether the boss mode is enabled
 * @returns The next available color string
 * @throws Error if there are no more available colors
 */
export function getNextAvailablePlayerColor(
  players: Array<{ color: string }>,
  bossEnabled: boolean
): string {
  // Choose the appropriate color palette
  const colorPalette = bossEnabled ? DefaultPlayerColorsWithBoss : DefaultPlayerColors;

  // Get the set of colors currently in use
  const usedColors = new Set(
    players.filter((player) => player.color !== undefined).map((player) => player.color)
  );

  // Find the first color in the palette that isn't used
  for (const color of colorPalette) {
    if (!usedColors.has(color)) {
      return color;
    }
  }

  throw new Error('No available colors found.');
}

/**
 * Return the first turn the boss will take
 * @param gameState The game state
 * @returns The turn number the boss will take their first turn
 */
export function getFirstBossTurn(gameState: IGame): number {
  if (!hasBoss(gameState.players)) {
    return NOT_PRESENT;
  }
  /* the boss must wait for all players to have N turns before taking their first turn
   * if the wait (W) is one turn, and there are 2 human players (P=3), then by turn 3 the boss will take their first turn
   * if the wait (W) is two turns and there are 3 human players (P=4), then by turn 7 the boss will take their first turn
   * P * W + 1
   * W = 1, P = 3: 0x -> 1 -> 2 -> 0 (Boss) - turn 4
   * 3 * 1 + 1 = 4
   * W = 1, P = 4: 0x -> 1 -> 2 -> 3 -> 0 (Boss) - turn 5
   * 4 * 1 + 1 = 5
   * W = 2, P = 4: 0x -> 1 -> 2 -> 3 -> 0x -> 1 -> 2 -> 3 -> 0 (Boss) - turn 9
   * 4 * 2 + 1 = 9
   */
  return gameState.players.length * (gameState.options.bossStartTurn ?? 0) + 1;
}

// Fisher-Yates shuffle algorithm
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
export function shuffleArray<T extends unknown>(array: T[]): { shuffled: T[]; changed: boolean } {
  // Create a copy of the original array for comparison
  const original = [...array];

  // Create another copy for shuffling
  const shuffled = [...array];

  // Fisher-Yates shuffle algorithm
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Compare with the original copy to check if anything changed
  let changed = false;
  for (let i = 0; i < shuffled.length; i++) {
    if (shuffled[i] !== original[i]) {
      changed = true;
      break;
    }
  }

  return { shuffled, changed };
}

/**
 * Returns the first uppercase printable character from the specified player's name, or the player's number as a fallback.
 *
 * The function inspects the player's name for a printable ASCII character. If the player's index is out of bounds,
 * the name is missing or invalid, or no printable character is found, it returns the player's number (index + 1) as a string.
 *
 * @param players - The array of player objects.
 * @param playerIndex - The index of the target player in the array.
 * @returns The uppercase printable character from the player's name, or the player's number as a string.
 */
export function getPlayerLabel(players: IPlayer[], playerIndex: number) {
  // Return player number if index is invalid
  if (!players || !Array.isArray(players) || playerIndex < 0 || playerIndex >= players.length) {
    return String(playerIndex + 1);
  }

  const player = players[playerIndex];

  // Check if player or player.name is valid
  if (!player || !player.name || typeof player.name !== 'string') {
    return String(playerIndex + 1);
  }

  // Loop through name characters to find first printable one
  for (let i = 0; i < player.name.length; i++) {
    const char = player.name.charAt(i);

    // Check if character is a printable ASCII character
    // This regex matches alphanumeric characters and common printable symbols
    // eslint-disable-next-line no-useless-escape
    if (/^[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]$/.test(char)) {
      return char.toUpperCase();
    }
  }

  // Fallback to player number if no printable characters found
  return String(playerIndex + 1);
}
