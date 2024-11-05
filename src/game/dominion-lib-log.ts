import { v4 as uuidv4 } from 'uuid';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import { EmptyLogError } from '@/game/errors/empty-log';
import { InvalidFieldError } from '@/game/errors/invalid-field';
import { InvalidLogStartGameError } from '@/game/errors/invalid-log-start-game';
import { IGame } from '@/game/interfaces/game';
import { ILogEntry } from '@/game/interfaces/log-entry';
import { PlayerFieldMap } from '@/game/types';
import {
  ActionsWithPlayer,
  AdjustmentActions,
  DefaultTurnDetails,
  NegativeAdjustmentActions,
  NO_PLAYER,
  NoPlayerActions,
} from '@/game/constants';
import { ITurnDuration } from '@/game/interfaces/turn-duration';
import {
  calculateVictoryPoints,
  getFieldAndSubfieldFromAction,
  updatePlayerField,
} from '@/game/dominion-lib';
import { InvalidTrashActionError } from '@/game/errors/invalid-trash-action';
import { reconstructGameState } from '@/game/dominion-lib-undo-helpers';
import { GamePausedError } from '@/game/errors/game-paused';
import { CountRequiredError } from '@/game/errors/count-required';
import { updateCachesForEntry } from '@/game/dominion-lib-time';
import { IVictoryGraphData } from '@/game/interfaces/victory-graph-data';
import { ITurnAdjustment } from '@/game/interfaces/turn-adjustment';
import { IPlayer } from '@/game/interfaces/player';
import { IGroupedAction } from '@/game/interfaces/grouped-action';
import { deepClone } from '@/game/utils';
import { NotEnoughProphecyError } from '@/game/errors/not-enough-prophecy';
import { IPlayerGameTurnDetails } from '@/game/interfaces/player-game-turn-details';
import { CurrentStep } from '@/game/enumerations/current-step';
import { GroupedActionDest } from '@/game/enumerations/grouped-action-dest';
import { InvalidPlayerIndexError } from '@/game/errors/invalid-player-index';
import { InvalidActionError } from '@/game/errors/invalid-action';
import { GroupedActionTrigger } from '@/game/enumerations/grouped-action-trigger';

/**
 * Map a victory field and subfield to a game log action.
 * @param field - The field being updated
 * @param subfield - The subfield being updated
 * @param increment - The amount to increment the field by
 * @returns The game log action
 */
export function fieldSubfieldToGameLogAction<T extends keyof PlayerFieldMap>(
  field: T,
  subfield: PlayerFieldMap[T],
  increment: number
): GameLogAction {
  switch (field) {
    case 'turn':
      switch (subfield) {
        case 'actions':
          return increment > 0 ? GameLogAction.ADD_ACTIONS : GameLogAction.REMOVE_ACTIONS;
        case 'buys':
          return increment > 0 ? GameLogAction.ADD_BUYS : GameLogAction.REMOVE_BUYS;
        case 'coins':
          return increment > 0 ? GameLogAction.ADD_COINS : GameLogAction.REMOVE_COINS;
        case 'cards':
          return increment > 0 ? GameLogAction.ADD_CARDS : GameLogAction.REMOVE_CARDS;
        case 'gains':
          return increment > 0 ? GameLogAction.ADD_GAINS : GameLogAction.REMOVE_GAINS;
        default:
          throw new InvalidFieldError(field as string, subfield as string);
      }
    case 'mats':
      switch (subfield) {
        case 'coffers':
          return increment > 0 ? GameLogAction.ADD_COFFERS : GameLogAction.REMOVE_COFFERS;
        case 'villagers':
          return increment > 0 ? GameLogAction.ADD_VILLAGERS : GameLogAction.REMOVE_VILLAGERS;
        case 'debt':
          return increment > 0 ? GameLogAction.ADD_DEBT : GameLogAction.REMOVE_DEBT;
        case 'favors':
          return increment > 0 ? GameLogAction.ADD_FAVORS : GameLogAction.REMOVE_FAVORS;
        default:
          throw new InvalidFieldError(field as string, subfield as string);
      }
    case 'victory':
      switch (subfield) {
        case 'curses':
          return increment > 0 ? GameLogAction.ADD_CURSES : GameLogAction.REMOVE_CURSES;
        case 'estates':
          return increment > 0 ? GameLogAction.ADD_ESTATES : GameLogAction.REMOVE_ESTATES;
        case 'duchies':
          return increment > 0 ? GameLogAction.ADD_DUCHIES : GameLogAction.REMOVE_DUCHIES;
        case 'provinces':
          return increment > 0 ? GameLogAction.ADD_PROVINCES : GameLogAction.REMOVE_PROVINCES;
        case 'colonies':
          return increment > 0 ? GameLogAction.ADD_COLONIES : GameLogAction.REMOVE_COLONIES;
        case 'tokens':
          return increment > 0 ? GameLogAction.ADD_VP_TOKENS : GameLogAction.REMOVE_VP_TOKENS;
        case 'other':
          return increment > 0 ? GameLogAction.ADD_OTHER_VP : GameLogAction.REMOVE_OTHER_VP;
        default:
          throw new InvalidFieldError(field as string, subfield as string);
      }
    case 'newTurn':
      switch (subfield) {
        case 'actions':
          return increment > 0
            ? GameLogAction.ADD_NEXT_TURN_ACTIONS
            : GameLogAction.REMOVE_NEXT_TURN_ACTIONS;
        case 'buys':
          return increment > 0
            ? GameLogAction.ADD_NEXT_TURN_BUYS
            : GameLogAction.REMOVE_NEXT_TURN_BUYS;
        case 'coins':
          return increment > 0
            ? GameLogAction.ADD_NEXT_TURN_COINS
            : GameLogAction.REMOVE_NEXT_TURN_COINS;
        case 'cards':
          return increment > 0
            ? GameLogAction.ADD_NEXT_TURN_CARDS
            : GameLogAction.REMOVE_NEXT_TURN_CARDS;
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

  if (entry.action === GameLogAction.GROUPED_ACTION && entry.actionName !== undefined) {
    actionString = entry.actionName;
  } else if (entry.count !== undefined) {
    actionString = actionString.replace('{COUNT}', entry.count.toString());
  } else {
    // Remove {COUNT} if no count is provided
    actionString = actionString.replace(' {COUNT}', '');
  }

  return actionString;
}

/**
 * Calculates the turn durations from a game log.
 * @param logEntries - The game log entries.
 * @returns An array of turn durations.
 */
export function calculateTurnDurations(logEntries: ILogEntry[]): ITurnDuration[] {
  const durations: ITurnDuration[] = [];
  let currentTurnStartTime: Date | null = null;
  let currentTurnPauseTime = 0;
  let saveStartTime: Date | null = null;
  let pauseStartTime: Date | null = null;
  let inSaveState = false;
  let inPauseState = false;
  let hasNextTurnAfterStartGame = false;

  for (const entry of logEntries) {
    const { action, timestamp } = entry;

    if (inPauseState && action !== GameLogAction.UNPAUSE) {
      // If we encounter any action other than UNPAUSE while in a paused state, stop processing
      throw new GamePausedError();
    }

    if (action === GameLogAction.START_GAME) {
      currentTurnStartTime = timestamp;
      currentTurnPauseTime = 0;
      inSaveState = false;
      inPauseState = false;
      saveStartTime = null;
      pauseStartTime = null;
    } else if (action === GameLogAction.NEXT_TURN) {
      if (currentTurnStartTime !== null) {
        // Process any ongoing save state before ending the turn
        if (inSaveState && saveStartTime !== null) {
          const saveDuration = timestamp.getTime() - saveStartTime.getTime();
          currentTurnPauseTime += saveDuration;
          inSaveState = false;
          saveStartTime = null;
        }

        // Process any ongoing pause state before ending the turn
        if (inPauseState && pauseStartTime !== null) {
          const pauseDuration = timestamp.getTime() - pauseStartTime.getTime();
          currentTurnPauseTime += pauseDuration;
          inPauseState = false;
          pauseStartTime = null;
        }

        const duration =
          timestamp.getTime() - currentTurnStartTime.getTime() - currentTurnPauseTime;
        durations.push({
          turn: entry.turn - 1, // NEXT_TURN entries reflect the new turn
          playerIndex: entry.prevPlayerIndex ?? entry.playerIndex,
          start: currentTurnStartTime,
          end: timestamp,
          duration,
        });
        hasNextTurnAfterStartGame = true;
      }
      currentTurnStartTime = timestamp;
      currentTurnPauseTime = 0;
      inSaveState = false;
      inPauseState = false;
      saveStartTime = null;
      pauseStartTime = null;
    } else if (action === GameLogAction.END_GAME) {
      if (currentTurnStartTime !== null) {
        if (inSaveState && saveStartTime !== null) {
          const saveDuration = timestamp.getTime() - saveStartTime.getTime();
          currentTurnPauseTime += saveDuration;
          inSaveState = false;
          saveStartTime = null;
        }

        if (inPauseState && pauseStartTime !== null) {
          const pauseDuration = timestamp.getTime() - pauseStartTime.getTime();
          currentTurnPauseTime += pauseDuration;
          inPauseState = false;
          pauseStartTime = null;
        }

        const duration =
          timestamp.getTime() - currentTurnStartTime.getTime() - currentTurnPauseTime;
        durations.push({
          turn: entry.turn,
          playerIndex: entry.playerIndex,
          start: currentTurnStartTime,
          end: timestamp,
          duration,
        });
      }
      break;
    } else if (action === GameLogAction.SAVE_GAME) {
      if (!inSaveState) {
        saveStartTime = timestamp;
        inSaveState = true;
      }
    } else if (action === GameLogAction.LOAD_GAME) {
      if (inSaveState && saveStartTime !== null) {
        const saveDuration = timestamp.getTime() - saveStartTime.getTime();
        currentTurnPauseTime += saveDuration;
        inSaveState = false;
        saveStartTime = null;
      }
    } else if (action === GameLogAction.PAUSE) {
      if (!inPauseState) {
        pauseStartTime = timestamp;
        inPauseState = true;
      }
    } else if (action === GameLogAction.UNPAUSE) {
      if (inPauseState && pauseStartTime !== null) {
        const pauseDuration = timestamp.getTime() - pauseStartTime.getTime();
        currentTurnPauseTime += pauseDuration;
        inPauseState = false;
        pauseStartTime = null;
      }
    }
  }

  if (!hasNextTurnAfterStartGame) {
    return [];
  }

  return durations;
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

  if (startGameEntry.action !== GameLogAction.START_GAME) {
    throw new InvalidLogStartGameError();
  }

  return startGameEntry.timestamp;
}

/**
 * Get the time span from the most recent action in the log.
 * @param log - The log entries
 * @param eventTime - The current event time
 * @returns The time span
 */
export function getTimeSpanFromLastAction(log: ILogEntry[], eventTime: Date): number {
  if (log.length === 0) {
    return 0;
  }

  const lastActionTime = new Date(log[log.length - 1].timestamp);
  const timeSpan = eventTime.getTime() - lastActionTime.getTime();

  return timeSpan;
}

/**
 * Calculates the average turn duration from an array of turn durations.
 * @param turnDurations - An array of turn duration objects.
 * @returns The average turn duration in milliseconds.
 */
export function calculateAverageTurnDuration(turnDurations: ITurnDuration[]): number {
  if (turnDurations.length === 0) {
    return 0;
  }

  const totalDuration = turnDurations.reduce((accumulator, turn) => {
    return accumulator + turn.duration;
  }, 0);

  const averageDuration = totalDuration / turnDurations.length;
  return averageDuration;
}

/**
 * Calculates the average turn duration for a specific player.
 * @param turnDurations - An array of turn duration objects.
 * @param playerIndex - The index of the player whose average turn duration is to be calculated.
 * @returns The average turn duration for the specified player in milliseconds.
 */
export function calculateAverageTurnDurationForPlayer(
  turnDurations: ITurnDuration[],
  playerIndex: number
): number {
  const playerTurns = turnDurations.filter((turn) => turn.playerIndex === playerIndex);

  if (playerTurns.length === 0) {
    return 0;
  }

  const totalDuration = playerTurns.reduce((accumulator, turn) => {
    return accumulator + turn.duration;
  }, 0);

  const averageDuration = totalDuration / playerTurns.length;
  return averageDuration;
}

/**
 * Calculates the duration of the current turn from the last NEXT_TURN or START_GAME up to the current time.
 * Subtracts the time between any SAVE_GAME and the immediately following LOAD_GAME within the turn.
 * @param logEntries - The game log entries.
 * @param currentTime - The current time.
 * @returns The duration of the current turn in milliseconds.
 */
export function calculateCurrentTurnDuration(logEntries: ILogEntry[], currentTime: Date): number {
  let currentTurnStartTime: Date | null = null;
  let currentTurnPauseTime = 0;
  let inSaveState = false;
  let inPauseState = false;
  let saveStartTime: Date | null = null;
  let pauseStartTime: Date | null = null;

  // Find the last NEXT_TURN or START_GAME
  for (let i = logEntries.length - 1; i >= 0; i--) {
    const entry = logEntries[i];
    if (entry.action === GameLogAction.NEXT_TURN) {
      currentTurnStartTime = entry.timestamp;
      break;
    } else if (entry.action === GameLogAction.START_GAME) {
      currentTurnStartTime = entry.timestamp;
      break;
    }
  }

  if (currentTurnStartTime === null) {
    return 0;
  }

  // Process log entries from currentTurnStartTime onwards
  for (const entry of logEntries) {
    if (entry.timestamp < currentTurnStartTime) continue;

    const { action, timestamp } = entry;

    if (action === GameLogAction.SAVE_GAME) {
      if (!inSaveState) {
        saveStartTime = timestamp;
        inSaveState = true;
      }
    } else if (action === GameLogAction.LOAD_GAME) {
      if (inSaveState && saveStartTime !== null) {
        const saveDuration = timestamp.getTime() - saveStartTime.getTime();
        currentTurnPauseTime += saveDuration;
        inSaveState = false;
        saveStartTime = null;
      }
    } else if (action === GameLogAction.PAUSE) {
      if (!inPauseState) {
        pauseStartTime = timestamp;
        inPauseState = true;
      }
    } else if (action === GameLogAction.UNPAUSE) {
      if (inPauseState && pauseStartTime !== null) {
        const pauseDuration = timestamp.getTime() - pauseStartTime.getTime();
        currentTurnPauseTime += pauseDuration;
        inPauseState = false;
        pauseStartTime = null;
      }
    }
  }

  // Handle unpaired SAVE_GAME by subtracting up to current time
  if (inSaveState && saveStartTime !== null) {
    const saveDuration = currentTime.getTime() - saveStartTime.getTime();
    currentTurnPauseTime += saveDuration;
  }

  // Handle unpaired PAUSE by subtracting up to current time
  if (inPauseState && pauseStartTime !== null) {
    const pauseDuration = currentTime.getTime() - pauseStartTime.getTime();
    currentTurnPauseTime += pauseDuration;
  }

  const duration = currentTime.getTime() - currentTurnStartTime.getTime() - currentTurnPauseTime;
  return duration;
}

/**
 * Calculate the total duration of the game from the start of the game to the current time, subtracting the time between any SAVE_GAME and the immediately following LOAD_GAME within the turn.
 * @param log - The game log entries
 * @returns The total duration of the game in milliseconds
 */
export function calculateGameDuration(
  log: ILogEntry[],
  calculateTurnDurations: (logEntries: ILogEntry[]) => ITurnDuration[],
  calculateCurrentTurnDuration: (logEntries: ILogEntry[], currentTime: Date) => number
): {
  duration: number;
  turnDurations: ITurnDuration[];
} {
  if (log.length === 0) {
    return { duration: 0, turnDurations: [] };
  }

  const turnDurations = calculateTurnDurations(log);
  const totalDuration = turnDurations.reduce((accumulator, turn) => {
    return accumulator + turn.duration;
  }, 0);
  const currentTurnDuration = calculateCurrentTurnDuration(log, new Date());
  return { duration: totalDuration + currentTurnDuration, turnDurations };
}

/**
 * Calculates the duration from START_GAME to a given event time,
 * subtracting the time between SAVE_GAME and the immediately following LOAD_GAME pairs before the event time.
 * @param logEntries - The game log entries.
 * @param eventTime - The event time up to which the duration is calculated.
 * @returns The adjusted duration in milliseconds.
 */
export function calculateDurationUpToEvent(logEntries: ILogEntry[], eventTime: Date): number {
  let startGameTime: Date | null = null;
  let totalPauseTime = 0;
  let inSaveState = false;
  let inPauseState = false;
  let saveStartTime: Date | null = null;
  let pauseStartTime: Date | null = null;

  // Find the START_GAME action
  if (logEntries.length === 0) {
    return 0;
  }
  const firstLog = logEntries[0];
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

  // Calculate total duration from START_GAME to eventTime
  const totalDuration = eventTime.getTime() - startGameTime.getTime();

  // Process log entries from START_GAME up to eventTime
  for (const entry of logEntries) {
    // Skip entries before the game started
    if (entry.timestamp < startGameTime) {
      continue;
    }

    // Stop processing entries after the event time
    if (entry.timestamp > eventTime) {
      break;
    }

    const { action, timestamp } = entry;

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
 * Format a time span as a human-readable string.
 * @param timeSpan The time span in milliseconds
 * @returns The formatted time span
 */
export function formatTimeSpan(timeSpan: number): string {
  const isNegative = timeSpan < 0;
  const absoluteTime = Math.abs(timeSpan);

  const days = Math.floor(absoluteTime / (1000 * 60 * 60 * 24));
  const hours = Math.floor((absoluteTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((absoluteTime % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((absoluteTime % (1000 * 60)) / 1000);

  if (isNegative) {
    return '0d 0h 0m 0s';
  }

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

/**
 * Add a log entry to the game log.
 * @param game - The game object (gets modified in-place)
 * @param playerIndex - The index of the player whose turn it is
 * @param action - The log action
 * @param overrides - Additional properties to be included in the log entry (optional)
 * @returns
 */
export function addLogEntry(
  game: IGame,
  playerIndex: number,
  action: GameLogAction,
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
  if (AdjustmentActions.includes(action) && overrides?.count === undefined) {
    throw new CountRequiredError();
  }
  const lastLog = game.log.length > 0 ? game.log[game.log.length - 1] : null;
  if (
    lastLog !== null &&
    lastLog.action === GameLogAction.PAUSE &&
    action !== GameLogAction.UNPAUSE
  ) {
    throw new GamePausedError();
  }
  const { field } = getFieldAndSubfieldFromAction(action);

  const newLog: ILogEntry = {
    id: uuidv4(),
    timestamp: new Date(),
    action,
    playerIndex,
    currentPlayerIndex: game.currentPlayerIndex,
    turn: game.currentTurn,
    ...overrides,
  };
  if (overrides?.trash === true && (field !== 'victory' || getSignedCount(newLog) >= 0)) {
    throw new InvalidTrashActionError();
  }
  game.log.push(newLog);
  const { timeCache, turnStatisticsCache } = updateCachesForEntry(game, newLog);
  game.timeCache = timeCache;
  game.turnStatisticsCache = turnStatisticsCache;
  return newLog;
}

export function validateLogAction(game: IGame, logEntry: ILogEntry): Error | null {
  if (logEntry.action === undefined) {
    return new Error('Log entry action is required');
  }

  // validate that logEntry.action is a valid GameLogAction
  if (!Object.values(GameLogAction).includes(logEntry.action)) {
    return new Error(`Invalid log entry action: ${logEntry.action}`);
  }

  // Validate player index for actions that require a valid player index
  if (
    ActionsWithPlayer.includes(logEntry.action) &&
    (logEntry.playerIndex >= game.players.length || logEntry.playerIndex < 0)
  ) {
    return new Error(`Invalid player index: ${logEntry.playerIndex}`);
  }

  if (logEntry.count !== undefined && logEntry.count <= 0) {
    return new Error(`Invalid log entry count: ${logEntry.count}`);
  }

  if (
    logEntry.playerIndex !== undefined &&
    logEntry.playerIndex !== NO_PLAYER &&
    NoPlayerActions.includes(logEntry.action)
  ) {
    return new Error(`Player index is not relevant for this action: ${logEntry.action}`);
  } else if (
    (ActionsWithPlayer.includes(logEntry.action) && logEntry.playerIndex < 0) ||
    logEntry.playerIndex >= game.players.length
  ) {
    return new Error(`Invalid player index: ${logEntry.playerIndex}`);
  }

  return null;
}

/**
 * Applies a single log action to the game state.
 * @param game - The current game state
 * @param logEntry - The log entry to apply
 * @returns The updated game state after applying the action
 */
export function applyLogAction(game: IGame, logEntry: ILogEntry): IGame {
  // validate that logEntry.action is a valid GameLogAction
  const validationError = validateLogAction(game, logEntry);
  if (validationError) {
    throw validationError;
  }

  let updatedGame = deepClone<IGame>(game);

  if (logEntry.action === GameLogAction.START_GAME) {
    // set first player to the player who started the game
    updatedGame.firstPlayerIndex = logEntry.playerIndex;
    updatedGame.selectedPlayerIndex = logEntry.playerIndex;
    updatedGame.currentStep = CurrentStep.Game;
    updatedGame.currentTurn = 1;
  } else if (logEntry.action === GameLogAction.END_GAME) {
    updatedGame.currentStep = CurrentStep.EndGame;
  } else if (logEntry.action === GameLogAction.NEXT_TURN) {
    // Move to next player
    updatedGame.currentTurn = game.currentTurn + 1;
    updatedGame.currentPlayerIndex = logEntry.playerIndex;
    updatedGame.selectedPlayerIndex = logEntry.playerIndex;

    // Reset all players' turn counters to their newTurn values
    updatedGame.players = updatedGame.players.map((player) => ({
      ...player,
      turn: deepClone<IPlayerGameTurnDetails>(player.newTurn ?? DefaultTurnDetails()),
    }));
  } else if (logEntry.action === GameLogAction.SELECT_PLAYER) {
    updatedGame.selectedPlayerIndex = logEntry.playerIndex ?? updatedGame.selectedPlayerIndex;
  } else if (
    logEntry.playerIndex !== NO_PLAYER &&
    logEntry.playerIndex < updatedGame.players.length &&
    !NoPlayerActions.includes(logEntry.action)
  ) {
    const { field, subfield } = getFieldAndSubfieldFromAction(logEntry.action);
    if (field && subfield) {
      const increment = getSignedCount(logEntry, 1);
      updatedGame = updatePlayerField(
        updatedGame,
        logEntry.playerIndex,
        field as keyof PlayerFieldMap,
        subfield,
        increment,
        logEntry.trash === true ? true : undefined
      );
    }
  }

  // Handle game-wide counters
  if (
    game.options.expansions.risingSun &&
    (logEntry.action === GameLogAction.ADD_PROPHECY ||
      logEntry.action === GameLogAction.REMOVE_PROPHECY)
  ) {
    const increment =
      logEntry.action === GameLogAction.ADD_PROPHECY
        ? (logEntry.count ?? 1)
        : -(logEntry.count ?? 1);

    const newSuns = updatedGame.expansions.risingSun.prophecy.suns + increment;

    if (newSuns < 0) {
      throw new NotEnoughProphecyError();
    }

    updatedGame.expansions.risingSun.prophecy.suns = newSuns;
  }

  // If the game is paused, do not allow any other actions except UNPAUSE
  const lastLog = game.log.length > 0 ? game.log[game.log.length - 1] : null;
  if (
    lastLog &&
    lastLog.action === GameLogAction.PAUSE &&
    logEntry.action !== GameLogAction.UNPAUSE
  ) {
    throw new GamePausedError();
  }

  updatedGame.log.push(deepClone<ILogEntry>(logEntry));
  const { timeCache, turnStatisticsCache } = updateCachesForEntry(updatedGame, logEntry);
  updatedGame.timeCache = timeCache;
  updatedGame.turnStatisticsCache = turnStatisticsCache;

  return updatedGame;
}

/**
 * Applies an action from a grouped action to the game state.
 * @param game - The current game state
 * @param subAction - The sub-action to apply
 * @param playerIndex - The index of the player performing the action
 * @param groupedActionId - The ID of the grouped action
 * @param actionDate - The date of the action
 * @returns The updated game state after applying the action
 */
export function applyGroupedActionSubAction(
  game: IGame,
  subAction: Partial<ILogEntry>,
  playerIndex: number,
  groupedActionId: string,
  actionDate: Date
): IGame {
  if (subAction.action === undefined) {
    throw new Error('Action is required for group action sub-actions');
  }
  if (!Object.values(GameLogAction).includes(subAction.action)) {
    throw new InvalidActionError(subAction.action);
  }
  const subActionLog: ILogEntry = {
    ...subAction,
    action: subAction.action,
    id: uuidv4(),
    timestamp: actionDate,
    ...(NoPlayerActions.includes(subAction.action)
      ? { playerIndex: NO_PLAYER }
      : { playerIndex: playerIndex }),
    currentPlayerIndex: game.currentPlayerIndex,
    turn: game.currentTurn,
    linkedActionId: groupedActionId,
  };
  const error = validateLogAction(game, subActionLog);
  if (error) {
    throw error;
  }
  return applyLogAction(game, subActionLog);
}

/**
 * Get the target players for a grouped action based on the destination.
 * @param game - The current game state
 * @param dest - The destination for the grouped action
 * @returns The array of player indices that are the target of the grouped action
 */
export function getGroupedActionTargetPlayers(game: IGame, dest: GroupedActionDest): number[] {
  switch (dest) {
    case GroupedActionDest.CurrentPlayerIndex:
      return [game.currentPlayerIndex];
    case GroupedActionDest.SelectedPlayerIndex:
      return [game.selectedPlayerIndex];
    case GroupedActionDest.AllPlayers:
      return game.players.map((_, index) => index);
    case GroupedActionDest.AllPlayersExceptCurrent:
      return game.players
        .map((_, index) => index)
        .filter((index) => index !== game.currentPlayerIndex);
    case GroupedActionDest.AllPlayersExceptSelected:
      return game.players
        .map((_, index) => index)
        .filter((index) => index !== game.selectedPlayerIndex);
    default:
      throw new Error(`Invalid GroupedActionDest: ${dest}`);
  }
}

/**
 * Apply a grouped action to the game.
 * @param game - The game state
 * @param playerIndex - The index of the player performing the action
 * @param groupedAction - The grouped action to apply
 * @returns The updated game state
 */
export function applyGroupedAction(
  game: IGame,
  groupedAction: IGroupedAction,
  actionDate: Date,
  applyGroupedActionSubAction: (
    game: IGame,
    subAction: Partial<ILogEntry>,
    playerIndex: number,
    groupedActionId: string,
    actionDate: Date
  ) => IGame,
  prepareGroupedActionTriggers: (
    game: IGame,
    groupedAction: IGroupedAction,
    groupedActionId: string
  ) => IGame
): IGame {
  try {
    let updatedGame = deepClone<IGame>(game);
    const groupedActionId = uuidv4();
    // Create a log entry for the grouped action
    const groupedActionLog: ILogEntry = {
      id: groupedActionId,
      timestamp: actionDate,
      action: GameLogAction.GROUPED_ACTION,
      playerIndex: updatedGame.selectedPlayerIndex,
      currentPlayerIndex: updatedGame.currentPlayerIndex,
      turn: updatedGame.currentTurn,
      actionName: groupedAction.name,
    };
    updatedGame.log.push(groupedActionLog);
    const { timeCache, turnStatisticsCache } = updateCachesForEntry(updatedGame, groupedActionLog);
    updatedGame.timeCache = timeCache;
    updatedGame.turnStatisticsCache = turnStatisticsCache;
    // Apply each sub-action
    for (const [dest, actions] of Object.entries(groupedAction.actions)) {
      const targetPlayers = getGroupedActionTargetPlayers(updatedGame, dest as GroupedActionDest);
      for (const playerIndex of targetPlayers) {
        for (const action of actions) {
          const error = validateLogAction(updatedGame, action as ILogEntry);
          if (error) {
            throw error;
          }
          updatedGame = applyGroupedActionSubAction(
            updatedGame,
            action,
            playerIndex,
            groupedActionId,
            actionDate
          );
        }
      }
    }
    // Prepare and place triggers in the pendingGroupedActions array
    updatedGame = prepareGroupedActionTriggers(updatedGame, groupedAction, groupedActionId);
    return updatedGame;
  } catch (error) {
    console.error('Error applying grouped action:', error);
    throw error;
  }
}

/**
 * Prepare and place triggers in the pendingGroupedActions array.
 * @param game - The current game state
 * @param groupedAction - The grouped action
 * @param groupedActionId - The ID of the grouped action
 * @returns The updated game state
 */
export function prepareGroupedActionTriggers(
  game: IGame,
  groupedAction: IGroupedAction,
  groupedActionId: string
): IGame {
  if (groupedAction.triggers) {
    const updatedGame = deepClone<IGame>(game);
    const afterNextTurnActions = groupedAction.triggers[GroupedActionTrigger.AfterNextTurnBegins];
    if (afterNextTurnActions) {
      for (const [dest, actions] of Object.entries(afterNextTurnActions)) {
        if (!Object.values(GroupedActionDest).includes(dest as GroupedActionDest)) {
          throw new Error(`Invalid GroupedActionDest: ${dest}`);
        }
        if (actions.length === 0) {
          continue;
        }
        const targetPlayers = getGroupedActionTargetPlayers(updatedGame, dest as GroupedActionDest);
        for (const playerIndex of targetPlayers) {
          const activationTurn = getPlayerNextTurnCount(updatedGame, playerIndex, true);
          actions.forEach((action) => {
            if (!action.action) {
              throw new Error('Action is required for trigger sub-actions');
            }
            updatedGame.pendingGroupedActions.push({
              ...action,
              id: uuidv4(),
              action: action.action,
              linkedActionId: groupedActionId,
              playerIndex: playerIndex,
              currentPlayerIndex: playerIndex,
              turn: activationTurn,
            });
          });
        }
      }
    }
    return updatedGame;
  }
  return game;
}

/**
 * Apply a log action to the game.
 * @param game - The current game state
 * @param actionDate - The date of the log action
 * @returns The updated game state
 */
export function applyPendingGroupedActions(
  game: IGame,
  actionDate: Date,
  applyLogAction: (game: IGame, logEntry: ILogEntry) => IGame
): IGame {
  let updatedGame = deepClone<IGame>(game);
  // extract actions to apply from the pendingGroupedActions array
  const actionsToApply = updatedGame.pendingGroupedActions.filter(
    (action) => action.turn === updatedGame.currentTurn
  );
  if (actionsToApply.length === 0) {
    return game;
  }
  // put back an array without the current turn actions
  updatedGame.pendingGroupedActions = updatedGame.pendingGroupedActions.filter(
    (action) => action.turn !== updatedGame.currentTurn
  );
  for (const action of actionsToApply) {
    const actionToApply: ILogEntry = {
      ...action,
      id: uuidv4(),
      timestamp: actionDate,
    } as ILogEntry;
    const error = validateLogAction(updatedGame, actionToApply);
    if (error) {
      throw error;
    }
    updatedGame = applyLogAction(updatedGame, actionToApply);
  }
  return updatedGame;
}

/**
 * Get the signed count for a log entry.
 * @param log - The log entry
 * @returns The signed count for the log entry, negative for removal actions and positive for addition actions.
 */
export function getSignedCount(log: ILogEntry, defaultValue = 0): number {
  const count = log.count ?? defaultValue;
  return NegativeAdjustmentActions.includes(log.action) ? -count : count;
}

/**
 * Calculate victory points and supply by turn for graphing.
 * @param game - The game object containing log entries, players, and supply
 * @returns An array of victory and supply data by turn for graphing
 */
export function calculateVictoryPointsAndSupplyByTurn(game: IGame): IVictoryGraphData[] {
  const result: IVictoryGraphData[] = [];

  game.log.forEach((entry, index) => {
    const reconstructedGame = reconstructGameState({
      ...game,
      log: game.log.slice(0, index + 1),
    });

    if (entry.action === GameLogAction.NEXT_TURN || entry.action === GameLogAction.END_GAME) {
      const victoryPointsByPlayer = reconstructedGame.players.map((player) =>
        calculateVictoryPoints(player)
      );
      result.push({
        playerScores: { ...victoryPointsByPlayer },
        supply: { ...reconstructedGame.supply },
      });
    }
  });

  return result;
}

/**
 * Get the start time of the game.
 * @param game - The game object
 * @returns The start time of the game
 */
export function getGameStartTime(game: IGame): Date {
  if (game.log.length === 0) {
    throw new EmptyLogError();
  }
  if (game.log[0].action !== GameLogAction.START_GAME) {
    throw new InvalidLogStartGameError();
  }
  return new Date(game.log[0].timestamp);
}

/**
 * Get the end time of the game.
 * @param game - The game object
 * @returns The end time of the game
 */
export function getGameEndTime(game: IGame): Date {
  if (game.log.length === 0) {
    throw new EmptyLogError();
  }
  const lastLog = game.log[game.log.length - 1];
  if (lastLog.action !== GameLogAction.END_GAME) {
    throw new Error('Game has not ended');
  }
  return new Date(lastLog.timestamp);
}

/**
 * Get the start time of a turn.
 * @param game - The game object
 * @param turn - The turn number
 * @returns The start time of the turn
 */
export function getTurnStartTime(game: IGame, turn: number): Date {
  if (turn === 1) {
    return getGameStartTime(game);
  }
  const newTurnLog = game.log.find(
    (entry) => entry.action === GameLogAction.NEXT_TURN && entry.turn === turn
  );
  if (newTurnLog === undefined) {
    throw new Error(`Could not find turn ${turn} in the log`);
  }
  return newTurnLog.timestamp;
}

/**
 * Return the highest turn number in the game
 * @param game - The game object
 * @returns The highest turn number in the game
 */
export function getGameTurnCount(game: IGame): number {
  if (game.log.length === 0) {
    throw new EmptyLogError();
  }
  return game.log[game.log.length - 1].turn;
}

/**
 * Get the end time of a turn.
 * @param game - The game object
 * @param turn - The turn number
 * @returns The end time of the turn
 */
export function getTurnEndTime(game: IGame, turn: number): Date {
  if (game.log.length === 0) {
    throw new EmptyLogError();
  }
  // a turn ends with either a NEXT_TURN or END_GAME action
  // a NEXT_TURN will have the next higher turn number than the current turn
  // an END_GAME will have the same turn number as the current turn
  const nextTurnLog = game.log.find(
    (entry) => entry.action === GameLogAction.NEXT_TURN && entry.turn === turn + 1
  );
  if (nextTurnLog !== undefined) {
    return nextTurnLog.timestamp;
  }
  const endGameLog = game.log.find(
    (entry) => entry.action === GameLogAction.END_GAME && entry.turn === turn
  );
  if (endGameLog !== undefined) {
    return endGameLog.timestamp;
  }
  throw new Error(`Could not find end time for turn ${turn}`);
}

/**
 * Get the adjustments made during the current turn
 * @param game - The game object
 * @returns An array of turn adjustments
 */
export function getTurnAdjustments(game: IGame, turn?: number): Array<ITurnAdjustment> {
  return game.log
    .filter(
      (entry) =>
        entry.turn === (turn ?? game.currentTurn) && AdjustmentActions.includes(entry.action)
    )
    .map((entry) => {
      const { field, subfield } = getFieldAndSubfieldFromAction(entry.action);
      return { field, subfield, increment: getSignedCount(entry) };
    });
}

/**
 * Group turn adjustments by field and subfield
 * @param adjustments - An array of turn adjustments
 * @returns An array of grouped turn adjustments
 */
export function groupTurnAdjustments(adjustments: Array<ITurnAdjustment>): Array<ITurnAdjustment> {
  const groupedAdjustments: Array<ITurnAdjustment> = [];
  adjustments.forEach((adjustment) => {
    const existingAdjustment = groupedAdjustments.find(
      (adj) => adj.field === adjustment.field && adj.subfield === adjustment.subfield
    );
    if (existingAdjustment) {
      existingAdjustment.increment += adjustment.increment;
    } else {
      groupedAdjustments.push(adjustment);
    }
  });
  return groupedAdjustments;
}

/**
 * Get the player for a given turn
 * @param game - The game object
 * @param turn - The turn number
 * @returns The player object for the turn
 */
export function getPlayerForTurn(game: IGame, turn: number): IPlayer {
  const turnAction = turn === 1 ? GameLogAction.START_GAME : GameLogAction.NEXT_TURN;
  const turnEntry = game.log.find((entry) => entry.action === turnAction && entry.turn === turn);
  if (turnEntry === undefined) {
    throw new Error(`Could not find turn ${turn} in the log`);
  }
  if (
    turnEntry.playerIndex === undefined ||
    turnEntry.playerIndex < 0 ||
    turnEntry.playerIndex >= game.players.length
  ) {
    throw new InvalidPlayerIndexError(
      turnEntry.playerIndex,
      `Invalid player index ${turnEntry.playerIndex} for turn ${turn} in the log`
    );
  }
  return game.players[turnEntry.playerIndex];
}

/**
 * Get the average actions per turn in the game.
 * @param game - The game object
 * @returns The average actions per turn
 */
export function getAverageActionsPerTurn(game: IGame): number {
  // turns start with START_GAME or NEXT_TURN and end with NEXT_TURN or END_GAME
  // count everything between turns, not counting PAUSE, UNPAUSE, SAVE_GAME, LOAD_GAME, SELECT_PLAYER
  let totalActions = 0;
  let totalTurns = 0;
  for (let i = 0; i < game.log.length - 1; i++) {
    if (
      game.log[i].action === GameLogAction.START_GAME ||
      game.log[i].action === GameLogAction.NEXT_TURN
    ) {
      totalTurns++;
      continue;
    }
    if (
      game.log[i].action !== GameLogAction.PAUSE &&
      game.log[i].action !== GameLogAction.UNPAUSE &&
      game.log[i].action !== GameLogAction.SAVE_GAME &&
      game.log[i].action !== GameLogAction.LOAD_GAME &&
      game.log[i].action !== GameLogAction.SELECT_PLAYER
    ) {
      totalActions++;
    }
  }
  if (totalTurns === 0) {
    return 0;
  }
  return Math.floor(totalActions / totalTurns);
}

/**
 * Get the next turn number for a given player (when it will be their turn)
 * @param game
 * @param playerIndex
 */
export function getPlayerNextTurnCount(
  game: IGame,
  playerIndex: number,
  skipCurrentTurn = false
): number {
  if (playerIndex < 0 || playerIndex >= game.players.length) {
    throw new InvalidPlayerIndexError(playerIndex);
  }
  if (!skipCurrentTurn && game.currentPlayerIndex === playerIndex) {
    return game.currentTurn;
  }
  // given the current turn and player, find the next turn where the player will be the current player
  // turns increment by 1 each time and player index wraps around back to zero when it reaches the last player index
  const totalPlayers = game.players.length;
  let nextTurn = game.currentTurn + 1;
  let nextPlayerIndex = (game.currentPlayerIndex + 1) % totalPlayers;

  while (nextPlayerIndex !== playerIndex) {
    nextTurn++;
    nextPlayerIndex = (nextPlayerIndex + 1) % totalPlayers;
  }

  return nextTurn;
}

/**
 * Get the master action ID for a given log entry.
 * @param logEntry - The log entry
 * @returns The master action ID
 */
export function getMasterActionId(logEntry: ILogEntry): string {
  return logEntry.linkedActionId ?? logEntry.id;
}
