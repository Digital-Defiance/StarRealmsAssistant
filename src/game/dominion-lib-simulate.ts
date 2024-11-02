import { createMockGame, createMockLog } from '@/__fixtures__/dominion-lib-fixtures';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import { ILogEntry } from '@/game/interfaces/log-entry';
import { IGame } from '@/game/interfaces/game';
import { reconstructGameState } from '@/game/dominion-lib-undo-helpers';
import { getFieldAndSubfieldFromAction } from '@/game/dominion-lib';
import { IGameSupply } from '@/game/interfaces/game-supply';
import { NegativeAdjustmentActions } from '@/game/constants';
import { IMatDetails } from '@/game/interfaces/mat-details';

export function generateLargeGame(turns = 50): IGame {
  const game = createMockGame(3, {
    options: {
      curses: true,
      expansions: { risingSun: true, renaissance: true, prosperity: true },
      mats: {
        coffersVillagers: true,
        debt: true,
        favors: true,
      },
    },
    risingSun: {
      greatLeaderProphecy: true,
      prophecy: { suns: 0 },
    },
  });
  const logEntries: ILogEntry[] = [];

  const gameStartTime = new Date('2023-01-01T00:00:00Z');
  let elapsedTimeMS = 0;
  logEntries.push(
    createMockLog({
      action: GameLogAction.START_GAME,
      playerIndex: 0,
      turn: 1,
      timestamp: gameStartTime,
    })
  );

  let currentPlayerIndex = 0;
  for (let turn = 1; turn <= turns; turn++) {
    elapsedTimeMS += Math.floor(Math.random() * 60000);
    const newTimestamp = new Date(gameStartTime.getTime() + elapsedTimeMS);

    // Simulate actions for the current player
    simulatePlayerTurn(game, logEntries, currentPlayerIndex, turn, newTimestamp);

    // End of turn
    logEntries.push(
      createMockLog({
        action: GameLogAction.NEXT_TURN,
        playerIndex: (currentPlayerIndex + 1) % 3,
        turn: turn + 1,
        timestamp: newTimestamp,
      })
    );

    currentPlayerIndex = (currentPlayerIndex + 1) % 3;
  }

  // End the game
  elapsedTimeMS += Math.floor(Math.random() * 60000);
  const endTimestamp = new Date(gameStartTime.getTime() + elapsedTimeMS);
  logEntries.push(
    createMockLog({
      action: GameLogAction.END_GAME,
      playerIndex: currentPlayerIndex,
      turn: 50,
      timestamp: endTimestamp,
    })
  );

  console.log('Generated large game with', logEntries.length, 'log entries');
  return reconstructGameState({ ...game, log: logEntries });
}

function simulatePlayerTurn(
  game: IGame,
  logEntries: ILogEntry[],
  playerIndex: number,
  turn: number,
  timestamp: Date
) {
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
      subfield &&
      ['curses', 'provinces', 'estates', 'duchies', 'colonies'].includes(subfield) &&
      game.supply[subfield as keyof IGameSupply] < 1
    ) {
      continue; // Skip if there are not enough in the supply
    }
    if (
      field === 'mats' &&
      game.players[playerIndex].mats[subfield as keyof IMatDetails] < 1 &&
      increment === -1
    ) {
      continue; // Skip if there are not enough on the mat to remove
    }

    logEntries.push(
      createMockLog({
        action,
        playerIndex,
        turn,
        count: 1,
        timestamp,
      })
    );

    if (subfield && ['curses', 'provinces', 'estates', 'duchies', 'colonies'].includes(subfield)) {
      game.supply[subfield as keyof IGameSupply] -= increment;
    } else if (field === 'mats') {
      game.players[playerIndex].mats[subfield as keyof IMatDetails] += increment;
    }
  }
}
