import { IGame } from '@/game/interfaces/game';
import { NewGameState } from '@/game/dominion-lib';
import { deepClone } from '@/game/utils';
import { applyLogAction } from '@/game/dominion-lib-log';

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
 */
export function reconstructGameState(game: IGame): IGame {
  let reconstructedGame = NewGameState(game);
  // clear the log
  reconstructedGame.log = [];

  for (let i = 0; i <= game.log.length - 1; i++) {
    const entry = game.log[i];
    reconstructedGame = applyLogAction(reconstructedGame, entry);
  }

  return reconstructedGame;
}
