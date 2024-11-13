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
  NewGameState,
  updatePlayerField,
} from '@/game/dominion-lib';
import { InvalidTrashActionError } from '@/game/errors/invalid-trash-action';
import { reconstructGameState } from '@/game/dominion-lib-undo-helpers';
import { GamePausedError } from '@/game/errors/game-paused';
import { CountRequiredError } from '@/game/errors/count-required';
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
import { RecipeKey, Recipes, RecipeSections } from '@/components/Recipes';
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
        case 'discard':
          return increment > 0 ? GameLogAction.ADD_DISCARD : GameLogAction.REMOVE_DISCARD;
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
 * @returns The string representation of the log entry
 */
export function logEntryToString(entry: ILogEntry, useFutureTense = false): string {
  let actionString = entry.action as string;

  if (useFutureTense && futureActionMap[entry.action]) {
    actionString = futureActionMap[entry.action];
  }

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
  if (logEntries.length === 0) {
    return 0;
  }
  const currentTurn = logEntries[logEntries.length - 1].turn;
  const turnStartEntry: ILogEntry = getTurnStartEntry(logEntries, currentTurn);
  const lastEntry: ILogEntry = logEntries[logEntries.length - 1];

  const turnGameTime = lastEntry.gameTime - turnStartEntry.gameTime;
  const lastActionDuration = currentTime.getTime() - lastEntry.timestamp.getTime();
  return turnGameTime + lastActionDuration;
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
  if (logEntries.length < 1) {
    return 0;
  }
  // find the last entry before the event time
  let lastEntryBeforeEvent: ILogEntry = logEntries[0];
  for (let i = logEntries.length - 1; i >= 0; i--) {
    const entry = logEntries[i];
    if (entry.timestamp.getTime() < eventTime.getTime()) {
      lastEntryBeforeEvent = entry;
      break;
    }
  }
  if (eventTime.getTime() <= lastEntryBeforeEvent.timestamp.getTime()) {
    return 0;
  } else if (
    lastEntryBeforeEvent.action === GameLogAction.PAUSE ||
    lastEntryBeforeEvent.action === GameLogAction.END_GAME
  ) {
    return lastEntryBeforeEvent.gameTime;
  }
  return (
    lastEntryBeforeEvent.gameTime + (eventTime.getTime() - lastEntryBeforeEvent.timestamp.getTime())
  );
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
  if (overrides?.trash === true && (field !== 'victory' || getSignedCount(newLog) >= 0)) {
    throw new InvalidTrashActionError();
  }
  game.log.push(newLog);
  const turnStartEvent = getTurnStartEntry(game.log, game.currentTurn);
  if (action === GameLogAction.NEXT_TURN || action === GameLogAction.END_GAME) {
    const turnStatisticsEntry: ITurnStatistics = {
      turn: game.currentTurn,
      playerScores: game.players.map((player) => calculateVictoryPoints(player)),
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
  const turnStartEvent = getTurnStartEntry(updatedGame.log, game.currentTurn);
  if (logEntry.action === GameLogAction.NEXT_TURN || logEntry.action === GameLogAction.END_GAME) {
    const turnStatisticsEntry: ITurnStatistics = {
      turn: game.currentTurn,
      playerScores: game.players.map((player) => calculateVictoryPoints(player)),
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
    gameTime: calculateDurationUpToEvent(game.log, actionDate),
    ...(NoPlayerActions.includes(subAction.action)
      ? { playerIndex: NO_PLAYER }
      : { playerIndex: playerIndex }),
    currentPlayerIndex: game.currentPlayerIndex,
    turn: game.currentTurn,
    linkedActionId: groupedActionId,
  } as ILogEntry;
  const error = validateLogAction(game, subActionLog);
  if (error) {
    throw error;
  }
  let updatedGame = applyLogAction(game, subActionLog);
  if (
    subAction.action === GameLogAction.REMOVE_ACTIONS &&
    game.options.expansions.risingSun &&
    game.expansions.risingSun.greatLeaderProphecy &&
    game.expansions.risingSun.prophecy.suns === 0
  ) {
    const actionCount = subAction.count ?? 1;
    const prophecyActionLog: ILogEntry = {
      id: uuidv4(),
      action: GameLogAction.ADD_ACTIONS,
      actionName: `Added ${actionCount} actions (Great Leader Prophecy)`,
      count: actionCount,
      timestamp: actionDate,
      gameTime: calculateDurationUpToEvent(game.log, actionDate),
      playerIndex: playerIndex,
      currentPlayerIndex: game.currentPlayerIndex,
      turn: game.currentTurn,
      linkedActionId: groupedActionId,
    };
    updatedGame = applyLogAction(updatedGame, prophecyActionLog);
  }
  return updatedGame;
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
 * applyGroupedAction can take a one-off grouped action, but then should not be supplied with a groupedActionKey
 * the groupedActionKey will allow the game log to show the correct action icon, etc when a recipe action is applied
 * @param game - The game state
 * @param groupedActionKey - The key of the grouped action to apply
 * @param groupedAction - The grouped action to apply
 * @param actionDate - The date of the action
 * @param applyGroupedActionSubAction - A function to apply sub-actions to the game
 * @param prepareGroupedActionTriggers - A function to prepare triggers for the grouped action
 * @param groupedActionKey - The key of the grouped action (optional)
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
  ) => IGame,
  groupedActionKey?: RecipeKey
): IGame {
  try {
    if (groupedActionKey) {
      let foundGroupAction = false;
      for (const sectionKey in Recipes) {
        if (Object.prototype.hasOwnProperty.call(Recipes, sectionKey)) {
          const section = Recipes[sectionKey as RecipeSections];
          if (Object.prototype.hasOwnProperty.call(section.recipes, groupedActionKey)) {
            // if the passed in groupAction does not match the recipe, throw an error
            if (section.recipes[groupedActionKey].name !== groupedAction.name) {
              throw new Error(
                `Invalid grouped action. The passed in grouped action does not match the recipe for key '${groupedActionKey}'.`
              );
            }
            foundGroupAction = true;
            break;
          }
        }
      }

      if (!foundGroupAction) {
        throw new Error(`Invalid recipe key: ${groupedActionKey}`);
      }
    }
    let updatedGame = deepClone<IGame>(game);
    const groupedActionId = uuidv4();
    // Create a log entry for the grouped action
    const groupedActionLog: ILogEntry = {
      id: groupedActionId,
      timestamp: actionDate,
      gameTime: calculateDurationUpToEvent(game.log, actionDate),
      action: GameLogAction.GROUPED_ACTION,
      playerIndex: updatedGame.selectedPlayerIndex,
      currentPlayerIndex: updatedGame.currentPlayerIndex,
      turn: updatedGame.currentTurn,
      actionName: groupedAction.name,
      ...(groupedActionKey ? { actionKey: groupedActionKey } : {}),
    };
    updatedGame = applyLogAction(updatedGame, groupedActionLog);
    // Apply each sub-action
    for (const [dest, actions] of Object.entries(groupedAction.actions)) {
      const targetPlayers = getGroupedActionTargetPlayers(updatedGame, dest as GroupedActionDest);
      for (const playerIndex of targetPlayers) {
        for (const action of actions) {
          // if count is a callback function, extract the count from the callback function
          const actionToApply: Partial<ILogEntry> = {
            ...deepClone(action as Partial<ILogEntry>),
            ...(typeof action.count === 'function'
              ? { count: action.count(updatedGame, playerIndex) }
              : {}),
            playerIndex,
            turn: updatedGame.currentTurn,
          } as Partial<ILogEntry>;
          const error = validateLogAction(updatedGame, actionToApply);
          if (error) {
            throw error;
          }
          updatedGame = applyGroupedActionSubAction(
            updatedGame,
            actionToApply,
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
      gameTime: calculateDurationUpToEvent(updatedGame.log, actionDate),
      ...(typeof action.count === 'function'
        ? { count: action.count(updatedGame, action.playerIndex ?? updatedGame.currentPlayerIndex) }
        : {}),
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
  let nextTurnLog = undefined;
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
        playerScores: reconstructedGame.players.map((player) => calculateVictoryPoints(player)),
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
        playerScores: reconstructedGame.players.map((player) => calculateVictoryPoints(player)),
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
  const lastGameTime = 0;
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
    }
  }
  return newGame;
}
