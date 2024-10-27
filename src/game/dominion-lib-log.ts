import { v4 as uuidv4 } from 'uuid';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import { EmptyLogError } from '@/game/errors/empty-log';
import { InvalidFieldError } from '@/game/errors/invalid-field';
import { InvalidLogStartGameError } from '@/game/errors/invalid-log-start-game';
import { IGame } from '@/game/interfaces/game';
import { ILogEntry } from '@/game/interfaces/log-entry';
import { PlayerFieldMap } from '@/game/types';
import { AdjustmentActions, NegativeAdjustmentActions, NoPlayerActions } from '@/game/constants';
import { ITurnDuration } from '@/game/interfaces/turn-duration';
import { calculateVictoryPoints, getFieldAndSubfieldFromAction } from '@/game/dominion-lib';
import { InvalidTrashActionError } from '@/game/errors/invalid-trash-action';
import { IVictoryGraphData } from '@/game/interfaces/victory-graph-data';
import { reconstructGameState } from '@/game/dominion-lib-undo-helpers';
import { GamePausedError } from './errors/game-paused';
import { CountRequiredError } from './errors/count-required';

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

  if (entry.count !== undefined) {
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
  for (const entry of logEntries) {
    if (entry.action === GameLogAction.START_GAME) {
      startGameTime = entry.timestamp;
      break;
    }
  }

  if (startGameTime === null || startGameTime >= eventTime) {
    // No START_GAME found or eventTime is before the game started
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
 * @param game - The game object
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
  return newLog;
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
        scoreByPlayer: { ...victoryPointsByPlayer },
        supply: { ...reconstructedGame.supply },
      });
    }
  });

  return result;
}
