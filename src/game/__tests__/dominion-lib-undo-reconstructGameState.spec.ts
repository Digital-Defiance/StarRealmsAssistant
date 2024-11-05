import { reconstructGameState } from '@/game/dominion-lib-undo-helpers';
import { getNextPlayerIndex, newPlayer, NewGameState } from '@/game/dominion-lib';
import { IGame } from '@/game/interfaces/game';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import {
  DefaultRenaissanceFeatures,
  DefaultTurnDetails,
  EmptyGameState,
  EnabledRisingSunFeatures,
} from '@/game/constants';
import { faker } from '@faker-js/faker';
import { ILogEntry } from '@/game/interfaces/log-entry';
import { IPlayerGameTurnDetails } from '@/game/interfaces/player-game-turn-details';
import { NotEnoughSubfieldError } from '@/game/errors/not-enough-subfield';
import { NotEnoughProphecyError } from '@/game/errors/not-enough-prophecy';
import {
  applyGroupedAction,
  applyGroupedActionSubAction,
  getGameStartTime,
  prepareGroupedActionTriggers,
} from '@/game/dominion-lib-log';
import { createMockGame } from '@/__fixtures__/dominion-lib-fixtures';
import { GroupedActionDest } from '@/game/enumerations/grouped-action-dest';

describe('reconstructGameState', () => {
  let baseGame: IGame;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    baseGame = NewGameState({
      ...EmptyGameState(),
      players: [newPlayer('Player 1', 0), newPlayer('Player 2', 1)],
      // start with second player
      firstPlayerIndex: 1,
      currentPlayerIndex: 1,
      selectedPlayerIndex: 1,
    });
    baseGame.timeCache = [
      {
        adjustedDuration: 0,
        eventId: baseGame.log[0].id,
        inPauseState: false,
        inSaveState: false,
        pauseStartTime: null,
        saveStartTime: null,
        totalPauseTime: 0,
        turnPauseTime: 0,
      },
    ];
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {
      // do nothing
    });
  });

  it('should return an identical game state when given an existing game', () => {
    const result = reconstructGameState(baseGame);
    expect(result).toEqual(baseGame);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should correctly apply a single action', () => {
    const gameWithAction = {
      ...baseGame,
      log: [
        ...baseGame.log,
        {
          id: faker.string.uuid(),
          timestamp: new Date(),
          action: GameLogAction.ADD_COINS,
          playerIndex: 0,
          count: 1,
          currentPlayerIndex: 0,
          turn: 1,
        } as ILogEntry,
      ],
    };

    const result = reconstructGameState(gameWithAction);
    expect(result.players[0].turn.coins).toBe(1);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should handle multiple actions for different players', () => {
    const gameWithActions = {
      ...baseGame,
      log: [
        ...baseGame.log,
        {
          id: faker.string.uuid(),
          timestamp: new Date(),
          action: GameLogAction.ADD_COINS,
          playerIndex: 0,
          currentPlayerIndex: 0,
          turn: 1,
          count: 2,
        } as ILogEntry,
        {
          id: faker.string.uuid(),
          timestamp: new Date(),
          action: GameLogAction.ADD_ACTIONS,
          playerIndex: 1,
          currentPlayerIndex: 0,
          turn: 1,
          count: 1,
        } as ILogEntry,
      ],
    };

    const result = reconstructGameState(gameWithActions);
    expect(result.players[0].turn.coins).toBe(2);
    expect(result.players[1].turn.actions).toBe(2);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should handle NEXT_TURN action correctly', () => {
    const nextPlayerIndex = getNextPlayerIndex(baseGame);
    const gameWithNextTurn = {
      ...baseGame,
      log: [
        ...baseGame.log,
        {
          id: faker.string.uuid(),
          timestamp: new Date(),
          action: GameLogAction.NEXT_TURN,
          playerIndex: nextPlayerIndex,
          currentPlayerIndex: baseGame.currentPlayerIndex,
          turn: 2,
          playerTurnDetails: [{ ...DefaultTurnDetails }, { ...DefaultTurnDetails }],
          prevPlayerIndex: baseGame.currentPlayerIndex,
        } as ILogEntry,
      ],
    };

    const result = reconstructGameState(gameWithNextTurn);
    expect(nextPlayerIndex).toBe(0); // should wrap back to 0
    expect(result.currentPlayerIndex).toBe(nextPlayerIndex); // should wrap back to 0
    expect(result.currentTurn).toBe(2); // should increment
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should reset player turn details after NEXT_TURN', () => {
    const nextPlayerIndex = getNextPlayerIndex(baseGame);
    const gameWithActionsAndNextTurn = {
      ...baseGame,
      log: [
        ...baseGame.log,
        {
          id: faker.string.uuid(),
          timestamp: new Date(),
          action: GameLogAction.ADD_COINS,
          playerIndex: baseGame.currentPlayerIndex,
          currentPlayerIndex: baseGame.currentPlayerIndex,
          turn: 1,
          count: 3,
        },
        {
          id: faker.string.uuid(),
          timestamp: new Date(),
          action: GameLogAction.NEXT_TURN,
          playerIndex: nextPlayerIndex,
          playerTurnDetails: [
            { actions: 5, coins: 2, buys: 4, cards: 5 } as IPlayerGameTurnDetails,
            DefaultTurnDetails(),
          ],
          prevPlayerIndex: baseGame.currentPlayerIndex,
          currentPlayerIndex: baseGame.currentPlayerIndex,
          turn: 2,
        },
      ],
    };

    const result = reconstructGameState(gameWithActionsAndNextTurn);
    expect(result.players[0].turn).toEqual(DefaultTurnDetails());
    expect(result.currentPlayerIndex).toEqual(nextPlayerIndex);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should handle game-wide counters (e.g., prophecy tokens)', () => {
    const gameWithProphecy: IGame = {
      ...baseGame,
      options: {
        curses: false,
        mats: {
          coffersVillagers: false,
          debt: false,
          favors: false,
        },
        expansions: {
          risingSun: true,
          renaissance: false,
          prosperity: false,
        },
      },
      expansions: {
        renaissance: DefaultRenaissanceFeatures(),
        risingSun: EnabledRisingSunFeatures(2),
      },
      log: [
        ...baseGame.log,
        {
          id: faker.string.uuid(),
          timestamp: new Date(),
          action: GameLogAction.REMOVE_PROPHECY,
          playerIndex: 0,
          currentPlayerIndex: 0,
          turn: 1,
          count: 2,
        },
      ],
    } as IGame;

    const result = reconstructGameState(gameWithProphecy);
    expect(result.expansions.risingSun.prophecy.suns).toBe(3);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should throw an error when encountering negative counters', () => {
    const gameWithNegativeAction = {
      ...baseGame,
      log: [
        ...baseGame.log,
        {
          id: faker.string.uuid(),
          timestamp: new Date(),
          action: GameLogAction.REMOVE_COINS,
          playerIndex: 0,
          currentPlayerIndex: 0,
          turn: 1,
          count: 5, // This would result in negative coins
        } as ILogEntry,
      ],
    };

    expect(() => reconstructGameState(gameWithNegativeAction)).toThrow(NotEnoughSubfieldError);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should throw an error when encountering negative prophecy counters', () => {
    const gameWithNegativeAction = {
      ...baseGame,
      options: {
        curses: false,
        mats: {
          coffersVillagers: false,
          debt: false,
          favors: false,
        },
        expansions: {
          risingSun: true,
          renaissance: false,
          prosperity: false,
        },
        trackCardCounts: true,
        trackCardGains: true,
      },
      log: [
        ...baseGame.log,
        {
          id: faker.string.uuid(),
          timestamp: new Date(),
          action: GameLogAction.REMOVE_PROPHECY,
          playerIndex: 0,
          currentPlayerIndex: 0,
          turn: 1,
          count: 10, // This would result in negative prophecy
        } as ILogEntry,
      ],
    };

    expect(() => reconstructGameState(gameWithNegativeAction)).toThrow(NotEnoughProphecyError);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should handle linked actions correctly', () => {
    const mainActionId = faker.string.uuid();
    const gameWithLinkedActions = {
      ...baseGame,
      log: [
        ...baseGame.log,
        {
          id: mainActionId,
          timestamp: new Date(),
          action: GameLogAction.ADD_COINS,
          playerIndex: 0,
          currentPlayerIndex: 0,
          turn: 1,
          count: 2,
        } as ILogEntry,
        {
          id: faker.string.uuid(),
          timestamp: new Date(),
          action: GameLogAction.ADD_ACTIONS,
          playerIndex: 0,
          currentPlayerIndex: 0,
          turn: 1,
          count: 1,
          linkedActionId: mainActionId,
        } as ILogEntry,
      ],
    };

    const result = reconstructGameState(gameWithLinkedActions);
    expect(result.players[0].turn.coins).toBe(2);
    expect(result.players[0].turn.actions).toBe(2); // 1 default + 1 added
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should reconstruct the game state correctly after multiple rounds', () => {
    const complexGame: IGame = {
      ...baseGame, // current turn 1, currentPlayerIndex 1
      log: [
        ...baseGame.log,
        {
          // player 0 coins to 3
          id: faker.string.uuid(),
          timestamp: new Date(),
          action: GameLogAction.ADD_COINS,
          playerIndex: 1,
          currentPlayerIndex: 1,
          turn: 1,
          count: 3,
        } as ILogEntry,
        {
          // will increment currentPlayerIndex back to 0, current turn 2
          // will reset player 0 coins to 0
          id: faker.string.uuid(),
          timestamp: new Date(),
          action: GameLogAction.NEXT_TURN,
          playerIndex: 0,
          currentPlayerIndex: 0,
          turn: 2,
          playerTurnDetails: [{ ...DefaultTurnDetails(), coins: 3 }, DefaultTurnDetails()],
          prevPlayerIndex: 1,
        } as ILogEntry,
        {
          // player 1 actions to 3
          id: faker.string.uuid(),
          timestamp: new Date(),
          action: GameLogAction.ADD_ACTIONS,
          playerIndex: 1,
          currentPlayerIndex: 0,
          turn: 2,
          count: 2,
        } as ILogEntry,
        {
          // will increment currentPlayerIndex to 1, turn counter to 3
          // will reset actions to 1
          id: faker.string.uuid(),
          timestamp: new Date(),
          action: GameLogAction.NEXT_TURN,
          playerIndex: 1,
          currentPlayerIndex: 1,
          turn: 3,
          playerTurnDetails: [DefaultTurnDetails(), { ...DefaultTurnDetails(), actions: 3 }],
          prevPlayerIndex: 0,
        } as ILogEntry,
        {
          // player 0 buys to 1
          id: faker.string.uuid(),
          timestamp: new Date(),
          action: GameLogAction.ADD_BUYS,
          playerIndex: 0,
          currentPlayerIndex: 1,
          turn: 3,
          count: 1,
        } as ILogEntry,
        {
          // player 1 coins to 3
          id: faker.string.uuid(),
          timestamp: new Date(),
          action: GameLogAction.ADD_COINS,
          playerIndex: 1,
          currentPlayerIndex: 1,
          turn: 3,
          count: 3,
        } as ILogEntry,
      ],
    };

    const result = reconstructGameState(complexGame);
    expect(result.currentPlayerIndex).toBe(1);
    expect(result.currentTurn).toBe(3);
    expect(result.players[0].turn).toStrictEqual({
      actions: 1,
      coins: 0,
      buys: 2,
      cards: 5,
      gains: 0,
    });
    expect(result.players[1].turn).toStrictEqual({
      actions: 1,
      coins: 3,
      buys: 1,
      cards: 5,
      gains: 0,
    });
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should handle grouped actions correctly', () => {
    const mockGame = createMockGame(4);
    const actionDate = new Date(getGameStartTime(mockGame).getTime() + 10000);
    const updatedGame = applyGroupedAction(
      mockGame,
      {
        name: 'One Card, Two Actions',
        actions: {
          [GroupedActionDest.CurrentPlayerIndex]: [
            {
              action: GameLogAction.REMOVE_ACTIONS,
              count: 1,
            },
            {
              action: GameLogAction.ADD_CARDS,
              count: 1,
            },
            {
              action: GameLogAction.ADD_ACTIONS,
              count: 2,
            },
          ],
          [GroupedActionDest.SelectedPlayerIndex]: [],
          [GroupedActionDest.AllPlayers]: [],
          [GroupedActionDest.AllPlayersExceptCurrent]: [],
          [GroupedActionDest.AllPlayersExceptSelected]: [],
        },
      },
      actionDate,
      applyGroupedActionSubAction,
      prepareGroupedActionTriggers
    );
    expect(mockGame.currentPlayerIndex).toBe(updatedGame.currentPlayerIndex);
    expect(mockGame.selectedPlayerIndex).toBe(updatedGame.selectedPlayerIndex);
    expect(mockGame.firstPlayerIndex).toBe(updatedGame.firstPlayerIndex);
    const reconstructedGame = reconstructGameState(updatedGame);
    expect(reconstructedGame.currentPlayerIndex).toBe(updatedGame.currentPlayerIndex);
    expect(reconstructedGame.selectedPlayerIndex).toBe(updatedGame.selectedPlayerIndex);
    expect(reconstructedGame.firstPlayerIndex).toBe(updatedGame.firstPlayerIndex);
    expect(reconstructedGame).toStrictEqual(updatedGame);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });
});
