import { IGame } from '@/game/interfaces/game';
import { IGameRaw } from '@/game/interfaces/game-raw';
import { v4 as uuidv4 } from 'uuid';
import { ISavedGameMetadata } from '@/game/interfaces/saved-game-metadata';
import { ISavedGameMetadataRaw } from '@/game/interfaces/saved-game-metadata-raw';
import { EmptyLogError } from '@/game/errors/empty-log';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import { InvalidLogSaveGameError } from '@/game/errors/invalid-log-save-game';
import {
  DefaultGameOptions,
  LAST_COMPATIBLE_SAVE_VERSION,
  NO_PLAYER,
  SaveGameStorageKey,
  SaveGameStorageKeyPrefix,
} from '@/game/constants';
import { addLogEntry } from '@/game/dominion-lib-log';
import { IPlayer } from '@/game/interfaces/player';
import { IGameSupply } from '@/game/interfaces/game-supply';
import { IGameOptions } from '@/game/interfaces/game-options';
import { ILogEntry } from '@/game/interfaces/log-entry';
import { IStorageService } from '@/game/interfaces/storage-service';
import { IEventTimeCache } from '@/game/interfaces/event-time-cache';
import { ILogEntryRaw } from '@/game/interfaces/log-entry-raw';
import { deepClone } from '@/game/utils';
import { IEventTimeCacheRaw } from '@/game/interfaces/event-time-cache-raw';
import { gt } from 'semver';
import { IncompatibleSaveError } from '@/game/errors/incompatible-save';
import { rebuildCaches } from '@/game/dominion-lib-time';
import { IRenaissanceFeatures } from '@/game/interfaces/set-features/renaissance';
import { IRisingSunFeatures } from '@/game/interfaces/set-features/rising-sun';
import { ITurnStatisticsRaw } from '@/game/interfaces/turn-statistics-raw';
import { ITurnStatistics } from '@/game/interfaces/turn-statistics';

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
  storageService.setItem(
    `${SaveGameStorageKeyPrefix}${saveId}`,
    JSON.stringify(convertGameToGameRaw(game))
  );

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
  existingId?: string,
  saveDate?: Date
): boolean {
  if (game.log.length === 0) {
    throw new EmptyLogError();
  }
  const lastLog = game.log[game.log.length - 1];
  const isPaused = lastLog.action === GameLogAction.PAUSE;
  const isEnded = lastLog.action === GameLogAction.END_GAME;
  if (isPaused) {
    // remove the PAUSE log entry
    game.log.pop();
    // insert the new SAVE_GAME log entry before the PAUSE entry
    addLogEntry(game, NO_PLAYER, GameLogAction.SAVE_GAME, { timestamp: lastLog.timestamp });
    // add the PAUSE log entry back after the new SAVE_GAME log entry
    game.log.push(lastLog);
  } else if (!isEnded) {
    // add the SAVE_GAME log entry normally
    addLogEntry(game, NO_PLAYER, GameLogAction.SAVE_GAME);
  }
  try {
    const saveId = saveGameData(game, storageService, existingId);
    addToSavedGamesList(
      {
        id: saveId,
        name,
        savedAt: saveDate ?? new Date(),
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
 * Converts a game object to a raw game object.
 * @param gameRaw - The raw game object to convert
 * @returns The raw game object with proper types for storage
 */
export function convertGameRawToGame(gameRaw: IGameRaw): IGame {
  const convertTimestamp = (timestamp: string | number | Date): Date => {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid timestamp: ${timestamp}`);
    }
    return date;
  };
  const game: IGame = {
    ...gameRaw,
    log: gameRaw.log.map((entry) => ({
      ...deepClone<ILogEntryRaw>(entry),
      timestamp: convertTimestamp(entry.timestamp),
    })) as ILogEntry[],
    timeCache: gameRaw.timeCache.map((cache) => ({
      ...deepClone<IEventTimeCacheRaw>(cache),
      saveStartTime: cache.saveStartTime ? convertTimestamp(cache.saveStartTime) : null,
      pauseStartTime: cache.pauseStartTime ? convertTimestamp(cache.pauseStartTime) : null,
    })) as IEventTimeCache[],
    turnStatisticsCache: gameRaw.turnStatisticsCache.map((cache) => ({
      ...deepClone<ITurnStatisticsRaw>(cache),
      start: convertTimestamp(cache.start),
      end: convertTimestamp(cache.end),
    })),
    expansions: {
      renaissance: deepClone<IRenaissanceFeatures>(gameRaw.expansions.renaissance),
      risingSun: deepClone<IRisingSunFeatures>(gameRaw.expansions.risingSun),
    },
    pendingGroupedActions: gameRaw.pendingGroupedActions.map((entry) => ({
      ...deepClone<Partial<ILogEntryRaw>>(entry),
      ...(entry.timestamp ? { timestamp: convertTimestamp(entry.timestamp) } : {}),
    })) as ILogEntry[],
  };
  return game;
}

/**
 * Converts a game object to a raw game object.
 * @param game - The game object to convert
 * @returns The raw game object with proper types for storage
 */
export function convertGameToGameRaw(game: IGame): IGameRaw {
  return {
    ...deepClone<IGame>(game),
    log: game.log.map((logEntry) => ({
      ...deepClone<ILogEntry>(logEntry),
      timestamp:
        logEntry.timestamp instanceof Date
          ? logEntry.timestamp.toISOString()
          : new Date(logEntry.timestamp).toISOString(), // Ensure timestamp is a Date object
    })) as ILogEntryRaw[],
    timeCache: game.timeCache.map((timeCache) => ({
      ...deepClone<IEventTimeCache>(timeCache),
      saveStartTime: timeCache.saveStartTime
        ? timeCache.saveStartTime instanceof Date
          ? timeCache.saveStartTime.toISOString()
          : new Date(timeCache.saveStartTime).toISOString()
        : null,
      pauseStartTime: timeCache.pauseStartTime
        ? timeCache.pauseStartTime instanceof Date
          ? timeCache.pauseStartTime.toISOString()
          : new Date(timeCache.pauseStartTime).toISOString()
        : null,
    })) as IEventTimeCacheRaw[],
    turnStatisticsCache: game.turnStatisticsCache.map((turnStatistics) => ({
      ...deepClone<ITurnStatistics>(turnStatistics),
      start:
        turnStatistics.start instanceof Date
          ? turnStatistics.start.toISOString()
          : turnStatistics.start,
      end:
        turnStatistics.end instanceof Date ? turnStatistics.end.toISOString() : turnStatistics.end,
    })),
    expansions: {
      renaissance: deepClone<IRenaissanceFeatures>(game.expansions.renaissance),
      risingSun: deepClone<IRisingSunFeatures>(game.expansions.risingSun),
    },
    pendingGroupedActions: game.pendingGroupedActions.map((logEntry) => ({
      ...deepClone<Partial<ILogEntry>>(logEntry),
      ...(logEntry.timestamp
        ? {
            timestamp:
              logEntry.timestamp instanceof Date
                ? logEntry.timestamp.toISOString()
                : new Date(logEntry.timestamp).toISOString(), // Ensure timestamp is a Date object
          }
        : {}),
    })) as ILogEntryRaw[],
  };
}

/**
 * Restores the types in a game object by converting string dates to Date objects.
 * @param game - The game object to restore
 * @returns The restored game object with proper types
 * @throws Error if the game object is invalid or contains invalid dates
 */
export function restoreSavedGame(gameRaw: IGameRaw): IGame {
  if (!Array.isArray(gameRaw.log) || gameRaw.log.length === 0) {
    throw new EmptyLogError();
  }

  if (
    gameRaw.gameVersion === undefined ||
    gameRaw.gameVersion.length === 0 ||
    gt(LAST_COMPATIBLE_SAVE_VERSION, gameRaw.gameVersion)
  ) {
    throw new IncompatibleSaveError(
      gameRaw.gameVersion ?? 'undefined',
      LAST_COMPATIBLE_SAVE_VERSION
    );
  }

  try {
    const game: IGame = convertGameRawToGame(gameRaw);

    if (!isValidGame(game)) {
      throw new Error('Invalid game object');
    }

    return game;
  } catch (error) {
    console.error('Error restoring saved game:', error);
    throw error;
  }
}

/**
 * Get the game data from the provided storage service.
 * @param saveId - The ID of the save
 * @param storageService - The storage service to use
 * @returns The game data or null if not found
 */
export function loadGameJsonFromStorage(
  saveId: string,
  storageService: IStorageService
): string | null {
  const gameString = storageService.getItem(`${SaveGameStorageKeyPrefix}${saveId}`);
  if (!gameString) {
    console.error(`No game found for saveId: ${saveId}`);
    return null;
  }
  return gameString;
}

/**
 * Load a game using the provided storage service and add a log entry for the load event.
 * @param saveId - The ID of the save
 * @param storageService - The storage service to use
 * @param loadTime - The date the game was loaded
 * @returns The loaded game or null if not found
 */
export function loadGame(
  saveId: string,
  storageService: IStorageService,
  loadTime: Date
): IGame | null {
  try {
    const gameString = loadGameJsonFromStorage(saveId, storageService);
    if (!gameString) {
      return null;
    }

    let game: IGame;
    try {
      game = safeParseSavedGame(gameString);
    } catch (parseError) {
      console.error('Error parsing game JSON:', parseError);
      if (parseError instanceof EmptyLogError) {
        throw parseError;
      }
      return null;
    }

    game = loadGameAddLog(game, loadTime);
    const { timeCache, turnStatisticsCache } = rebuildCaches(game);
    game.timeCache = timeCache;
    game.turnStatisticsCache = turnStatisticsCache;

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
export function loadGameAddLog(gameState: IGame, loadTime: Date): IGame {
  if (gameState.log.length === 0) {
    throw new EmptyLogError();
  }
  let lastGameLog = gameState.log[gameState.log.length - 1];
  // special case, if the last log entry is a PAUSE, then we need to remove the PAUSE log entry
  // the save entry will have the time of the pause, so the game time calculations will still be correct
  if (lastGameLog.action === GameLogAction.PAUSE) {
    gameState.log.pop();
    if (gameState.log.length === 0) {
      throw new EmptyLogError();
    }
    lastGameLog = gameState.log[gameState.log.length - 1];
  }
  if (
    lastGameLog.action !== GameLogAction.SAVE_GAME &&
    lastGameLog.action !== GameLogAction.END_GAME
  ) {
    throw new InvalidLogSaveGameError();
  }
  if (lastGameLog.action !== GameLogAction.END_GAME) {
    addLogEntry(gameState, NO_PLAYER, GameLogAction.LOAD_GAME, {
      timestamp: loadTime,
      linkedActionId: lastGameLog.id,
    });
  }
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
    const parsed = JSON.parse(jsonString) as IGameRaw;
    return restoreSavedGame({ ...{ options: DefaultGameOptions() }, ...parsed });
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
export function isValidGame(game: unknown): game is IGame {
  if (typeof game !== 'object' || game === null) {
    return false;
  }

  const g = game as Record<string, unknown>;

  const isValidPlayer = (player: unknown): player is IPlayer => {
    if (typeof player !== 'object' || player === null) return false;
    const p = player as Record<string, unknown>;
    return (
      typeof p.name === 'string' &&
      typeof p.mats === 'object' &&
      typeof p.turn === 'object' &&
      typeof p.newTurn === 'object' &&
      typeof p.victory === 'object'
    );
  };

  const isValidSupply = (supply: unknown): supply is IGameSupply => {
    if (typeof supply !== 'object' || supply === null) return false;
    const s = supply as Record<string, unknown>;
    return (
      typeof s.estates === 'number' &&
      typeof s.duchies === 'number' &&
      typeof s.provinces === 'number' &&
      typeof s.coppers === 'number' &&
      typeof s.silvers === 'number' &&
      typeof s.golds === 'number' &&
      typeof s.curses === 'number' &&
      typeof s.colonies === 'number' &&
      typeof s.platinums === 'number'
    );
  };

  const isValidOptions = (options: unknown): options is IGameOptions => {
    if (typeof options !== 'object' || options === null) return false;
    const o = options as Record<string, unknown>;
    return (
      typeof o.curses === 'boolean' &&
      typeof o.expansions === 'object' &&
      typeof o.mats === 'object'
    );
  };

  const isValidLogEntry = (logEntry: unknown): logEntry is ILogEntry => {
    if (typeof logEntry !== 'object' || logEntry === null) return false;
    const l = logEntry as Record<string, unknown>;
    return (
      typeof l.id === 'string' &&
      l.timestamp instanceof Date &&
      typeof l.playerIndex === 'number' &&
      typeof l.action === 'string'
    );
  };

  return (
    Array.isArray(g.players) &&
    g.players.every(isValidPlayer) &&
    isValidSupply(g.supply) &&
    isValidOptions(g.options) &&
    Array.isArray(g.log) &&
    g.log.every(isValidLogEntry) &&
    typeof g.currentTurn === 'number' &&
    typeof g.currentPlayerIndex === 'number' &&
    typeof g.firstPlayerIndex === 'number' &&
    typeof g.selectedPlayerIndex === 'number' &&
    typeof g.currentStep === 'number' &&
    typeof g.setsRequired === 'number'
  );
}
