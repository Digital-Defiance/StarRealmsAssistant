import { calculateAuthorityAndSupplyByTurn } from '@/game/starrealms-lib-log';
import { IGameSupply } from '@/game/interfaces/game-supply';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import { createMockGame, createMockLog } from '@/__fixtures__/starrealms-lib-fixtures';
import { IGame } from '@/game/interfaces/game';
import { ILogEntry } from '@/game/interfaces/log-entry';
import { deepClone } from '@/game/utils';

describe('calculateVictoryPointsAndSupplyByTurn', () => {
  let game: IGame;
  let initialSupply: IGameSupply;

  beforeEach(() => {
    game = createMockGame(2);
    initialSupply = deepClone<IGameSupply>(game.supply);
  });

  it('should update victory points and reduce supply for victory cards', () => {
    const gameStart = game.log[0].timestamp;
    game.log.push(
      {
        id: '2',
        timestamp: new Date(gameStart.getTime() + 1000),
        gameTime: 1000,
        action: GameLogAction.ADD_AUTHORITY,
        playerIndex: 0,
        currentPlayerIndex: 0,
        turn: 1,
        count: 1,
      },
      {
        id: '3',
        timestamp: new Date(gameStart.getTime() + 2000),
        gameTime: 2000,
        action: GameLogAction.NEXT_TURN,
        playerIndex: 1,
        currentPlayerIndex: 1,
        turn: 2,
      }
    );

    const result = calculateAuthorityAndSupplyByTurn(game);

    expect(result).toHaveLength(1);
    expect(result).toEqual([
      {
        playerScores: { 0: 51, 1: 50 },
        supply: initialSupply,
      },
    ]);
  });

  it('should not reduce supply if trash flag is true', () => {
    const gameStart = game.log[0].timestamp;
    game.log.push(
      {
        id: '2',
        timestamp: new Date(gameStart.getTime() + 1000),
        gameTime: 1000,
        action: GameLogAction.REMOVE_AUTHORITY,
        playerIndex: 0,
        currentPlayerIndex: 0,
        turn: 1,
        count: 1,
        scrap: true,
      } as ILogEntry,
      {
        id: '3',
        timestamp: new Date(gameStart.getTime() + 2000),
        gameTime: 2000,
        action: GameLogAction.NEXT_TURN,
        playerIndex: 1,
        currentPlayerIndex: 1,
        turn: 2,
      }
    );

    const result = calculateAuthorityAndSupplyByTurn(game);

    expect(result).toHaveLength(1);
    expect(result).toEqual([
      {
        playerScores: { 0: 49, 1: 50 },
        supply: {
          ...initialSupply, // No reduction in estates due to trash
        },
      },
    ]);
  });

  it('should calculate victory points correctly with multiple actions', () => {
    const gameStart = game.log[0].timestamp;
    game.log.push(
      {
        id: '2',
        timestamp: new Date(gameStart.getTime() + 1000),
        gameTime: 1000,
        action: GameLogAction.ADD_AUTHORITY,
        playerIndex: 0,
        currentPlayerIndex: 0,
        turn: 1,
        count: 1,
      },
      {
        id: '3',
        timestamp: new Date(gameStart.getTime() + 2000),
        gameTime: 2000,
        action: GameLogAction.NEXT_TURN,
        playerIndex: 1,
        currentPlayerIndex: 1,
        turn: 2,
        prevPlayerIndex: 0,
      },
      {
        id: '4',
        timestamp: new Date(gameStart.getTime() + 3000),
        gameTime: 3000,
        action: GameLogAction.ADD_AUTHORITY,
        playerIndex: 1,
        currentPlayerIndex: 1,
        turn: 2,
        count: 1,
      },
      {
        id: '4',
        timestamp: new Date(gameStart.getTime() + 4000),
        gameTime: 4000,
        action: GameLogAction.NEXT_TURN,
        playerIndex: 0,
        currentPlayerIndex: 0,
        prevPlayerIndex: 1,
        turn: 3,
      }
    );

    const result = calculateAuthorityAndSupplyByTurn(game);

    expect(result).toHaveLength(2);
    expect(result).toEqual([
      {
        playerScores: { 0: 51, 1: 50 },
        supply: initialSupply,
      },
      {
        playerScores: { 0: 51, 1: 51 },
        supply: initialSupply,
      },
    ]);
  });

  it('should handle actions affecting multiple fields correctly', () => {
    const gameStart = game.log[0].timestamp;
    game.log.push(
      createMockLog({
        id: '2',
        timestamp: new Date(gameStart.getTime() + 1000),
        gameTime: 1000,
        action: GameLogAction.ADD_AUTHORITY,
        playerIndex: 0,
        currentPlayerIndex: 0,
        turn: 1,
        count: 1,
      }),
      createMockLog({
        id: '3',
        timestamp: new Date(gameStart.getTime() + 2000),
        gameTime: 2000,
        action: GameLogAction.NEXT_TURN,
        turn: 2,
        playerIndex: 1,
        currentPlayerIndex: 1,
        prevPlayerIndex: 0,
      }),
      createMockLog({
        id: '4',
        timestamp: new Date(gameStart.getTime() + 3000),
        gameTime: 3000,
        action: GameLogAction.ADD_AUTHORITY,
        playerIndex: 1,
        currentPlayerIndex: 1,
        turn: 2,
        count: 2,
      }),
      createMockLog({
        id: '5',
        timestamp: new Date(gameStart.getTime() + 4000),
        gameTime: 4000,
        action: GameLogAction.NEXT_TURN,
        playerIndex: 0,
        currentPlayerIndex: 0,
        prevPlayerIndex: 1,
        turn: 3,
      })
    );
    game.currentTurn = 3;

    const result = calculateAuthorityAndSupplyByTurn(game);

    expect(result).toHaveLength(2);
    expect(result).toEqual([
      {
        playerScores: { 0: 51, 1: 50 },
        supply: initialSupply,
      },
      {
        playerScores: { 0: 51, 1: 52 },
        supply: initialSupply,
      },
    ]);
  });
});
