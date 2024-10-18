import { IGame } from '@/game/interfaces/game';
import { IGameRaw } from '@/game/interfaces/game-raw';
import { v4 as uuidv4 } from 'uuid';
import { ISavedGameMetadata } from '@/game/interfaces/saved-game-metadata';
import { ISavedGameMetadataRaw } from '@/game/interfaces/saved-game-metadata-raw';
import { EmptyLogError } from '@/game/errors/empty-log';
import { GameLogActionWithCount } from '@/game/enumerations/game-log-action-with-count';
import { InvalidLogSaveGameError } from '@/game/errors/invalid-log-save-game';
import { NO_PLAYER, SaveGameStorageKey, SaveGameStorageKeyPrefix } from '@/game/constants';
import { addLogEntry } from '@/game/dominion-lib-log';
import { IPlayer } from '@/game/interfaces/player';
import { IGameSupply } from '@/game/interfaces/game-supply';
import { IGameOptions } from '@/game/interfaces/game-options';
import { ILogEntry } from '@/game/interfaces/log-entry';
import { ILogEntryRaw } from '@/game/interfaces/log-entry-raw';
import { IStorageService } from '@/game/interfaces/storage-service';

/**
 * Save the game data using the provided storage service.
 * @param game - The game data to save
 * @param storageService - The storage service to use
 * @param existingId - Optional existing game ID to overwrite
 * @returns The game ID under which the game data was saved
 */
export function saveGameData(
  game: IGame,
  storageService: IStorageService,
  existingId?: string
): string {
  const saveId = existingId || uuidv4();

  // Save the game data
  storageService.setItem(`${SaveGameStorageKeyPrefix}${saveId}`, JSON.stringify(game));

  return saveId;
}

/**
 * Save the game state using the provided storage service.
 * @param game - The game state
 * @param name - The name of the save
 * @param storageService - The storage service to use
 * @param existingId - Optional existing game ID to overwrite
 * @returns True if the game was saved successfully, false otherwise
 */
export function saveGame(
  game: IGame,
  name: string,
  storageService: IStorageService,
  existingId?: string
): boolean {
  // add the SAVE_GAME log entry
  addLogEntry(game, NO_PLAYER, GameLogActionWithCount.SAVE_GAME);
  try {
    const saveId = saveGameData(game, storageService, existingId);
    addToSavedGamesList(
      {
        id: saveId,
        name,
        savedAt: new Date(),
      },
      storageService
    );

    return true;
  } catch (error) {
    console.error('Error saving game:', error);
    return false;
  }
}

/**
 * Get the list of saved games using the provided storage service.
 * @param storageService - The storage service to use
 * @returns The list of saved games
 */
export function getSavedGamesList(storageService: IStorageService): ISavedGameMetadata[] {
  try {
    const jsonValue = storageService.getItem(SaveGameStorageKey);
    if (jsonValue != null) {
      const parsedGames: ISavedGameMetadata[] = safeParseSavedGameMetadata(jsonValue);
      return parsedGames
        .filter((game: ISavedGameMetadata) => game.id && game.name && game.savedAt)
        .map((game: ISavedGameMetadata) => ({
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
 * Restores the types in a game object by converting string dates to Date objects.
 * @param game - The game object to restore
 * @returns The restored game object with proper types
 * @throws Error if the game object is invalid or contains invalid dates
 */
export function restoreSavedGame(game: IGameRaw): IGame {
  if (!Array.isArray(game.log) || game.log.length === 0) {
    throw new EmptyLogError();
  }

  // Restore the timestamps in the log entries
  const newLog = game.log.map((log: ILogEntryRaw) => {
    if (!log.timestamp) {
      throw new Error('Invalid log entry timestamp');
    }
    const date = new Date(log.timestamp);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid log entry timestamp');
    }
    return {
      ...log,
      timestamp: date,
    } as ILogEntry;
  });

  const newGame: IGame = { ...game, log: newLog };

  // Now validate the game object after restoring dates
  if (!isValidGame(newGame)) {
    throw new Error('Invalid game object');
  }

  return newGame;
}

/**
 * Load a game using the provided storage service and add a log entry for the load event.
 * @param saveId - The ID of the save
 * @param storageService - The storage service to use
 * @returns The loaded game or null if not found
 */
export function loadGame(saveId: string, storageService: IStorageService): IGame | null {
  try {
    const gameString = storageService.getItem(`${SaveGameStorageKeyPrefix}${saveId}`);
    if (!gameString) {
      console.error(`No game found for saveId: ${saveId}`);
      return null;
    }

    let game: IGame;
    try {
      game = safeParseSavedGame(gameString); // Parse game as IGameRaw
    } catch (parseError) {
      console.error('Error parsing game JSON:', parseError);
      if (parseError instanceof EmptyLogError) {
        throw parseError;
      }
      return null;
    }

    game = loadGameAddLog(game); // Ensure this is called
    return game;
  } catch (error) {
    console.error('Error loading game:', error);
    if (error instanceof InvalidLogSaveGameError || error instanceof EmptyLogError) {
      throw error;
    }
    return null;
  }
}

/**
 * Delete a saved game using the provided storage service.
 * @param gameId - The ID of the save to delete
 * @param storageService - The storage service to use
 * @returns True if the game was deleted successfully, false otherwise
 */
export function deleteSavedGame(gameId: string, storageService: IStorageService): boolean {
  try {
    const savedGames: ISavedGameMetadata[] = getSavedGamesList(storageService);

    // Find the index of the game to delete
    const gameIndex = savedGames.findIndex((game) => game.id === gameId);

    if (gameIndex !== -1) {
      savedGames.splice(gameIndex, 1);
      updateSavedGamesList(savedGames, storageService);
    }

    // Always remove the game data
    storageService.removeItem(`${SaveGameStorageKeyPrefix}${gameId}`);

    return true;
  } catch (error) {
    console.error('Error deleting saved game:', error);
    return true;
  }
}

/**
 * Update the saved games list using the provided storage service.
 * @param savedGames - The updated list of saved games
 * @param storageService - The storage service to use
 */
export function updateSavedGamesList(
  savedGames: ISavedGameMetadata[],
  storageService: IStorageService
): void {
  try {
    storageService.setItem(SaveGameStorageKey, JSON.stringify(savedGames));
  } catch (error) {
    console.error('Error updating saved games list:', error);
  }
}

/**
 * Add a new saved game to the list using the provided storage service.
 * If the game already exists, update it in its original position.
 * @param newGame - The new game metadata to add or update
 * @param storageService - The storage service to use
 * @returns The updated list of saved games
 */
export function addToSavedGamesList(
  newGame: ISavedGameMetadata,
  storageService: IStorageService
): ISavedGameMetadata[] {
  try {
    const savedGames = getSavedGamesList(storageService);
    const existingIndex = savedGames.findIndex((game) => game.id === newGame.id);

    if (existingIndex !== -1) {
      // Update the existing game in its original position
      savedGames[existingIndex] = newGame;
    } else {
      // Add the new game to the end of the list
      savedGames.push(newGame);
    }

    updateSavedGamesList(savedGames, storageService);
    return savedGames;
  } catch (error) {
    console.error('Error adding game to saved games list:', error); // Updated to match test
    return getSavedGamesList(storageService); // Return the current list without changes
  }
}

/**
 * Load a game and add a log entry for the load event.
 * @param gameState - The game state
 * @returns The updated game state
 */
export function loadGameAddLog(gameState: IGame): IGame {
  if (gameState.log.length === 0) {
    throw new EmptyLogError();
  }
  const savedGameLog = gameState.log[gameState.log.length - 1];
  if (savedGameLog.action !== GameLogActionWithCount.SAVE_GAME) {
    throw new InvalidLogSaveGameError();
  }
  addLogEntry(gameState, NO_PLAYER, GameLogActionWithCount.LOAD_GAME, {
    linkedAction: savedGameLog.id,
  });
  return gameState;
}

/**
 * For a given saved game metadata, restore the dates
 */
export function restoreSavedGameMetadata(
  savedGames: ISavedGameMetadataRaw[]
): ISavedGameMetadata[] {
  const newGames: ISavedGameMetadata[] = savedGames.map(
    (savedGame: ISavedGameMetadataRaw): ISavedGameMetadata => {
      if (savedGame && typeof savedGame.savedAt === 'string') {
        const date = new Date(savedGame.savedAt);
        if (isNaN(date.getTime())) {
          throw new Error('Invalid saved game metadata');
        }
        return {
          ...savedGame,
          savedAt: date,
        } as ISavedGameMetadata;
      }
      throw new Error('Invalid saved game metadata');
    }
  );
  return newGames;
}

/**
 * Parse JSON safely and return the result or throw if parsing fails
 */
export function safeParseSavedGame(jsonString: string): IGame {
  if (!jsonString) {
    throw new Error('Invalid game JSON');
  }

  try {
    return restoreSavedGame(JSON.parse(jsonString) as IGameRaw);
  } catch (error) {
    console.error('Error parsing game JSON:', error);
    throw error;
  }
}

/**
 * Parse JSON safely and return the result or an empty array if parsing fails.
 * @param jsonString - The JSON string to parse
 * @returns The parsed JSON or an empty array
 */
export function safeParseSavedGameMetadata(jsonString: string): ISavedGameMetadata[] {
  if (!jsonString) {
    return [];
  }

  try {
    return restoreSavedGameMetadata(JSON.parse(jsonString) as ISavedGameMetadataRaw[]);
  } catch (error) {
    console.error('Error parsing saved games JSON:', error);
    return [];
  }
}

/**
 * Helper function to validate the game object structure.
 * @param game - The game object to validate
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
