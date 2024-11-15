import { createMockGame, createMockLog } from '@/__fixtures__/dominion-lib-fixtures';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import { IGame } from '@/game/interfaces/game';
import { reconstructGameState } from '@/game/starrealms-lib-undo-helpers';
import { getFieldAndSubfieldFromAction, getNextPlayerIndex } from '@/game/starrealms-lib';
import { IGameSupply } from '@/game/interfaces/game-supply';
import {
  applyLogAction,
  calculateDurationUpToEvent,
  rebuildTurnStatisticsCache,
} from '@/game/starrealms-lib-log';
import { NegativeAdjustmentActions } from './constants';

export function generateLargeGame(turns = 50, endGame = true): IGame {
  console.log('Generating large game with', turns, 'turns');
  let game = createMockGame(2, {
    options: {
      trackCardCounts: true,
      trackCardGains: true,
      trackDiscard: true,
      startingAuthorityByPlayerIndex: {
        0: 50,
        1: 50,
      },
      startingCardsByPlayerIndex: {
        0: 5,
        1: 5,
      },
    },
    log: [],
  });

  const gameStartTime = new Date('2023-01-01T00:00:00Z');
  let elapsedTimeMS = 0;
  game = applyLogAction(
    game,
    createMockLog({
      action: GameLogAction.START_GAME,
      playerIndex: 0,
      turn: 1,
      timestamp: gameStartTime,
      gameTime: 0,
    })
  );

  for (let turn = 1; turn <= turns; turn++) {
    elapsedTimeMS += Math.floor(Math.random() * 60000);
    const newTimestamp = new Date(gameStartTime.getTime() + elapsedTimeMS);

    // Simulate actions for the current player
    game = simulatePlayerTurn(game, newTimestamp);

    // End of turn
    if (turn < turns) {
      const nextPlayerIndex = getNextPlayerIndex(game);
      game = applyLogAction(
        game,
        createMockLog({
          action: GameLogAction.NEXT_TURN,
          playerIndex: nextPlayerIndex,
          currentPlayerIndex: nextPlayerIndex,
          prevPlayerIndex: game.currentPlayerIndex,
          turn: game.currentTurn + 1,
          timestamp: newTimestamp,
          gameTime: calculateDurationUpToEvent(game.log, newTimestamp),
        })
      );
    }
  }

  if (endGame) {
    // End the game
    elapsedTimeMS += Math.floor(Math.random() * 60000);
    const endTimestamp = new Date(gameStartTime.getTime() + elapsedTimeMS);
    game = applyLogAction(
      game,
      createMockLog({
        action: GameLogAction.END_GAME,
        playerIndex: -1,
        turn: turns,
        timestamp: endTimestamp,
        gameTime: calculateDurationUpToEvent(game.log, endTimestamp),
      })
    );
  }

  console.log('Generated large game with', game.log.length, 'log entries');
  game = reconstructGameState(game);
  game.turnStatisticsCache = rebuildTurnStatisticsCache(game);
  return game;
}

function simulatePlayerTurn(game: IGame, timestamp: Date): IGame {
  const actions = [
    GameLogAction.ADD_AUTHORITY,
    GameLogAction.ADD_TRADE,
    GameLogAction.ADD_COMBAT,
    GameLogAction.ADD_CARDS,
    GameLogAction.ADD_GAINS,
    GameLogAction.ADD_DISCARD,
    GameLogAction.SCRAP,
    GameLogAction.UNSCRAP,
  ];

  const numberOfActions = Math.floor(Math.random() * 10) + 5; // 5 to 14 actions per turn

  for (let i = 0; i < numberOfActions; i++) {
    const action = actions[Math.floor(Math.random() * actions.length)];
    const { field, subfield } = getFieldAndSubfieldFromAction(action);

    if (
      field === 'authority' &&
      subfield &&
      subfield === 'authority' &&
      game.players[game.selectedPlayerIndex].authority.authority < 1 &&
      NegativeAdjustmentActions.includes(action)
    ) {
      continue; // Skip if there are not enough in the supply
    }

    game = applyLogAction(
      game,
      createMockLog({
        action,
        playerIndex: game.currentPlayerIndex,
        currentPlayerIndex: game.currentPlayerIndex,
        turn: game.currentTurn,
        count: 1,
        timestamp,
        gameTime: calculateDurationUpToEvent(game.log, timestamp),
      })
    );
  }
  return game;
}
