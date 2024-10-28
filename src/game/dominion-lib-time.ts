import { IGame } from '@/game/interfaces/game';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import { IEventTimeCache } from '@/game/interfaces/event-time-cache';
import { ILogEntry } from '@/game/interfaces/log-entry';

/**
 * Updates the time cache for a given game.
 * @param game - The game object containing log entries and existing time cache.
 * @returns An updated array of IEventTimeCache objects.
 */
/**
 * Updates the time cache for a given game.
 * @param game - The game object containing log entries and existing time cache.
 * @returns An updated array of IEventTimeCache objects.
 */
/**
 * Updates the time cache for a given game.
 * @param game - The game object containing log entries and existing time cache.
 * @returns An updated array of IEventTimeCache objects.
 */
export function updateCache(game: IGame): Array<IEventTimeCache> {
  const { log, timeCache } = game;
  let startGameTime: Date | null = null;
  let totalPauseTime = 0;
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
        inPauseState = false;
        pauseStartTime = null;
      }
    }

    const adjustedDuration = entryTimestamp.getTime() - startGameTime.getTime() - totalPauseTime;

    // Update the cache
    newCache[i] = {
      eventId: entry.id,
      totalPauseTime,
      inSaveState,
      inPauseState,
      saveStartTime,
      pauseStartTime,
      adjustedDuration,
    };
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
