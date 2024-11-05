import { ActionsWithOnlyLastActionUndo, NoUndoActions } from '@/game/constants';
import { IGame } from '@/game/interfaces/game';
import { ILogEntry } from '@/game/interfaces/log-entry';
import { NotEnoughProphecyError } from '@/game/errors/not-enough-prophecy';
import { NotEnoughSupplyError } from '@/game/errors/not-enough-supply';
import { NotEnoughSubfieldError } from '@/game/errors/not-enough-subfield';
import * as undoHelpers from '@/game/dominion-lib-undo-helpers';
import { CurrentStep } from '@/game/enumerations/current-step';
import { updateCache } from '@/game/dominion-lib-time';

/**
 * Returns the linked actions for the given log entry.
 * @param log - The log entries
 * @param index - The index of the log entry
 * @returns The linked actions
 */
export function getLinkedActions(log: ILogEntry[], index: number): ILogEntry[] {
  // do not recurse if the log entry is a linked action itself
  if (log[index].linkedActionId !== undefined) {
    return [];
  }
  // get all linked actions
  const linkedActions = log.filter((logEntry) => logEntry.linkedActionId === log[index].id);
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

  const isMostRecent = logIndex === game.log.length - 1;

  if (game.currentStep !== CurrentStep.Game) {
    return false;
  }

  const actionToUndo = game.log[logIndex];

  // none of the No Player actions can be undone (end game, etc)
  // as well as start game
  if (NoUndoActions.includes(actionToUndo.action)) {
    return false;
  }

  // can only undo next_turn or select player if it is the most recent action
  if (ActionsWithOnlyLastActionUndo.includes(actionToUndo.action) && !isMostRecent) {
    return false;
  }

  // Find the main action if this is a linked action
  let mainActionIndex = logIndex;
  if (actionToUndo.linkedActionId !== undefined) {
    mainActionIndex = game.log.findIndex((entry) => entry.id === actionToUndo.linkedActionId);
    if (mainActionIndex === -1) {
      return false; // Linked action's main action not found
    }
  }

  // Remove the action and its linked actions in a cloned game state
  const tempGame = undoHelpers.removeTargetAndLinkedActions(game, mainActionIndex);

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
    // reset the timeCache to invalidate the cache due to the removed actions
    reconstructedGame.timeCache = [];
    reconstructedGame.timeCache = updateCache(reconstructedGame);
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
