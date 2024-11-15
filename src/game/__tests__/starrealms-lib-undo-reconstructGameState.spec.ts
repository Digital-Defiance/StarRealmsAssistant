import { reconstructGameState } from '@/game/starrealms-lib-undo-helpers';
import { getNextPlayerIndex, newPlayer, NewGameState } from '@/game/starrealms-lib';
import { IGame } from '@/game/interfaces/game';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import { DefaultTurnDetails, EmptyGameState } from '@/game/constants';
import { faker } from '@faker-js/faker';
import { ILogEntry } from '@/game/interfaces/log-entry';
import { IPlayerGameTurnDetails } from '@/game/interfaces/player-game-turn-details';
import { NotEnoughSubfieldError } from '@/game/errors/not-enough-subfield';

describe('reconstructGameState', () => {
  let baseGame: IGame;
  let consoleErrorSpy: jest.SpyInstance;
  const gameStart = new Date('2022-01-01T00:00:00Z');

  beforeEach(() => {
    baseGame = NewGameState(
      {
        ...EmptyGameState(),
        players: [newPlayer('Player 1', 0), newPlayer('Player 2', 1)],
        // start with second player
        firstPlayerIndex: 1,
        currentPlayerIndex: 1,
        selectedPlayerIndex: 1,
      },
      gameStart
    );
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
          action: GameLogAction.ADD_COMBAT,
          playerIndex: 0,
          count: 1,
          currentPlayerIndex: 0,
          turn: 1,
        } as ILogEntry,
      ],
    };

    const result = reconstructGameState(gameWithAction);
    expect(result.players[0].turn.combat).toBe(1);
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
          action: GameLogAction.ADD_COMBAT,
          playerIndex: 0,
          currentPlayerIndex: 0,
          turn: 1,
          count: 2,
        } as ILogEntry,
        {
          id: faker.string.uuid(),
          timestamp: new Date(),
          action: GameLogAction.ADD_TRADE,
          playerIndex: 1,
          currentPlayerIndex: 0,
          turn: 1,
          count: 1,
        } as ILogEntry,
      ],
    };

    const result = reconstructGameState(gameWithActions);
    expect(result.players[0].turn.combat).toBe(2);
    expect(result.players[1].turn.trade).toBe(1);
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
          timestamp: new Date(gameStart.getTime() + 1000),
          gameTime: 1000,
          action: GameLogAction.ADD_COMBAT,
          playerIndex: baseGame.currentPlayerIndex,
          currentPlayerIndex: baseGame.currentPlayerIndex,
          turn: 1,
          count: 3,
        },
        {
          id: faker.string.uuid(),
          timestamp: new Date(gameStart.getTime() + 2000),
          gameTime: 2000,
          action: GameLogAction.NEXT_TURN,
          playerIndex: nextPlayerIndex,
          playerTurnDetails: [
            { trade: 5, combat: 2, cards: 5 } as IPlayerGameTurnDetails,
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

  it('should throw an error when encountering negative counters', () => {
    const gameWithNegativeAction = {
      ...baseGame,
      log: [
        ...baseGame.log,
        {
          id: faker.string.uuid(),
          timestamp: new Date(),
          action: GameLogAction.REMOVE_COMBAT,
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

  it('should handle linked actions correctly', () => {
    const mainActionId = faker.string.uuid();
    const gameWithLinkedActions = {
      ...baseGame,
      log: [
        ...baseGame.log,
        {
          id: mainActionId,
          timestamp: new Date(),
          action: GameLogAction.ADD_COMBAT,
          playerIndex: 0,
          currentPlayerIndex: 0,
          turn: 1,
          count: 2,
        } as ILogEntry,
        {
          id: faker.string.uuid(),
          timestamp: new Date(),
          action: GameLogAction.ADD_TRADE,
          playerIndex: 0,
          currentPlayerIndex: 0,
          turn: 1,
          count: 1,
          linkedActionId: mainActionId,
        } as ILogEntry,
      ],
    };

    const result = reconstructGameState(gameWithLinkedActions);
    expect(result.players[0].turn.combat).toBe(2);
    expect(result.players[0].turn.trade).toBe(1);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should reconstruct the game state correctly after multiple rounds', () => {
    const complexGame: IGame = {
      ...baseGame, // current turn 1, currentPlayerIndex 1
      log: [
        ...baseGame.log,
        {
          // player 1 trade to 3
          id: faker.string.uuid(),
          timestamp: new Date(),
          action: GameLogAction.ADD_TRADE,
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
          // player 1 trade to 5
          id: faker.string.uuid(),
          timestamp: new Date(),
          action: GameLogAction.ADD_TRADE,
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
          action: GameLogAction.ADD_TRADE,
          playerIndex: 0,
          currentPlayerIndex: 1,
          turn: 3,
          count: 1,
        } as ILogEntry,
        {
          // player 1 coins to 3
          id: faker.string.uuid(),
          timestamp: new Date(),
          action: GameLogAction.ADD_COMBAT,
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
      trade: 1,
      combat: 0,
      cards: 5,
      gains: 0,
      discard: 0,
      scrap: 0,
    });
    expect(result.players[1].turn).toStrictEqual({
      trade: 0,
      combat: 3,
      cards: 5,
      gains: 0,
      discard: 0,
      scrap: 0,
    });
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });
});
