import {
  ActionsWithOnlyLastActionUndo,
  ActionsWithPlayer,
  DefaultTurnDetails,
  NO_PLAYER,
  NoPlayerActions,
  NoUndoActions,
} from '@/game/constants';
import { getFieldAndSubfieldFromAction, updatePlayerField } from '@/game/dominion-lib';
import { deepClone } from '@/game/utils';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import { IGame } from '@/game/interfaces/game';
import { ILogEntry } from '@/game/interfaces/log-entry';
import { PlayerFieldMap } from '@/game/types';
import { NotEnoughProphecyError } from '@/game/errors/not-enough-prophecy';
import { NotEnoughSupplyError } from '@/game/errors/not-enough-supply';
import { NotEnoughSubfieldError } from '@/game/errors/not-enough-subfield';
import * as undoHelpers from '@/game/dominion-lib-undo-helpers';
import { CurrentStep } from '@/game/enumerations/current-step';
import { getSignedCount } from '@/game/dominion-lib-log';
import { GamePausedError } from '@/game/errors/game-paused';
import { IPlayerGameTurnDetails } from './interfaces/player-game-turn-details';

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

  if (game.currentStep !== CurrentStep.GameScreen) {
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
  // validate that logEntry.action is a valid GameLogAction
  if (!Object.values(GameLogAction).includes(logEntry.action)) {
    console.error('Invalid log entry action:', logEntry.action);
    return game;
  }

  // Validate player index for actions that require a valid player index
  if (
    ActionsWithPlayer.includes(logEntry.action) &&
    (logEntry.playerIndex >= game.players.length || logEntry.playerIndex < 0)
  ) {
    return game; // Return the original game state if the player index is invalid
  }

  let updatedGame = deepClone<IGame>(game);

  if (logEntry.action === GameLogAction.START_GAME) {
    // set first player to the player who started the game
    updatedGame.firstPlayerIndex = logEntry.playerIndex;
    updatedGame.selectedPlayerIndex = logEntry.playerIndex;
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

    const newSuns = updatedGame.risingSun.prophecy.suns + increment;

    if (newSuns < 0) {
      throw new NotEnoughProphecyError();
    }

    updatedGame.risingSun.prophecy.suns = newSuns;
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

  return updatedGame;
}
