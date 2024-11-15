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
  getFieldAndSubfieldFromAction,
  NewGameState,
  updatePlayerField,
} from '@/game/starrealms-lib';
import { reconstructGameState } from '@/game/starrealms-lib-undo-helpers';
import { GamePausedError } from '@/game/errors/game-paused';
import { CountRequiredError } from '@/game/errors/count-required';
import { IVictoryGraphData } from '@/game/interfaces/victory-graph-data';
import { ITurnAdjustment } from '@/game/interfaces/turn-adjustment';
import { IPlayer } from '@/game/interfaces/player';
import { deepClone } from '@/game/utils';
import { IPlayerGameTurnDetails } from '@/game/interfaces/player-game-turn-details';
import { CurrentStep } from '@/game/enumerations/current-step';
import { InvalidPlayerIndexError } from '@/game/errors/invalid-player-index';
import { futureActionMap } from '@/game/enumerations/future-action';
import { ITurnStatistics } from './interfaces/turn-statistics';
import { IGameSupply } from './interfaces/game-supply';

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
        case 'authority':
          return increment > 0 ? GameLogAction.ADD_AUTHORITY : GameLogAction.REMOVE_AUTHORITY;
        case 'trade':
          return increment > 0 ? GameLogAction.ADD_TRADE : GameLogAction.REMOVE_TRADE;
        case 'combat':
          return increment > 0 ? GameLogAction.ADD_COMBAT : GameLogAction.REMOVE_COMBAT;
        case 'cards':
          return increment > 0 ? GameLogAction.ADD_CARDS : GameLogAction.REMOVE_CARDS;
        case 'gains':
          return increment > 0 ? GameLogAction.ADD_GAINS : GameLogAction.REMOVE_GAINS;
        case 'discard':
          return increment > 0 ? GameLogAction.ADD_DISCARD : GameLogAction.REMOVE_DISCARD;
        case 'scrap':
          return increment > 0 ? GameLogAction.SCRAP : GameLogAction.UNSCRAP;
        default:
          throw new InvalidFieldError(field as string, subfield as string);
      }
    case 'authority':
      switch (subfield) {
        case 'authority':
          return increment > 0 ? GameLogAction.ADD_AUTHORITY : GameLogAction.REMOVE_AUTHORITY;
        default:
          throw new InvalidFieldError(field as string, subfield as string);
      }
    case 'newTurn':
      switch (subfield) {
        case 'trade':
          return increment > 0
            ? GameLogAction.ADD_NEXT_TURN_TRADE
            : GameLogAction.REMOVE_NEXT_TURN_TRADE;
        case 'combat':
          return increment > 0
            ? GameLogAction.ADD_NEXT_TURN_COMBAT
            : GameLogAction.REMOVE_NEXT_TURN_COMBAT;
        case 'cards':
          return increment > 0
            ? GameLogAction.ADD_NEXT_TURN_CARDS
            : GameLogAction.REMOVE_NEXT_TURN_CARDS;
        case 'gains':
          return increment > 0
            ? GameLogAction.ADD_NEXT_TURN_GAINS
            : GameLogAction.REMOVE_NEXT_TURN_GAINS;
        case 'discard':
          return increment > 0
            ? GameLogAction.ADD_NEXT_TURN_DISCARD
            : GameLogAction.REMOVE_NEXT_TURN_DISCARD;
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
 * @param useFutureTense - Whether to use future tense for the action
 * @returns The string representation of the log entry
 */
export function logEntryToString(entry: ILogEntry, useFutureTense = false): string {
  let actionString = entry.action as string;

  if (useFutureTense && futureActionMap[entry.action]) {
    actionString = futureActionMap[entry.action];
  }

  if (entry.count !== undefined) {
    actionString = actionString.replace('{COUNT}', entry.count.toString());
  } else {
    // Remove {COUNT} if no count is provided
    actionString = actionString.replace(' {COUNT}', '');
  }

  return actionString;
}

export function actionToString(
  action: GameLogAction,
  count?: number | ((game: IGame, playerIndex: number) => number),
  useFutureTense = false
): string {
  let actionString = action as string;

  if (useFutureTense && futureActionMap[action]) {
    actionString = futureActionMap[action];
  }

  if (count !== undefined && typeof count === 'function') {
    actionString = actionString.replace('{COUNT}', 'computed');
  } else if (count !== undefined) {
    actionString = actionString.replace('{COUNT}', count.toString());
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
  if (logEntries.length < 2) {
    return [];
  }
  const startGameEntry = logEntries[0];
  if (startGameEntry.action !== GameLogAction.START_GAME) {
    throw new Error('Log must start with a START_GAME action');
  }
  const durations: ITurnDuration[] = [];
  let lastTurnGameTime = 0;
  let lastTurnStart: Date = startGameEntry.timestamp;
  let inPauseState = false;

  for (const entry of logEntries) {
    const { action, gameTime } = entry;

    if (inPauseState && action !== GameLogAction.UNPAUSE) {
      throw new GamePausedError();
    } else if (action === GameLogAction.NEXT_TURN || action === GameLogAction.END_GAME) {
      if (lastTurnGameTime !== null) {
        const turnDuration = gameTime - lastTurnGameTime;
        durations.push({
          turn: action === GameLogAction.END_GAME ? entry.turn : entry.turn - 1,
          playerIndex: entry.prevPlayerIndex ?? entry.playerIndex,
          start: lastTurnStart,
          end: entry.timestamp,
          duration: turnDuration,
        });
        lastTurnGameTime = gameTime;
        lastTurnStart = entry.timestamp;
      }
      if (action === GameLogAction.END_GAME) {
        break;
      }
    } else if (action === GameLogAction.PAUSE) {
      inPauseState = true;
    } else if (action === GameLogAction.UNPAUSE) {
      inPauseState = false;
    }
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
  return eventTime.getTime() - lastActionTime.getTime();
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

  return totalDuration / turnDurations.length;
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

  return totalDuration / playerTurns.length;
}

/**
 * Calculates the total number of actions performed by a specific player.
 * @param logEntries - The game log entries.
 * @param startIndex - The index of the first log entry to consider.
 * @param endTime - The end time up to which the actions are counted.
 * @returns The total number of actions performed by the player.
 */
export function calculatePausedTime(
  logEntries: ILogEntry[],
  startIndex: number,
  endTime: Date
): number {
  let totalPausedTime = 0;
  let lastSaveTime: number | null = null;
  let pauseStartTime: number | null = null;

  for (let i = startIndex; i < logEntries.length; i++) {
    const entry = logEntries[i];
    if (entry.timestamp.getTime() >= endTime.getTime()) {
      break;
    }

    if (entry.action === GameLogAction.SAVE_GAME) {
      lastSaveTime = entry.timestamp.getTime();
    } else if (entry.action === GameLogAction.LOAD_GAME && lastSaveTime !== null) {
      totalPausedTime += entry.timestamp.getTime() - lastSaveTime;
      lastSaveTime = null;
    } else if (entry.action === GameLogAction.PAUSE) {
      pauseStartTime = entry.timestamp.getTime();
    } else if (entry.action === GameLogAction.UNPAUSE && pauseStartTime !== null) {
      totalPausedTime += entry.timestamp.getTime() - pauseStartTime;
      pauseStartTime = null;
    }
  }

  // Handle case where the end time is during a pause
  if (pauseStartTime !== null) {
    totalPausedTime += endTime.getTime() - pauseStartTime;
  }

  return totalPausedTime;
}

/**
 * Calculates the duration of the current turn from the last NEXT_TURN or START_GAME up to the current time.
 * Subtracts the time between any SAVE_GAME and the immediately following LOAD_GAME within the turn.
 * @param logEntries - The game log entries.
 * @param currentTime - The current time.
 * @returns The duration of the current turn in milliseconds.
 */
export function calculateCurrentTurnDuration(logEntries: ILogEntry[], currentTime: Date): number {
  if (logEntries.length === 0) {
    return 0;
  }
  const currentTurn = logEntries[logEntries.length - 1].turn;
  const turnStartEntry = getTurnStartEntry(logEntries, currentTurn);

  const totalPausedTime = calculatePausedTime(
    logEntries,
    logEntries.indexOf(turnStartEntry),
    currentTime
  );
  const currentTurnDuration = currentTime.getTime() - turnStartEntry.timestamp.getTime();
  return currentTurnDuration - totalPausedTime;
}

/**
 * Calculate the total duration of the game from the start of the game to the current time, subtracting the time between any SAVE_GAME and the immediately following LOAD_GAME within the turn.
 * @param log - The game log entries
 * @param calculateTurnDurations - A function to calculate turn durations from the log entries
 * @param calculateCurrentTurnDuration - A function to calculate the duration of the current turn
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
  if (logEntries.length === 0) {
    return 0;
  }

  const startGameTime = logEntries[0].timestamp.getTime();
  if (eventTime.getTime() <= startGameTime) {
    return 0;
  }

  const totalPausedTime = calculatePausedTime(logEntries, 0, eventTime);
  const eventDuration = eventTime.getTime() - startGameTime;
  return Math.max(0, eventDuration - totalPausedTime);
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

  const eventTime = new Date();
  const newLog: ILogEntry = {
    id: uuidv4(),
    timestamp: eventTime,
    gameTime: calculateDurationUpToEvent(game.log, eventTime),
    action,
    playerIndex,
    currentPlayerIndex: game.currentPlayerIndex,
    turn: game.currentTurn,
    ...overrides,
  };
  game.log.push(newLog);
  const turnStartEvent = getTurnStartEntry(game.log, game.currentTurn);
  if (action === GameLogAction.NEXT_TURN || action === GameLogAction.END_GAME) {
    const turnStatisticsEntry: ITurnStatistics = {
      turn: game.currentTurn,
      playerScores: game.players.map((player) => player.authority.authority),
      supply: deepClone<IGameSupply>(game.supply),
      playerIndex: overrides?.prevPlayerIndex ?? playerIndex,
      start: turnStartEvent.timestamp,
      end: newLog.timestamp,
      turnDuration: newLog.gameTime - turnStartEvent.gameTime,
    };
    game.turnStatisticsCache.push(turnStatisticsEntry);
  }
  return newLog;
}

export function validateLogAction(
  game: IGame,
  logEntry: ILogEntry | Partial<ILogEntry>
): Error | null {
  if (logEntry.action === undefined) {
    return new Error('Log entry action is required');
  }

  // validate that logEntry.action is a valid GameLogAction
  if (!Object.values(GameLogAction).includes(logEntry.action)) {
    return new Error(`Invalid log entry action: ${logEntry.action}`);
  }

  // Validate player index for actions that require a valid player index
  if (ActionsWithPlayer.includes(logEntry.action) && logEntry.playerIndex === undefined) {
    return new Error('Player index is required for this action');
  } else if (
    ActionsWithPlayer.includes(logEntry.action) &&
    logEntry.playerIndex !== undefined &&
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
    if (logEntry.action === GameLogAction.REMOVE_AUTHORITY) {
      checkPlayerEliminationAndGameEnd(updatedGame);
    }
    const { field, subfield } = getFieldAndSubfieldFromAction(logEntry.action);
    if (field && subfield) {
      const increment = getSignedCount(logEntry, 1);
      updatedGame = updatePlayerField(
        updatedGame,
        logEntry.playerIndex,
        field as keyof PlayerFieldMap,
        subfield,
        increment
      );
    }
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
  const turnStartEvent = getTurnStartEntry(updatedGame.log, game.currentTurn);
  if (logEntry.action === GameLogAction.NEXT_TURN || logEntry.action === GameLogAction.END_GAME) {
    const turnStatisticsEntry: ITurnStatistics = {
      turn: game.currentTurn,
      playerScores: game.players.map((player) => player.authority.authority),
      supply: deepClone<IGameSupply>(game.supply),
      playerIndex: logEntry.prevPlayerIndex ?? logEntry.playerIndex,
      start: turnStartEvent.timestamp,
      end: logEntry.timestamp,
      turnDuration: logEntry.gameTime - turnStartEvent.gameTime,
    };
    game.turnStatisticsCache.push(turnStatisticsEntry);
  }

  return updatedGame;
}

/**
 * Get the signed count for a log entry.
 * @param log - The log entry
 * @param defaultValue - The default value to use if the count is not provided
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
export function calculateAuthorityAndSupplyByTurn(game: IGame): IVictoryGraphData[] {
  const result: IVictoryGraphData[] = [];

  game.log.forEach((entry, index) => {
    const reconstructedGame = reconstructGameState({
      ...game,
      log: game.log.slice(0, index + 1),
    });

    if (entry.action === GameLogAction.NEXT_TURN || entry.action === GameLogAction.END_GAME) {
      const authorityByPlayer = reconstructedGame.players.map(
        (player) => player.authority.authority
      );
      result.push({
        playerScores: { ...authorityByPlayer },
        supply: { ...reconstructedGame.supply },
      });
    }
  });

  return result;
}

export function checkPlayerEliminationAndGameEnd(game: IGame): void {
  const activePlayers = game.players.filter((player) => player.authority.authority > 0);

  if (activePlayers.length === 1 && game.players.length > 1) {
    const endTimestamp = new Date();
    // Only one player remains with authority > 0, end the game
    addLogEntry(game, NO_PLAYER, GameLogAction.END_GAME, {
      action: GameLogAction.END_GAME,
      playerIndex: -1,
      turn: game.currentTurn,
      timestamp: endTimestamp,
      gameTime: calculateDurationUpToEvent(game.log, endTimestamp),
    });
  }
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
 * @param logEntries - The log entries
 * @param turn - The turn number
 * @returns The log entry marking the beginning of the turn
 */
export function getTurnStartEntry(logEntries: ILogEntry[], turn: number): ILogEntry {
  if (turn === 1 && logEntries.length > 0) {
    return logEntries[0];
  } else if (logEntries.length === 0) {
    throw new EmptyLogError();
  }
  const newTurnLog = logEntries.find(
    (entry) => entry.action === GameLogAction.NEXT_TURN && entry.turn === turn
  );
  if (newTurnLog === undefined) {
    throw new Error(`Could not find turn ${turn} in the log`);
  }
  return newTurnLog;
}

/**
 * Get the start time of a turn.
 * @param game - The game object
 * @param turn - The turn number
 * @returns The start time of the turn
 */
export function getTurnStartTime(game: IGame, turn: number): Date {
  const newTurnLog = getTurnStartEntry(game.log, turn);
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
  let nextTurnLog;
  try {
    nextTurnLog = getTurnStartEntry(game.log, turn + 1);
  } catch {
    // do nothing
    nextTurnLog = undefined;
  }
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
 * @param turn - The turn number (optional)
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
  // filter out net-zero adjustments
  return groupedAdjustments.filter((adjustment) => adjustment.increment !== 0);
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
 * @param game - The game object
 * @param playerIndex - The index of the player
 * @param skipCurrentTurn - Whether to skip the current turn
 * @returns The next turn number for the player
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

/**
 * Rebuild the turn statistics cache for a given game.
 * This function is expected to be computationally expensive and should be called only when necessary.
 * The turn statistics should be maintained automatically throughout the game in normal conditions.
 * @param game - The game object containing log entries, time cache, and turn statistics cache.
 */
export function rebuildTurnStatisticsCache(game: IGame): Array<ITurnStatistics> {
  if (game.log.length === 0) {
    return [];
  }

  const newTurnStatisticsCache: Array<ITurnStatistics> = [];
  let reconstructedGame = NewGameState(game, game.log[0].timestamp);
  // clear the log
  reconstructedGame.log = [];

  let turnStart: Date = game.log[0].timestamp;
  let turnStartGameTime = 0;
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
        playerScores: reconstructedGame.players.map((player) => player.authority.authority),
        playerIndex: entry.prevPlayerIndex ?? game.currentPlayerIndex,
        turnDuration: entry.gameTime - turnStartGameTime,
      });
      turnStart = entry.timestamp;
      turnStartGameTime = entry.gameTime;
      currentTurn++;
    } else if (entry.action === GameLogAction.END_GAME) {
      turnEnd = entry.timestamp;
      newTurnStatisticsCache.push({
        turn: currentTurn,
        start: turnStart,
        end: turnEnd,
        supply: reconstructedGame.supply,
        playerScores: reconstructedGame.players.map((player) => player.authority.authority),
        playerIndex: entry.prevPlayerIndex ?? game.currentPlayerIndex,
        turnDuration: entry.gameTime - turnStartGameTime,
      });
      turnStartGameTime = entry.gameTime;
      break;
    }
  }

  return newTurnStatisticsCache;
}

/**
 * Rebuild the game time history for a given game.
 * @param game - The game object containing log entries and time cache.
 * @returns The game object with updated game time history.
 */
export function rebuildGameTimeHistory(game: IGame): IGame {
  const newGame = deepClone<IGame>(game);
  newGame.log = [game.log[0]];
  let lastGameTime = 0;
  for (let i = 1; i < game.log.length; i++) {
    // if the entry is a load or unpause, we dont increase the game time from the associated save/pause
    if (
      game.log[i].action === GameLogAction.LOAD_GAME ||
      game.log[i].action === GameLogAction.UNPAUSE
    ) {
      newGame.log.push({ ...game.log[i], gameTime: lastGameTime });
    } else {
      const gameTime = calculateDurationUpToEvent(newGame.log, game.log[i].timestamp);
      newGame.log.push({
        ...game.log[i],
        gameTime,
      });
      lastGameTime = gameTime;
    }
  }
  return newGame;
}
