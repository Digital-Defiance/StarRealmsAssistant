import { v4 as uuidv4 } from 'uuid';
import { GameLogActionWithCount } from '@/game/enumerations/game-log-action-with-count';
import { EmptyLogError } from '@/game/errors/empty-log';
import { InvalidFieldError } from '@/game/errors/invalid-field';
import { InvalidLogStartGameError } from '@/game/errors/invalid-log-start-game';
import { IGame } from '@/game/interfaces/game';
import { ILogEntry } from '@/game/interfaces/log-entry';
import { PlayerFieldMap } from '@/game/types';
import { NoPlayerActions } from '@/game/constants';

/**
 * Map a victory field and subfield to a game log action.
 * @param field - The field being updated
 * @param subfield - The subfield being updated
 * @param increment - The amount to increment the field by
 * @returns The game log action
 */
export function victoryFieldToGameLogAction<T extends keyof PlayerFieldMap>(
  field: T,
  subfield: PlayerFieldMap[T],
  increment: number
): GameLogActionWithCount {
  switch (field) {
    case 'turn':
      switch (subfield) {
        case 'actions':
          return increment > 0
            ? GameLogActionWithCount.ADD_ACTIONS
            : GameLogActionWithCount.REMOVE_ACTIONS;
        case 'buys':
          return increment > 0
            ? GameLogActionWithCount.ADD_BUYS
            : GameLogActionWithCount.REMOVE_BUYS;
        case 'coins':
          return increment > 0
            ? GameLogActionWithCount.ADD_COINS
            : GameLogActionWithCount.REMOVE_COINS;
        default:
          throw new InvalidFieldError(field as string, subfield as string);
      }
    case 'mats':
      switch (subfield) {
        case 'coffers':
          return increment > 0
            ? GameLogActionWithCount.ADD_COFFERS
            : GameLogActionWithCount.REMOVE_COFFERS;
        case 'villagers':
          return increment > 0
            ? GameLogActionWithCount.ADD_VILLAGERS
            : GameLogActionWithCount.REMOVE_VILLAGERS;
        case 'debt':
          return increment > 0
            ? GameLogActionWithCount.ADD_DEBT
            : GameLogActionWithCount.REMOVE_DEBT;
        case 'favors':
          return increment > 0
            ? GameLogActionWithCount.ADD_FAVORS
            : GameLogActionWithCount.REMOVE_FAVORS;
        default:
          throw new InvalidFieldError(field as string, subfield as string);
      }
    case 'victory':
      switch (subfield) {
        case 'curses':
          return increment > 0
            ? GameLogActionWithCount.ADD_CURSES
            : GameLogActionWithCount.REMOVE_CURSES;
        case 'estates':
          return increment > 0
            ? GameLogActionWithCount.ADD_ESTATES
            : GameLogActionWithCount.REMOVE_ESTATES;
        case 'duchies':
          return increment > 0
            ? GameLogActionWithCount.ADD_DUCHIES
            : GameLogActionWithCount.REMOVE_DUCHIES;
        case 'provinces':
          return increment > 0
            ? GameLogActionWithCount.ADD_PROVINCES
            : GameLogActionWithCount.REMOVE_PROVINCES;
        case 'colonies':
          return increment > 0
            ? GameLogActionWithCount.ADD_COLONIES
            : GameLogActionWithCount.REMOVE_COLONIES;
        case 'tokens':
          return increment > 0
            ? GameLogActionWithCount.ADD_VP_TOKENS
            : GameLogActionWithCount.REMOVE_VP_TOKENS;
        case 'other':
          return increment > 0
            ? GameLogActionWithCount.ADD_OTHER_VP
            : GameLogActionWithCount.REMOVE_OTHER_VP;
        default:
          throw new InvalidFieldError(field as string, subfield as string);
      }
    case 'newTurn':
      switch (subfield) {
        case 'actions':
          return increment > 0
            ? GameLogActionWithCount.ADD_NEXT_TURN_ACTIONS
            : GameLogActionWithCount.REMOVE_NEXT_TURN_ACTIONS;
        case 'buys':
          return increment > 0
            ? GameLogActionWithCount.ADD_NEXT_TURN_BUYS
            : GameLogActionWithCount.REMOVE_NEXT_TURN_BUYS;
        case 'coins':
          return increment > 0
            ? GameLogActionWithCount.ADD_NEXT_TURN_COINS
            : GameLogActionWithCount.REMOVE_NEXT_TURN_COINS;
        default:
          throw new InvalidFieldError(field as string, subfield as string);
      }
    default:
      throw new InvalidFieldError(field as string, subfield as string);
  }
}

/**
 * Transform a log entry to a string.
 * @param entry - The log entry
 * @returns The string representation of the log entry
 */
export function logEntryToString(entry: ILogEntry): string {
  let actionString = entry.action as string;

  if (entry.count !== undefined) {
    actionString = actionString.replace('{COUNT}', entry.count.toString());
  } else {
    // Remove {COUNT} if no count is provided
    actionString = actionString.replace(' {COUNT}', '');
  }

  return actionString;
}

/**
 * Get the start date of the game from the log entries.
 * @param logEntries - The log entries
 * @returns The start date
 */
export function getStartDateFromLog(logEntries: ILogEntry[]): Date {
  if (logEntries.length === 0) {
    throw new EmptyLogError();
  }

  const startGameEntry = logEntries[0];

  if (startGameEntry.action !== GameLogActionWithCount.START_GAME) {
    throw new InvalidLogStartGameError();
  }

  return new Date(startGameEntry.timestamp);
}

/**
 * Get the time span from the start of the game to the given event time, less time spans between loads and
 * @param log - The game log
 * @param eventTime - The event time
 * @returns The time span from the start of the game to the event time
 */
export function getTimeSpanFromStartGame(log: ILogEntry[], eventTime: Date): string {
  let startDate: Date | null = null;
  let lastSaveTime: Date | null = null;
  let totalExcludedTime = 0;

  for (const entry of log) {
    const entryTime = new Date(entry.timestamp);

    if (entry.action === GameLogActionWithCount.START_GAME) {
      startDate = entryTime;
    } else if (entry.action === GameLogActionWithCount.SAVE_GAME) {
      if (lastSaveTime === null) {
        lastSaveTime = entryTime;
      }
    } else if (entry.action === GameLogActionWithCount.LOAD_GAME) {
      if (lastSaveTime) {
        totalExcludedTime += entryTime.getTime() - lastSaveTime.getTime();
        lastSaveTime = null; // Reset last save time after accounting for the load
      }
    }
  }

  if (!startDate) {
    throw new Error('Start time not found in the log');
  }

  // If there's a save without a corresponding load, exclude the time from the save to the event time
  if (lastSaveTime) {
    totalExcludedTime += eventTime.getTime() - lastSaveTime.getTime();
  }

  const timeSpan = eventTime.getTime() - startDate.getTime() - totalExcludedTime;

  // Convert time span from milliseconds to a human-readable format
  const absTimeSpan = Math.abs(timeSpan);
  const seconds = Math.floor((absTimeSpan / 1000) % 60);
  const minutes = Math.floor((absTimeSpan / (1000 * 60)) % 60);
  const hours = Math.floor((absTimeSpan / (1000 * 60 * 60)) % 24);
  const days = Math.floor(absTimeSpan / (1000 * 60 * 60 * 24));

  const sign = timeSpan < 0 ? '-' : '';

  return `${sign}${days}d ${hours}h ${minutes}m ${seconds}s`;
}

/**
 * Add a log entry to the game log.
 * @param game - The game object
 * @param playerIndex - The index of the player whose turn it is
 * @param action - The log action
 * @param overrides - Additional properties to be included in the log entry (optional)
 * @returns
 */
export function addLogEntry(
  game: IGame,
  playerIndex: number,
  currentPlayerIndex: number,
  action: GameLogActionWithCount,
  overrides?: Partial<ILogEntry>
): ILogEntry {
  if (!NoPlayerActions.includes(action)) {
    if (playerIndex < 0) {
      throw new Error('Player index is required for this action');
    } else if (playerIndex >= game.players.length) {
      throw new Error('Player index is out of range');
    }
  } else if (playerIndex > -1) {
    throw new Error('Player index is not relevant for this action');
  }
  const newLog: ILogEntry = {
    id: uuidv4(),
    timestamp: new Date(),
    action,
    playerIndex,
    currentPlayerIndex,
    ...overrides,
  };
  game.log.push(newLog);
  return newLog;
}
