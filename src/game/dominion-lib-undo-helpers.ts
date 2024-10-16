import { IGame } from '@/game/interfaces/game';
import { EmptyGameState, NewGameState } from '@/game/dominion-lib';
import { DefaultTurnDetails, EmptyMatDetails, EmptyVictoryDetails } from '@/game/constants';
import { applyLogAction } from '@/game/dominion-lib-undo';

/**
 * Remove the target action and its linked actions from the game log.
 * @param game - The current game state
 * @param logIndex - The index of the target action to remove
 * @returns The updated game state with the target action and its linked actions removed
 */
export function removeTargetAndLinkedActions(game: IGame, logIndex: number): IGame {
  const updatedGame = { ...game };
  if (logIndex < 0 || logIndex >= updatedGame.log.length) {
    return updatedGame;
  }

  const targetAction = updatedGame.log[logIndex];
  let mainActionId = targetAction.id;
  let mainActionIndex = logIndex;

  // If the target action is a linked action, find the main action
  if (targetAction.linkedAction) {
    const foundMainActionIndex = updatedGame.log.findIndex(
      (entry) => entry.id === targetAction.linkedAction
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
      entry.linkedAction !== mainActionId
  );

  return updatedGame;
}

/**
 * Reconstructs the game state up to a specific log entry.
 * @param game - The current game state
 * @param targetLogIndex - The index of the log entry to reconstruct up to
 * @returns The reconstructed game state
 */
export function reconstructGameState(game: IGame): IGame {
  let reconstructedGame = NewGameState({
    ...EmptyGameState,
    players: game.players.map((player) => ({
      ...player,
      mats: { ...EmptyMatDetails },
      turn: { ...DefaultTurnDetails },
      newTurn: { ...DefaultTurnDetails },
      victory: { ...EmptyVictoryDetails },
    })),
    options: { ...game.options },
    firstPlayerIndex: game.firstPlayerIndex,
    currentPlayerIndex: game.firstPlayerIndex,
    selectedPlayerIndex: game.firstPlayerIndex,
    log: [],
  });

  for (let i = 0; i <= game.log.length - 1; i++) {
    reconstructedGame = applyLogAction(reconstructedGame, game.log[i]);
  }

  return reconstructedGame;
}
