import { IGame } from '@/game/interfaces/game';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import { IEventTimeCache } from '@/game/interfaces/event-time-cache';
import { ILogEntry } from '@/game/interfaces/log-entry';
import { ITurnStatistics } from '@/game/interfaces/turn-statistics';
import { calculateVictoryPoints, NewGameState } from '@/game/dominion-lib';
import { deepClone } from '@/game/utils';
import { applyLogAction, getGameStartTime, getTurnStartTime } from '@/game/dominion-lib-log';

/**
 * Updates the time cache for a given game.
 * @param game - The game object containing log entries and existing time cache.
 * @returns An updated array of IEventTimeCache objects.
 */
export function updateCache(game: IGame): IEventTimeCache[] {
  const { log, timeCache } = game;
  let startGameTime: Date | null = null;
  let totalPauseTime = 0;
  let turnPauseTime = 0;
  let inSaveState = false;
  let inPauseState = false;
  let saveStartTime: Date | null = null;
  let pauseStartTime: Date | null = null;

  // Validate the cache and find the last valid cache entry
  const lastValidCacheEntryIndex = validateCache(log, timeCache || []);
  if (lastValidCacheEntryIndex === log.length - 1 || log.length == 0) {
    return game.timeCache || [];
  }

  // Ensure the first log entry is START_GAME
  if (log.length === 0 || log[0].action !== GameLogAction.START_GAME) {
    console.error('Invalid log: First entry must be START_GAME');
    return []; // Return an empty array for invalid logs
  }

  startGameTime = new Date(log[0].timestamp);

  if (lastValidCacheEntryIndex !== -1) {
    const lastValidCacheEntry = timeCache[lastValidCacheEntryIndex];
    totalPauseTime = lastValidCacheEntry.totalPauseTime;
    turnPauseTime = lastValidCacheEntry.turnPauseTime;
    inSaveState = lastValidCacheEntry.inSaveState;
    inPauseState = lastValidCacheEntry.inPauseState;
    saveStartTime = lastValidCacheEntry.saveStartTime
      ? new Date(lastValidCacheEntry.saveStartTime)
      : null;
    pauseStartTime = lastValidCacheEntry.pauseStartTime
      ? new Date(lastValidCacheEntry.pauseStartTime)
      : null;
  }

  const newCache: Array<IEventTimeCache> = [
    ...(timeCache || []).slice(0, lastValidCacheEntryIndex + 1),
  ];

  // Process log entries from the last valid cache entry up to the end
  for (let i = lastValidCacheEntryIndex + 1; i < log.length; i++) {
    const entry = log[i];
    const { action, timestamp } = entry;

    // Ensure timestamp is a Date object
    const entryTimestamp = new Date(timestamp);

    // Update the state based on the log entry
    if (action === GameLogAction.SAVE_GAME) {
      if (!inSaveState) {
        inSaveState = true;
        saveStartTime = entryTimestamp;
      }
    } else if (action === GameLogAction.LOAD_GAME) {
      if (inSaveState && saveStartTime !== null) {
        const saveDuration = entryTimestamp.getTime() - saveStartTime.getTime();
        totalPauseTime += saveDuration;
        turnPauseTime += saveDuration;
        inSaveState = false;
        saveStartTime = null;
      }
    } else if (action === GameLogAction.PAUSE) {
      if (!inPauseState) {
        inPauseState = true;
        pauseStartTime = entryTimestamp;
      }
    } else if (action === GameLogAction.UNPAUSE) {
      if (inPauseState && pauseStartTime !== null) {
        const pauseDuration = entryTimestamp.getTime() - pauseStartTime.getTime();
        totalPauseTime += pauseDuration;
        turnPauseTime += pauseDuration;
        inPauseState = false;
        pauseStartTime = null;
      }
    } else if (action === GameLogAction.NEXT_TURN || action === GameLogAction.END_GAME) {
      // Reset turnPauseTime at the start of a new turn or end of the game
      turnPauseTime = 0;
    }

    const adjustedDuration = entryTimestamp.getTime() - startGameTime.getTime() - totalPauseTime;

    // Update the cache
    newCache[i] = {
      eventId: entry.id,
      totalPauseTime,
      turnPauseTime,
      inSaveState,
      inPauseState,
      saveStartTime,
      pauseStartTime,
      adjustedDuration,
    };
  }

  // Ensure the time cache has the same number of entries as the log
  if (newCache.length !== log.length) {
    throw new Error('Time cache length does not match log length');
  }

  return newCache;
}

/**
 * Validates the existing time cache against the log entries.
 * @param logEntries - An array of log entries.
 * @param timeCache - An array of time cache entries.
 * @returns The index of the last valid cache entry, or -1 if no valid entries found.
 */
export function validateCache(logEntries: ILogEntry[], timeCache: IEventTimeCache[]): number {
  if (!timeCache || timeCache.length === 0) {
    return -1;
  }
  for (let i = logEntries.length - 1; i >= 0; i--) {
    const log = logEntries[i];
    if (timeCache[i] && timeCache[i].eventId === log.id) {
      return i;
    }
  }
  return -1;
}

/**
 * Retrieves the cache entry for a specific log entry.
 * @param game - The game object containing log entries and time cache.
 * @param logEntryId - The ID of the log entry to find.
 * @returns The corresponding IEventTimeCache object, or null if not found.
 */
export function getCacheEntryForLog(game: IGame, logEntryId: string): IEventTimeCache | null {
  // get the index of the log entry by its id
  const logEntryIndex = game.log.findIndex((entry) => entry.id === logEntryId);
  if (logEntryIndex === -1) {
    return null;
  }

  const cacheEntry = game.timeCache[logEntryIndex];
  if (cacheEntry) {
    return cacheEntry;
  }
  const updatedCache = updateCache(game);
  return updatedCache ? (updatedCache[logEntryIndex] ?? null) : null;
}

/**
 * Retrieves the cache entry for a specific log entry.
 * @param game - The game object containing log entries and time cache.
 * @param logEntryIndex - The index of the log entry to find.
 * @returns The corresponding IEventTimeCache object, or null if not found.
 */
export function getCacheEntryForLogByIndex(
  game: IGame,
  logEntryIndex: number
): IEventTimeCache | null {
  if (logEntryIndex < 0 || logEntryIndex >= game.log.length) {
    return null;
  }

  const cacheEntry = game.timeCache[logEntryIndex];
  if (cacheEntry) {
    return cacheEntry;
  }
  const updatedCache = updateCache(game);
  return updatedCache ? (updatedCache[logEntryIndex] ?? null) : null;
}

/**
 * Retrieves the adjusted duration for a specific log entry from the cache.
 * @param game - The game object containing log entries and time cache.
 * @param logEntryId - The ID of the log entry to find.
 * @returns The adjusted duration in milliseconds, or null if not found.
 */
export function getAdjustedDurationFromCache(game: IGame, logEntryId: string): number | null {
  const cacheEntry = getCacheEntryForLog(game, logEntryId);
  return cacheEntry?.adjustedDuration ?? null;
}

/**
 * Retrieves the adjusted duration for a specific log entry from the cache.
 * @param game - The game object containing log entries and time cache.
 * @param logEntryIndex - The index of the log entry.
 * @returns The adjusted duration in milliseconds, or null if not found.
 */
export function getAdjustedDurationFromCacheByIndex(
  game: IGame,
  logEntryIndex: number
): number | null {
  const cacheEntry = getCacheEntryForLogByIndex(game, logEntryIndex);
  return cacheEntry?.adjustedDuration ?? null;
}

/**
 * Retrieves the total pause time for a specific log entry from the cache.
 * @param game - The game object containing log entries and time cache.
 * @param logEntryId - The ID of the log entry to find.
 * @returns The total pause time in milliseconds, or null if not found.
 */
export function getTotalPauseTimeFromCache(game: IGame, logEntryId: string): number | null {
  const cacheEntry = getCacheEntryForLog(game, logEntryId);
  return cacheEntry?.totalPauseTime ?? null;
}

/**
 * Calculates the duration from START_GAME to a given event time,
 * leveraging the cache as much as possible.
 * @param game - The game object containing log entries and cache.
 * @param eventTime - The event time up to which the duration is calculated.
 * @returns The adjusted duration in milliseconds.
 */
export function calculateDurationUpToEventWithCache(game: IGame, eventTime: Date): number {
  const { log, timeCache } = game;
  let startGameTime: Date | null = null;
  let totalPauseTime = 0;
  let inSaveState = false;
  let inPauseState = false;
  let saveStartTime: Date | null = null;
  let pauseStartTime: Date | null = null;

  // Find the START_GAME action
  if (log.length === 0) {
    return 0;
  }
  const firstLog = log[0];
  if (firstLog.action === GameLogAction.START_GAME) {
    startGameTime = firstLog.timestamp;
  } else {
    // No START_GAME found
    return 0;
  }

  if (startGameTime >= eventTime) {
    // eventTime is before the game started
    return 0;
  }

  // Validate the cache and find the last valid cache entry
  const lastValidCacheEntryIndex = validateCache(log, timeCache);
  if (lastValidCacheEntryIndex !== -1) {
    const lastValidCacheEntry = timeCache[lastValidCacheEntryIndex];
    totalPauseTime = lastValidCacheEntry.totalPauseTime;
    inSaveState = lastValidCacheEntry.inSaveState;
    inPauseState = lastValidCacheEntry.inPauseState;
    saveStartTime = lastValidCacheEntry.saveStartTime;
    pauseStartTime = lastValidCacheEntry.pauseStartTime;
  }

  // Calculate total duration from START_GAME to eventTime
  const totalDuration = eventTime.getTime() - startGameTime.getTime();

  // Process log entries from the last valid cache entry up to the eventTime
  for (let i = lastValidCacheEntryIndex + 1; i < log.length; i++) {
    const entry = log[i];
    const { action, timestamp } = entry;

    // Stop processing entries after the event time
    if (timestamp > eventTime) {
      break;
    }

    if (action === GameLogAction.SAVE_GAME) {
      if (!inSaveState) {
        inSaveState = true;
        saveStartTime = timestamp;
      }
    } else if (action === GameLogAction.LOAD_GAME) {
      if (inSaveState && saveStartTime !== null) {
        const saveDuration = timestamp.getTime() - saveStartTime.getTime();
        totalPauseTime += saveDuration;
        inSaveState = false;
        saveStartTime = null;
      }
    } else if (action === GameLogAction.PAUSE) {
      if (!inPauseState) {
        inPauseState = true;
        pauseStartTime = timestamp;
      }
    } else if (action === GameLogAction.UNPAUSE) {
      if (inPauseState && pauseStartTime !== null) {
        const pauseDuration = timestamp.getTime() - pauseStartTime.getTime();
        totalPauseTime += pauseDuration;
        inPauseState = false;
        pauseStartTime = null;
      }
    }
    // Other actions are ignored for pause time calculation
  }

  // Handle unpaired SAVE_GAME before eventTime
  if (inSaveState && saveStartTime !== null) {
    const saveDuration = eventTime.getTime() - saveStartTime.getTime();
    totalPauseTime += saveDuration;
  }

  // Handle unpaired PAUSE before eventTime
  if (inPauseState && pauseStartTime !== null) {
    const pauseDuration = eventTime.getTime() - pauseStartTime.getTime();
    totalPauseTime += pauseDuration;
  }

  // Adjust the total duration by subtracting the total pause time
  const adjustedDuration = totalDuration - totalPauseTime;

  return adjustedDuration;
}

/**
 * Rebuild the time cache and the turn statistics cache for a given game.
 * This function is expected to be computationally expensive and should be called only when necessary.
 * The turn statistics should be maintained automatically throughout the game in normal conditions.
 * @param game - The game object containing log entries, time cache, and turn statistics cache.
 */
export function rebuildCaches(game: IGame): {
  timeCache: Array<IEventTimeCache>;
  turnStatisticsCache: Array<ITurnStatistics>;
} {
  if (game.log.length === 0) {
    return { timeCache: [], turnStatisticsCache: [] };
  }

  const newTurnStatisticsCache: Array<ITurnStatistics> = [];
  let reconstructedGame = NewGameState(game);
  // clear the log
  reconstructedGame.log = [];

  let turnStart: Date = game.log[0].timestamp;
  let turnEnd: Date | null = null;
  let currentTurn = 0;
  for (let i = 0; i < game.log.length; i++) {
    const entry = game.log[i];

    // also updates the time cache
    reconstructedGame = applyLogAction(reconstructedGame, entry);

    if (reconstructedGame.log.length !== i + 1) {
      console.error('Log and time cache out of sync after applying', entry.action);
      throw new Error(`Log and time cache out of sync after applying ${entry.action}`);
    }

    const timeCacheEntry = reconstructedGame.timeCache[i];
    if (timeCacheEntry === undefined) {
      throw new Error('Unexpected undefined time cache entry');
    }

    if (entry.action === GameLogAction.START_GAME) {
      turnStart = entry.timestamp;
      turnEnd = null;
      currentTurn = 1;
    } else if (entry.action === GameLogAction.NEXT_TURN) {
      turnEnd = entry.timestamp;
      newTurnStatisticsCache.push({
        turn: currentTurn,
        start: turnStart,
        end: turnEnd,
        supply: reconstructedGame.supply,
        playerScores: reconstructedGame.players.map((player) => calculateVictoryPoints(player)),
        playerIndex: entry.prevPlayerIndex ?? game.currentPlayerIndex,
        turnDuration: turnEnd.getTime() - turnStart.getTime() - timeCacheEntry.turnPauseTime,
      });
      turnStart = entry.timestamp;
      currentTurn++;
    } else if (entry.action === GameLogAction.END_GAME) {
      turnEnd = entry.timestamp;
      newTurnStatisticsCache.push({
        turn: currentTurn,
        start: turnStart,
        end: turnEnd,
        supply: reconstructedGame.supply,
        playerScores: reconstructedGame.players.map((player) => calculateVictoryPoints(player)),
        playerIndex: entry.prevPlayerIndex ?? game.currentPlayerIndex,
        turnDuration: turnEnd.getTime() - turnStart.getTime() - timeCacheEntry.turnPauseTime,
      });
    }
  }

  return { timeCache: reconstructedGame.timeCache, turnStatisticsCache: newTurnStatisticsCache };
}

/**
 * Calculate the average turn duration for the entire game.
 * @param game - The game object containing the turn statistics cache.
 * @returns The average turn duration in milliseconds.
 */
export function calculateAverageTurnDuration(game: IGame): number {
  const turnDurations = game.turnStatisticsCache.map((turn) => turn.turnDuration);
  if (turnDurations.length === 0) {
    return 0;
  }
  return turnDurations.reduce((a, b) => a + b) / turnDurations.length;
}

/**
 * Calculate the average turn duration for a specific player.
 * @param game - The game object containing the turn statistics cache.
 * @param playerIndex - The index of the player whose turn duration is to be calculated.
 * @returns The average turn duration for the specified player in milliseconds. If the player has no turns, returns 0.
 */
export function calculateAverageTurnDurationForPlayer(game: IGame, playerIndex: number): number {
  const turnDurations = game.turnStatisticsCache
    .filter((turn) => turn.playerIndex === playerIndex)
    .map((turn) => turn.turnDuration);
  if (turnDurations.length === 0) {
    return 0;
  }
  return turnDurations.reduce((a, b) => a + b) / turnDurations.length;
}

/**
 * Update the time and turn statistics cache for a given (assumed new) log entry.
 * It is assumed that the game log already contains the new entry.
 * @param game - The game object containing the log entries, time cache, and turn statistics cache.
 * @param entry - The new log entry to update the caches for.
 * @returns An object containing the updated time cache and turn statistics cache.
 */
export function updateCachesForEntry(
  game: IGame,
  entry: ILogEntry
): {
  timeCache: Array<IEventTimeCache>;
  turnStatisticsCache: Array<ITurnStatistics>;
} {
  if (game.log[game.log.length - 1].id !== entry.id) {
    throw new Error('New log entry does not match the last entry in the log');
  }
  const timeCache = updateCache(game);
  const turnStatisticsCache = deepClone<Array<ITurnStatistics>>(game.turnStatisticsCache);
  if (entry.action === GameLogAction.NEXT_TURN || entry.action === GameLogAction.END_GAME) {
    const turn = entry.action === GameLogAction.NEXT_TURN ? entry.turn - 1 : entry.turn;
    const turnStart = getTurnStartTime(game, turn);
    const timeCacheEntry = timeCache[game.log.length - 2]; // get the previous time cache entry
    turnStatisticsCache.push({
      turn: turn,
      playerScores: game.players.map((player) => calculateVictoryPoints(player)),
      supply: game.supply,
      playerIndex: entry.prevPlayerIndex ?? game.currentPlayerIndex,
      start: turnStart,
      end: entry.timestamp,
      turnDuration: entry.timestamp.getTime() - turnStart.getTime() - timeCacheEntry.turnPauseTime,
    });
  }
  return { timeCache, turnStatisticsCache };
}

/**
 * Calculate the current turn duration for the game in milliseconds
 */
export function calculateCurrentTurnDuration(game: IGame, currentTime: Date): number {
  const gameStart = getGameStartTime(game);
  if (!gameStart) {
    return 0;
  }

  const lastTurnStart = getTurnStartTime(game, game.currentTurn);
  if (!lastTurnStart) {
    return 0;
  }

  const currentGameTime = calculateDurationUpToEventWithCache(game, currentTime);

  const beginningDuration = lastTurnStart.getTime() - gameStart.getTime();
  const adjustedDuration = Math.max(0, currentGameTime - beginningDuration);

  return adjustedDuration;
}
