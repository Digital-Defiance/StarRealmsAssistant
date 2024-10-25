import { reconstructGameState } from '@/game/dominion-lib-undo-helpers';
import { getNextPlayerIndex, EmptyGameState, newPlayer, NewGameState } from '@/game/dominion-lib';
import { IGame } from '@/game/interfaces/game';
import { GameLogActionWithCount } from '@/game/enumerations/game-log-action-with-count';
import { DefaultTurnDetails, NO_PLAYER } from '@/game/constants';
import { faker } from '@faker-js/faker';
import { ILogEntry } from '@/game/interfaces/log-entry';
import { IPlayerGameTurnDetails } from '@/game/interfaces/player-game-turn-details';
import { NotEnoughSubfieldError } from '../errors/not-enough-subfield';
import { NotEnoughProphecyError } from '../errors/not-enough-prophecy';

describe('reconstructGameState', () => {
  let baseGame: IGame;

  beforeEach(() => {
    baseGame = NewGameState({
      ...EmptyGameState,
      players: [newPlayer('Player 1', 0), newPlayer('Player 2', 1)],
      // start with second player
      firstPlayerIndex: 1,
      currentPlayerIndex: 1,
      selectedPlayerIndex: 1,
    });
  });

  it('should return an identical game state when given an existing game', () => {
    const result = reconstructGameState(baseGame);
    expect(result).toEqual(baseGame);
  });

  it('should correctly apply a single action', () => {
    const gameWithAction = {
      ...baseGame,
      log: [
        ...baseGame.log,
        {
          id: faker.string.uuid(),
          timestamp: new Date(),
          action: GameLogActionWithCount.ADD_COINS,
          playerIndex: 0,
          count: 1,
          currentPlayerIndex: 0,
          turn: 1,
        },
      ],
    };

    const result = reconstructGameState(gameWithAction);
    expect(result.players[0].turn.coins).toBe(1);
  });

  it('should handle multiple actions for different players', () => {
    const gameWithActions = {
      ...baseGame,
      log: [
        ...baseGame.log,
        {
          id: faker.string.uuid(),
          timestamp: new Date(),
          action: GameLogActionWithCount.ADD_COINS,
          playerIndex: 0,
          currentPlayerIndex: 0,
          turn: 1,
          count: 2,
        },
        {
          id: faker.string.uuid(),
          timestamp: new Date(),
          action: GameLogActionWithCount.ADD_ACTIONS,
          playerIndex: 1,
          currentPlayerIndex: 0,
          turn: 1,
          count: 1,
        },
      ],
    };

    const result = reconstructGameState(gameWithActions);
    expect(result.players[0].turn.coins).toBe(2);
    expect(result.players[1].turn.actions).toBe(2);
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
          action: GameLogActionWithCount.NEXT_TURN,
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
          action: GameLogActionWithCount.ADD_COINS,
          playerIndex: baseGame.currentPlayerIndex,
          currentPlayerIndex: baseGame.currentPlayerIndex,
          turn: 1,
          count: 3,
        },
        {
          id: faker.string.uuid(),
          timestamp: new Date(),
          action: GameLogActionWithCount.NEXT_TURN,
          playerIndex: nextPlayerIndex,
          playerTurnDetails: [
            { actions: 5, coins: 2, buys: 4 } as IPlayerGameTurnDetails,
            { ...DefaultTurnDetails },
          ],
          prevPlayerIndex: baseGame.currentPlayerIndex,
          currentPlayerIndex: baseGame.currentPlayerIndex,
          turn: 1,
        },
      ],
    };

    const result = reconstructGameState(gameWithActionsAndNextTurn);
    expect(result.players[0].turn).toEqual(DefaultTurnDetails);
    expect(result.currentPlayerIndex).toEqual(nextPlayerIndex);
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
      risingSun: {
        prophecy: {
          suns: 5,
        },
        greatLeaderProphecy: true,
      },
      log: [
        ...baseGame.log,
        {
          id: faker.string.uuid(),
          timestamp: new Date(),
          action: GameLogActionWithCount.REMOVE_PROPHECY,
          playerIndex: NO_PLAYER,
          currentPlayerIndex: 0,
          turn: 1,
          count: 2,
        },
      ],
    } as IGame;

    const result = reconstructGameState(gameWithProphecy);
    expect(result.risingSun?.prophecy.suns).toBe(3);
  });

  it('should throw an error when encountering negative counters', () => {
    const gameWithNegativeAction = {
      ...baseGame,
      log: [
        ...baseGame.log,
        {
          id: faker.string.uuid(),
          timestamp: new Date(),
          action: GameLogActionWithCount.REMOVE_COINS,
          playerIndex: 0,
          currentPlayerIndex: 0,
          turn: 1,
          count: 5, // This would result in negative coins
        },
      ],
    };

    expect(() => reconstructGameState(gameWithNegativeAction)).toThrow(NotEnoughSubfieldError);
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
      },
      log: [
        ...baseGame.log,
        {
          id: faker.string.uuid(),
          timestamp: new Date(),
          action: GameLogActionWithCount.REMOVE_PROPHECY,
          playerIndex: 0,
          currentPlayerIndex: 0,
          turn: 1,
          count: 10, // This would result in negative prophecy
        },
      ],
    };

    expect(() => reconstructGameState(gameWithNegativeAction)).toThrow(NotEnoughProphecyError);
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
          action: GameLogActionWithCount.ADD_COINS,
          playerIndex: 0,
          currentPlayerIndex: 0,
          turn: 1,
          count: 2,
        },
        {
          id: faker.string.uuid(),
          timestamp: new Date(),
          action: GameLogActionWithCount.ADD_ACTIONS,
          playerIndex: 0,
          currentPlayerIndex: 0,
          turn: 1,
          count: 1,
          linkedActionId: mainActionId,
        },
      ],
    };

    const result = reconstructGameState(gameWithLinkedActions);
    expect(result.players[0].turn.coins).toBe(2);
    expect(result.players[0].turn.actions).toBe(2); // 1 default + 1 added
  });

  it('should reconstruct the game state correctly after multiple rounds', () => {
    const complexGame = {
      ...baseGame, // current turn 1, currentPlayerIndex 1
      log: [
        ...baseGame.log,
        {
          // player 0 coins to 3
          id: faker.string.uuid(),
          timestamp: new Date(),
          action: GameLogActionWithCount.ADD_COINS,
          playerIndex: 1,
          currentPlayerIndex: 1,
          turn: 1,
          count: 3,
        },
        {
          // will increment currentPlayerIndex back to 0, current turn 2
          // will reset player 0 coins to 0
          id: faker.string.uuid(),
          timestamp: new Date(),
          action: GameLogActionWithCount.NEXT_TURN,
          playerIndex: 0,
          currentPlayerIndex: 0,
          turn: 2,
          playerTurnDetails: [{ ...DefaultTurnDetails, coins: 3 }, { ...DefaultTurnDetails }],
          prevPlayerIndex: 1,
        },
        {
          // player 1 actions to 3
          id: faker.string.uuid(),
          timestamp: new Date(),
          action: GameLogActionWithCount.ADD_ACTIONS,
          playerIndex: 1,
          currentPlayerIndex: 0,
          turn: 2,
          count: 2,
        },
        {
          // will increment currentPlayerIndex to 1, turn counter to 3
          // will reset actions to 1
          id: faker.string.uuid(),
          timestamp: new Date(),
          action: GameLogActionWithCount.NEXT_TURN,
          playerIndex: 1,
          currentPlayerIndex: 1,
          turn: 3,
          playerTurnDetails: [{ ...DefaultTurnDetails }, { ...DefaultTurnDetails, actions: 3 }],
          prevPlayerIndex: 0,
        },
        {
          // player 0 buys to 1
          id: faker.string.uuid(),
          timestamp: new Date(),
          action: GameLogActionWithCount.ADD_BUYS,
          playerIndex: 0,
          currentPlayerIndex: 1,
          turn: 3,
          count: 1,
        },
        {
          // player 1 coins to 3
          id: faker.string.uuid(),
          timestamp: new Date(),
          action: GameLogActionWithCount.ADD_COINS,
          playerIndex: 1,
          currentPlayerIndex: 1,
          turn: 3,
          count: 3,
        },
      ],
    };

    const result = reconstructGameState(complexGame);
    expect(result.currentPlayerIndex).toBe(1);
    expect(result.currentTurn).toBe(3);
    expect(result.players[0].turn).toStrictEqual({
      actions: 1,
      coins: 0,
      buys: 2,
    });
    expect(result.players[1].turn).toStrictEqual({
      actions: 1,
      coins: 3,
      buys: 1,
    });
  });
});
