import { createMockGame, createMockLog } from '@/__fixtures__/dominion-lib-fixtures';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import { IGame } from '@/game/interfaces/game';
import { reconstructGameState } from '@/game/dominion-lib-undo-helpers';
import { getFieldAndSubfieldFromAction, getNextPlayerIndex } from '@/game/dominion-lib';
import { IGameSupply } from '@/game/interfaces/game-supply';
import {
  DefaultRenaissanceFeatures,
  DefaultRisingSunFeatures,
  NegativeAdjustmentActions,
} from '@/game/constants';
import { IMatDetails } from '@/game/interfaces/mat-details';
import { applyLogAction } from '@/game/dominion-lib-log';

export function generateLargeGame(turns = 50): IGame {
  console.log('Generating large game with', turns, 'turns');
  let game = createMockGame(3, {
    options: {
      curses: true,
      expansions: { risingSun: true, renaissance: true, prosperity: true },
      mats: {
        coffersVillagers: true,
        debt: true,
        favors: true,
      },
      trackCardCounts: true,
      trackCardGains: true,
    },
    expansions: {
      renaissance: DefaultRenaissanceFeatures(),
      risingSun: DefaultRisingSunFeatures(),
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
        })
      );
    }
  }

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
    })
  );

  console.log('Generated large game with', game.log.length, 'log entries');
  return reconstructGameState(game);
}

function simulatePlayerTurn(game: IGame, timestamp: Date): IGame {
  const actions = [
    GameLogAction.ADD_ACTIONS,
    GameLogAction.ADD_BUYS,
    GameLogAction.ADD_COINS,
    GameLogAction.ADD_CARDS,
    GameLogAction.ADD_GAINS,
    GameLogAction.ADD_VP_TOKENS,
    GameLogAction.ADD_PROVINCES,
    GameLogAction.ADD_ESTATES,
    GameLogAction.ADD_DUCHIES,
    GameLogAction.ADD_COLONIES,
    GameLogAction.ADD_COFFERS,
    GameLogAction.ADD_VILLAGERS,
    GameLogAction.ADD_DEBT,
    GameLogAction.ADD_FAVORS,
    GameLogAction.ADD_CURSES,
    GameLogAction.ADD_OTHER_VP,
    GameLogAction.ADD_PROPHECY,
    GameLogAction.REMOVE_COFFERS,
    GameLogAction.REMOVE_VILLAGERS,
    GameLogAction.REMOVE_DEBT,
    GameLogAction.REMOVE_FAVORS,
  ];

  const numberOfActions = Math.floor(Math.random() * 10) + 5; // 5 to 14 actions per turn

  for (let i = 0; i < numberOfActions; i++) {
    const action = actions[Math.floor(Math.random() * actions.length)];
    const { field, subfield } = getFieldAndSubfieldFromAction(action);
    const increment = NegativeAdjustmentActions.includes(action) ? -1 : 1;

    if (
      field === 'victory' &&
      subfield &&
      ['curses', 'provinces', 'estates', 'duchies', 'colonies'].includes(subfield) &&
      game.supply[subfield as keyof IGameSupply] < 1
    ) {
      continue; // Skip if there are not enough in the supply
    }
    if (
      field === 'mats' &&
      game.players[game.currentPlayerIndex].mats[subfield as keyof IMatDetails] < 1 &&
      increment < 0
    ) {
      continue; // Skip if there are not enough on the mat to remove
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
      })
    );
  }
  return game;
}
