import { IGame } from '@/game/interfaces/game';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { ISavedGameMetadata } from '@/game/interfaces/saved-game-metadata';
import { EmptyLogError } from '@/game/errors/empty-log';
import { GameLogActionWithCount } from '@/game/enumerations/game-log-action-with-count';
import { InvalidLogSaveGameError } from '@/game/errors/invalid-log-save-game';
import { NO_PLAYER, SaveGameStorageKey, SaveGameStorageKeyPrefix } from '@/game/constants';
import { addLogEntry } from '@/game/dominion-lib.log';
import { IPlayer } from '@/game/interfaces/player';
import { IGameSupply } from '@/game/interfaces/game-supply';
import { IGameOptions } from '@/game/interfaces/game-options';
import { ILogEntry } from '@/game/interfaces/log-entry';

/**
 * Save the game state to local storage.
 * @param game - The game state
 * @param saveName - The name of the save
 * @param saveId - The ID of the save (used to overwrite an existing save)
 */
export async function saveGame(game: IGame, name: string, existingId?: string): Promise<boolean> {
  const saveId = existingId || uuidv4();

  try {
    // Save the game data
    await AsyncStorage.setItem(`${SaveGameStorageKeyPrefix}${saveId}`, JSON.stringify(game));

    // Update the saved games list
    const savedGamesJson = await AsyncStorage.getItem(SaveGameStorageKey);
    let savedGames: ISavedGameMetadata[] = savedGamesJson ? JSON.parse(savedGamesJson) : [];

    const newSavedGame: ISavedGameMetadata = {
      id: saveId,
      name,
      savedAt: new Date(),
    };

    if (existingId) {
      savedGames = savedGames.filter((game) => game.id !== existingId);
    }
    savedGames.unshift(newSavedGame);

    await AsyncStorage.setItem(SaveGameStorageKey, JSON.stringify(savedGames));

    return true;
  } catch (error) {
    console.error('Error saving game:', error);
    return false;
  }
}

/**
 * Get the list of saved games from local storage.
 * @returns The list of saved games
 */
export async function getSavedGamesList(): Promise<ISavedGameMetadata[]> {
  try {
    const jsonValue = await AsyncStorage.getItem(SaveGameStorageKey);
    if (jsonValue != null) {
      const parsedGames = JSON.parse(jsonValue);
      return parsedGames.map((game: any) => ({
        ...game,
        savedAt: new Date(game.savedAt),
      }));
    }
    return [];
  } catch (e) {
    console.error('Error getting saved games list:', e);
    return [];
  }
}

/**
 * Load a game from local storage and add a log entry for the load event.
 * @param gameState - The game state
 * @returns The updated game state
 */
export function loadGameAddLog(gameState: IGame): IGame {
  /* when loading a game, the most recent entry should be a save game event.
   * we're going to use that id and create a linked entry for new log entry.
   */
  if (gameState.log.length === 0) {
    throw new EmptyLogError();
  }
  const lastLog = gameState.log[gameState.log.length - 1];
  if (lastLog.action !== GameLogActionWithCount.SAVE_GAME) {
    throw new InvalidLogSaveGameError();
  }
  addLogEntry(gameState, NO_PLAYER, GameLogActionWithCount.LOAD_GAME, undefined, false, lastLog.id);
  return gameState;
}

/** Helper function to validate the game object structure
 * @param game - The game object
 * @returns Whether the game object is valid
 */
export function isValidGame(game: any): game is IGame {
  const isValidPlayer = (player: any): player is IPlayer => {
    return (
      typeof player.name === 'string' &&
      typeof player.mats === 'object' &&
      typeof player.turn === 'object' &&
      typeof player.newTurn === 'object' &&
      typeof player.victory === 'object'
    );
  };

  const isValidSupply = (supply: any): supply is IGameSupply => {
    return (
      typeof supply === 'object' &&
      typeof supply.estates === 'number' &&
      typeof supply.duchies === 'number' &&
      typeof supply.provinces === 'number' &&
      typeof supply.coppers === 'number' &&
      typeof supply.silvers === 'number' &&
      typeof supply.golds === 'number' &&
      typeof supply.curses === 'number' &&
      typeof supply.colonies === 'number' &&
      typeof supply.platinums === 'number'
    );
  };

  const isValidOptions = (options: any): options is IGameOptions => {
    return (
      typeof options === 'object' &&
      typeof options.curses === 'boolean' &&
      typeof options.expansions === 'object' &&
      typeof options.mats === 'object'
    );
  };

  const isValidLogEntry = (logEntry: any): logEntry is ILogEntry => {
    return (
      typeof logEntry.id === 'string' &&
      logEntry.timestamp instanceof Date &&
      typeof logEntry.playerIndex === 'number' &&
      typeof logEntry.action === 'string'
    );
  };

  return (
    game !== null &&
    game !== undefined &&
    Array.isArray(game.players) &&
    game.players.every(isValidPlayer) &&
    isValidSupply(game.supply) &&
    isValidOptions(game.options) &&
    Array.isArray(game.log) &&
    game.log.every(isValidLogEntry) &&
    typeof game.currentTurn === 'number' &&
    typeof game.currentPlayerIndex === 'number' &&
    typeof game.firstPlayerIndex === 'number' &&
    typeof game.selectedPlayerIndex === 'number' &&
    typeof game.currentStep === 'number' &&
    typeof game.setsRequired === 'number'
  );
}

/**
 * Load a game from local storage.
 * @param saveId - The ID of the save
 * @returns The loaded game
 */
export async function loadGame(saveId: string): Promise<IGame | null> {
  try {
    const gameString = await AsyncStorage.getItem(`${SaveGameStorageKeyPrefix}${saveId}`);
    if (!gameString) {
      console.log(`No game found for saveId: ${saveId}`);
      return null;
    }

    let game: IGame;
    try {
      game = JSON.parse(gameString);
    } catch (parseError) {
      console.error('Error parsing game JSON:', parseError);
      return null;
    }

    game = loadGameAddLog(game);
    return game;
  } catch (error) {
    console.error('Error loading game:', error);
    return null;
  }
}

/**
 * Delete a saved game from local storage.
 * @param saveId - The ID of the save
 */
export async function deleteSavedGame(gameId: string): Promise<boolean> {
  try {
    // Get the current saved games list
    const savedGamesJson = await AsyncStorage.getItem(SaveGameStorageKey);
    let savedGames: { id: string; name: string }[] = [];

    if (savedGamesJson) {
      try {
        savedGames = JSON.parse(savedGamesJson);
      } catch (error) {
        console.error('Error parsing saved games JSON:', error);
        // If there's an error parsing, we'll work with an empty array
      }
    }

    // Find the index of the game to delete
    const gameIndex = savedGames.findIndex((game) => game.id === gameId);

    if (gameIndex === -1) {
      // Game not found in the list, but we'll still try to remove its data
      await AsyncStorage.removeItem(`${SaveGameStorageKeyPrefix}${gameId}`);
      return true;
    }

    // Remove the game from the list
    savedGames.splice(gameIndex, 1);

    // Update the saved games list
    await AsyncStorage.setItem(SaveGameStorageKey, JSON.stringify(savedGames));

    // Remove the game data
    await AsyncStorage.removeItem(`${SaveGameStorageKeyPrefix}${gameId}`);

    return true;
  } catch (error) {
    console.error('Error deleting saved game:', error);
    return false;
  }
}
