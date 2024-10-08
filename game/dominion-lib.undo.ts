import { NO_PLAYER, NoPlayerActions } from '@/game/constants';
import {
  getActionIncrementMultiplier,
  getFieldAndSubfieldFromAction,
  incrementTurnCountersAndPlayerIndices,
  updatePlayerField,
} from '@/game/dominion-lib';
import { GameLogActionWithCount } from '@/game/enumerations/game-log-action-with-count';
import { IGame } from '@/game/interfaces/game';
import { ILogEntry } from '@/game/interfaces/log-entry';
import { PlayerFieldMap } from '@/game/types';
import { NotEnoughProphecyError } from '@/game/errors/not-enough-prophecy';
import { NotEnoughSupplyError } from './errors/not-enough-supply';
import { NotEnoughSubfieldError } from './errors/not-enough-subfield';
import * as undoHelpers from './dominion-lib.undo.helpers';

/**
 * Returns the linked actions for the given log entry.
 * @param log - The log entries
 * @param index - The index of the log entry
 * @returns The linked actions
 */
export function getLinkedActions(log: ILogEntry[], index: number): ILogEntry[] {
  // do not recurse if the log entry is a linked action itself
  if (log[index].linkedAction !== undefined) {
    return [];
  }
  // get all linked actions
  const linkedActions = log.filter((logEntry) => logEntry.linkedAction === log[index].id);
  return [log[index], ...linkedActions];
}

/**
 * Checks if an action can be undone without causing negative counters.
 * @param game - The current game state
 * @param logIndex - The index of the action to undo in the game log
 * @returns Whether the action can be undone
 */
export function canUndoAction(game: IGame, logIndex: number): boolean {
  if (logIndex < 0 || logIndex >= game.log.length) {
    return false;
  }

  const actionToUndo = game.log[logIndex];

  // Find the main action if this is a linked action
  let mainActionIndex = logIndex;
  if (actionToUndo.linkedAction !== undefined) {
    mainActionIndex = game.log.findIndex((entry) => entry.id === actionToUndo.linkedAction);
    if (mainActionIndex === -1) {
      return false; // Linked action's main action not found
    }
  }

  // Create a temporary game state to simulate undoing
  let tempGame = JSON.parse(JSON.stringify(game)) as IGame;

  // Remove the action and its linked actions
  tempGame = undoHelpers.removeTargetAndLinkedActions(tempGame, mainActionIndex);

  // Try to reconstruct the game state
  try {
    undoHelpers.reconstructGameState(tempGame);
    return true;
  } catch (error) {
    // If an error is thrown, it means we encountered negative counters or other issues
    console.error('Error during game state reconstruction:', error);
    return false;
  }
}

/**
 * Undoes a specific action in the game log.
 * @param game - The current game state
 * @param logIndex - The index of the action to undo in the game log
 * @returns The updated game state after undoing the action
 */
export function undoAction(game: IGame, logIndex: number): { game: IGame; success: boolean } {
  if (!canUndoAction(game, logIndex)) {
    return { game, success: false };
  }

  try {
    const gameWithRemovedActions = undoHelpers.removeTargetAndLinkedActions(game, logIndex);
    const reconstructedGame = undoHelpers.reconstructGameState(gameWithRemovedActions);

    return { game: reconstructedGame, success: true };
  } catch (error) {
    if (
      error instanceof NotEnoughSupplyError ||
      error instanceof NotEnoughSubfieldError ||
      error instanceof NotEnoughProphecyError
    ) {
      console.error('Cannot undo action: it would result in negative counters');
    } else {
      console.error('Error undoing action:', error);
    }
    return { game, success: false };
  }
}

/**
 * Applies a single log action to the game state.
 * @param game - The current game state
 * @param logEntry - The log entry to apply
 * @returns The updated game state after applying the action
 */
export function applyLogAction(game: IGame, logEntry: ILogEntry): IGame {
  let updatedGame = { ...game };

  if (logEntry.action === GameLogActionWithCount.NEXT_TURN) {
    // Move to next player
    updatedGame = incrementTurnCountersAndPlayerIndices(updatedGame);

    // Reset all players' turn counters to their newTurn values
    updatedGame.players = updatedGame.players.map((player) => ({
      ...player,
      turn: player.newTurn,
    }));
  } else if (
    logEntry.playerIndex !== NO_PLAYER &&
    logEntry.playerIndex < updatedGame.players.length &&
    !NoPlayerActions.includes(logEntry.action)
  ) {
    const { field, subfield } = getFieldAndSubfieldFromAction(logEntry.action);
    if (field && subfield) {
      const count = logEntry.count ?? 1;
      const increment = getActionIncrementMultiplier(logEntry.action) * count;
      updatedGame = updatePlayerField(
        updatedGame,
        logEntry.playerIndex,
        field as keyof PlayerFieldMap,
        subfield,
        increment
      );
    }
  }

  // Handle game-wide counters
  if (
    game.options.expansions.risingSun &&
    (logEntry.action === GameLogActionWithCount.ADD_PROPHECY ||
      logEntry.action === GameLogActionWithCount.REMOVE_PROPHECY)
  ) {
    const increment =
      logEntry.action === GameLogActionWithCount.ADD_PROPHECY
        ? logEntry.count ?? 1
        : -(logEntry.count ?? 1);

    // RisingSun always exists, so we can directly update the prophecy
    if (
      logEntry.action === GameLogActionWithCount.REMOVE_PROPHECY &&
      updatedGame.risingSun.prophecy.suns + increment < 0
    ) {
      throw new NotEnoughProphecyError();
    }
    updatedGame.risingSun.prophecy.suns = Math.max(
      0,
      updatedGame.risingSun.prophecy.suns + increment
    );
  }
  updatedGame.log.push({ ...logEntry });

  return updatedGame;
}
