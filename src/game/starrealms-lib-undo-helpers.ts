import { IGame } from '@/game/interfaces/game';
import { NewGameState } from '@/game/starrealms-lib';
import { deepClone } from '@/game/utils';
import { applyLogAction } from '@/game/starrealms-lib-log';

/**
 * Remove the target action and its linked actions from the game log.
 * @param game - The current game state
 * @param logIndex - The index of the target action to remove
 * @returns The updated game state with the target action and its linked actions removed
 */
export function removeTargetAndLinkedActions(game: IGame, logIndex: number): IGame {
  const updatedGame = deepClone<IGame>(game);
  if (logIndex < 0 || logIndex >= updatedGame.log.length) {
    return updatedGame;
  }

  const targetAction = updatedGame.log[logIndex];
  let mainActionId = targetAction.id;
  let mainActionIndex = logIndex;

  // If the target action is a linked action, find the main action
  if (targetAction.linkedActionId) {
    const foundMainActionIndex = updatedGame.log.findIndex(
      (entry) => entry.id === targetAction.linkedActionId
    );
    if (foundMainActionIndex !== -1) {
      mainActionId = updatedGame.log[foundMainActionIndex].id;
      mainActionIndex = foundMainActionIndex;
    }
  }

  // Remove the main action, the target action (if it's a linked action), and all other linked actions
  updatedGame.log = updatedGame.log.filter(
    (entry, index) =>
      index !== mainActionIndex &&
      index !== logIndex &&
      entry.id !== mainActionId &&
      entry.linkedActionId !== mainActionId
  );

  return updatedGame;
}

/**
 * Reconstructs the game state using the game log
 * @param game - The current game state, used for options/settings
 * @returns The reconstructed game state
 * @throws {NotEnoughSubfieldError} If there's not enough of a subfield to perform an action
 */
export function reconstructGameState(game: IGame): IGame {
  if (game.log.length === 0) {
    return deepClone<IGame>(game);
  }

  let reconstructedGame = NewGameState(game, game.log[0].timestamp);
  // clear the log
  reconstructedGame.log = [];

  // For the GameLogEntry component, we want to catch errors to prevent UI crashes
  // But for tests and actual undo operations, we need to let errors propagate
  for (let i = 0; i < game.log.length; i++) {
    const entry = game.log[i];
    reconstructedGame = applyLogAction(reconstructedGame, entry);
  }

  return reconstructedGame;
}
