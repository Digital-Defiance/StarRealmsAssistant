import { createMockGame, createMockLog } from '@/__fixtures__/starrealms-lib-fixtures';
import {
  getGameStartTime,
  getGameEndTime,
  getTurnStartTime,
  getGameTurnCount,
  getTurnEndTime,
  getTurnAdjustments,
  groupTurnAdjustments,
  getPlayerForTurn,
  getAverageActionsPerTurn,
  getPlayerNextTurnCount,
  getMasterActionId,
} from '@/game/starrealms-lib-log';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import { EmptyLogError } from '@/game/errors/empty-log';
import { InvalidLogStartGameError } from '@/game/errors/invalid-log-start-game';
import { IGame } from '@/game/interfaces/game';
import { ITurnAdjustment } from '@/game/interfaces/turn-adjustment';
import { ILogEntry } from '@/game/interfaces/log-entry';
import { InvalidPlayerIndexError } from '@/game/errors/invalid-player-index';

describe('getGameStartTime', () => {
  it('should throw EmptyLogError if the log is empty', () => {
    const game: IGame = createMockGame(2, {
      log: [],
    });
    expect(() => getGameStartTime(game)).toThrow(EmptyLogError);
  });

  it('should throw InvalidLogStartGameError if the first log entry is not START_GAME', () => {
    const game: IGame = createMockGame(2, {
      log: [createMockLog({ action: GameLogAction.NEXT_TURN, timestamp: new Date() })],
    });
    expect(() => getGameStartTime(game)).toThrow(InvalidLogStartGameError);
  });

  it('should return the timestamp of the first log entry if it is START_GAME', () => {
    const startTime = new Date();
    const game: IGame = createMockGame(2, {
      log: [createMockLog({ action: GameLogAction.START_GAME, timestamp: startTime, turn: 1 })],
    });
    expect(getGameStartTime(game)).toEqual(startTime);
  });
});

describe('getGameEndTime', () => {
  it('should throw EmptyLogError if the log is empty', () => {
    const game: IGame = createMockGame(2, {
      log: [],
    });
    expect(() => getGameEndTime(game)).toThrow(EmptyLogError);
  });

  it('should throw an error if the last log entry is not END_GAME', () => {
    const game: IGame = createMockGame(2, {
      log: [createMockLog({ action: GameLogAction.START_GAME, timestamp: new Date(), turn: 1 })],
    });
    expect(() => getGameEndTime(game)).toThrow('Game has not ended');
  });

  it('should return the timestamp of the last log entry if it is END_GAME', () => {
    const endTime = new Date();
    const game: IGame = createMockGame(2, {
      log: [
        createMockLog({ action: GameLogAction.START_GAME, timestamp: new Date(), turn: 1 }),
        createMockLog({ action: GameLogAction.END_GAME, timestamp: endTime, turn: 1 }),
      ],
    });
    expect(getGameEndTime(game)).toEqual(endTime);
  });
});

describe('getTurnStartTime', () => {
  it('should throw an error if the turn is not found in the log', () => {
    const game: IGame = createMockGame(2, {
      log: [
        createMockLog({ action: GameLogAction.START_GAME, timestamp: new Date(), turn: 1 }),
        createMockLog({ action: GameLogAction.NEXT_TURN, timestamp: new Date(), turn: 2 }),
      ],
    });
    expect(() => getTurnStartTime(game, 3)).toThrow('Could not find turn 3 in the log');
  });

  it('should return the game start time for turn 1', () => {
    const startTime = new Date();
    const game: IGame = createMockGame(2, {
      log: [createMockLog({ action: GameLogAction.START_GAME, timestamp: startTime, turn: 1 })],
    });
    expect(getTurnStartTime(game, 1)).toEqual(startTime);
  });

  it('should return the correct timestamp for a given turn', () => {
    const startTime = new Date();
    const turn2Time = new Date(startTime.getTime() + 1000);
    const game: IGame = createMockGame(2, {
      log: [
        createMockLog({ action: GameLogAction.START_GAME, timestamp: startTime, turn: 1 }),
        createMockLog({ action: GameLogAction.NEXT_TURN, timestamp: turn2Time, turn: 2 }),
      ],
    });
    expect(getTurnStartTime(game, 2)).toEqual(turn2Time);
  });
});

describe('getGameTurnCount', () => {
  it('should throw an EmptyLogError if the log is empty', () => {
    const game = createMockGame(2, { log: [] });
    expect(() => getGameTurnCount(game)).toThrow(EmptyLogError);
  });

  it('should return the correct highest turn number in the game', () => {
    const log = [
      createMockLog({ turn: 1 }),
      createMockLog({ turn: 2 }),
      createMockLog({ turn: 3 }),
    ];
    const game = createMockGame(2, { log });
    const highestTurn = getGameTurnCount(game);
    expect(highestTurn).toBe(3);
  });
});

describe('getTurnEndTime', () => {
  it('should throw an EmptyLogError if the log is empty', () => {
    const game = createMockGame(2, { log: [] });
    expect(() => getTurnEndTime(game, 1)).toThrow(EmptyLogError);
  });

  it('should return the correct timestamp for a turn that ends with a NEXT_TURN action', () => {
    const log = [
      createMockLog({
        turn: 1,
        action: GameLogAction.START_GAME,
        timestamp: new Date('2023-01-01T00:00:00Z'),
      }),
      createMockLog({
        turn: 2,
        action: GameLogAction.NEXT_TURN,
        timestamp: new Date('2023-01-01T01:00:00Z'),
      }),
    ];
    const game = createMockGame(2, { log });
    const endTime = getTurnEndTime(game, 1);
    expect(endTime).toEqual(new Date('2023-01-01T01:00:00Z'));
  });

  it('should return the correct timestamp for a turn that ends with an END_GAME action', () => {
    const log = [
      createMockLog({
        turn: 1,
        action: GameLogAction.START_GAME,
        gameTime: 0,
        timestamp: new Date('2023-01-01T00:00:00Z'),
      }),
      createMockLog({
        turn: 1,
        action: GameLogAction.END_GAME,
        timestamp: new Date('2023-01-01T02:00:00Z'),
        gameTime: 7200000, // 2 hours
      }),
    ];
    const game = createMockGame(2, { log });
    const endTime = getTurnEndTime(game, 1);
    expect(endTime).toEqual(new Date('2023-01-01T02:00:00Z'));
  });

  it('should throw an error if the turn end is not found in the log', () => {
    const log = [
      createMockLog({
        turn: 1,
        action: GameLogAction.START_GAME,
        timestamp: new Date('2023-01-01T00:00:00Z'),
      }),
    ];
    const game = createMockGame(2, { log });
    expect(() => getTurnEndTime(game, 1)).toThrow(Error);
  });
});

describe('getTurnAdjustments', () => {
  let mockGame: IGame;
  const gameStart = new Date('2023-01-01T00:00:00Z');

  beforeEach(() => {
    mockGame = createMockGame(2, {
      log: [createMockLog({ action: GameLogAction.START_GAME, timestamp: gameStart })],
    });
  });

  it('should return correct adjustments for a given log entry', () => {
    const logEntry: ILogEntry = {
      id: '2',
      timestamp: new Date(gameStart.getTime() + 1000),
      gameTime: 1000,
      action: GameLogAction.ADD_TRADE,
      playerIndex: 0,
      currentPlayerIndex: 0,
      turn: 1,
      count: 3,
    };
    mockGame.log.push(logEntry);

    const expectedAdjustments: ITurnAdjustment[] = [
      { field: 'turn', subfield: 'trade', increment: 3 },
    ];

    const result = getTurnAdjustments(mockGame);
    expect(result).toEqual(expectedAdjustments);
  });

  it('should find adjustments for the correct turn', () => {
    const log: ILogEntry[] = [
      createMockLog({ action: GameLogAction.START_GAME, timestamp: gameStart }),
      createMockLog({ turn: 1, action: GameLogAction.ADD_TRADE, count: 3 }),
      createMockLog({ turn: 2, action: GameLogAction.NEXT_TURN }),
      createMockLog({ turn: 2, action: GameLogAction.ADD_TRADE, count: 2 }),
      createMockLog({ turn: 3, action: GameLogAction.NEXT_TURN }),
      createMockLog({ turn: 3, action: GameLogAction.ADD_COMBAT, count: 2 }),
    ];
    mockGame.log.push(...log);
    mockGame.currentTurn = 3;

    const result = getTurnAdjustments(mockGame, 2);
    expect(result).toEqual([{ field: 'turn', subfield: 'trade', increment: 2 }]);
  });

  it('should handle edge cases correctly', () => {
    const logEntry: ILogEntry = {
      id: '2',
      timestamp: new Date(gameStart.getTime() + 1000),
      gameTime: 1000,
      action: GameLogAction.ADD_COMBAT,
      playerIndex: 0,
      currentPlayerIndex: 0,
      turn: 1,
      count: 0,
    };
    mockGame.log.push(logEntry);

    const expectedAdjustments: ITurnAdjustment[] = [
      { field: 'turn', subfield: 'combat', increment: 0 },
    ];

    const result = getTurnAdjustments(mockGame);
    expect(result).toEqual(expectedAdjustments);
  });

  it('should filter previous turn and non adjustment log entries', () => {
    const prevTurnAdjustmant = createMockLog({
      action: GameLogAction.ADD_TRADE,
      playerIndex: 0,
      currentPlayerIndex: 0,
      turn: 1,
      count: 3,
    });
    mockGame.log.push(prevTurnAdjustmant);

    const nextTurnEntry = createMockLog({
      action: GameLogAction.NEXT_TURN,
      playerIndex: 0,
      currentPlayerIndex: 0,
      turn: 2,
    });
    mockGame.log.push(nextTurnEntry);
    mockGame.currentTurn = 2;

    const result = getTurnAdjustments(mockGame);
    expect(result).toEqual([]);
  });
});

describe('groupTurnAdjustments', () => {
  it('should group adjustments by field and subfield correctly', () => {
    const adjustments: ITurnAdjustment[] = [
      { field: 'turn', subfield: 'trade', increment: 3 },
      { field: 'turn', subfield: 'trade', increment: 2 },
      { field: 'turn', subfield: 'combat', increment: 1 },
    ];

    const expectedGroupedAdjustments: ITurnAdjustment[] = [
      { field: 'turn', subfield: 'trade', increment: 5 },
      { field: 'turn', subfield: 'combat', increment: 1 },
    ];

    const result = groupTurnAdjustments(adjustments);
    expect(result).toEqual(expectedGroupedAdjustments);
  });

  it('should handle empty adjustments array', () => {
    const adjustments: ITurnAdjustment[] = [];

    const expectedGroupedAdjustments: ITurnAdjustment[] = [];

    const result = groupTurnAdjustments(adjustments);
    expect(result).toEqual(expectedGroupedAdjustments);
  });

  it('should handle adjustments with subfields correctly', () => {
    const adjustments: ITurnAdjustment[] = [
      { field: 'turn', subfield: 'trade', increment: 3 },
      { field: 'turn', subfield: 'trade', increment: 2 },
      { field: 'turn', subfield: 'trade', increment: 1 },
      { field: 'turn', subfield: 'combat', increment: 1 },
    ];

    const expectedGroupedAdjustments: ITurnAdjustment[] = [
      { field: 'turn', subfield: 'trade', increment: 6 },
      { field: 'turn', subfield: 'combat', increment: 1 },
    ];

    const result = groupTurnAdjustments(adjustments);
    expect(result).toEqual(expectedGroupedAdjustments);
  });

  it('should handle negative increments correctly', () => {
    const adjustments: ITurnAdjustment[] = [
      { field: 'turn', subfield: 'trade', increment: 3 },
      { field: 'turn', subfield: 'trade', increment: -1 },
      { field: 'turn', subfield: 'combat', increment: 2 },
      { field: 'turn', subfield: 'combat', increment: -2 },
    ];

    const expectedGroupedAdjustments: ITurnAdjustment[] = [
      { field: 'turn', subfield: 'trade', increment: 2 },
    ];

    const result = groupTurnAdjustments(adjustments);
    expect(result).toEqual(expectedGroupedAdjustments);
  });
});

describe('getPlayerForTurn', () => {
  let gameState: IGame;

  beforeEach(() => {
    gameState = createMockGame(2, {
      currentPlayerIndex: 0,
      selectedPlayerIndex: 0,
      log: [createMockLog({ action: GameLogAction.START_GAME, turn: 1, playerIndex: 0 })],
    });
  });

  it('should return the correct player for the first turn', () => {
    gameState.log.push(createMockLog({ action: GameLogAction.NEXT_TURN, turn: 2, playerIndex: 1 }));
    const player = getPlayerForTurn(gameState, 1);
    expect(player).toBe(gameState.players[0]);
  });

  it('should return the correct player for successive turns', () => {
    gameState.log.push(createMockLog({ action: GameLogAction.NEXT_TURN, turn: 2, playerIndex: 1 }));
    const player = getPlayerForTurn(gameState, 2);
    expect(player).toStrictEqual(gameState.players[1]);
  });

  it('should throw if the turn does not exist', () => {
    expect(() => getPlayerForTurn(gameState, 99)).toThrow('Could not find turn 99 in the log');
  });

  it('should throw if the player does not exist', () => {
    gameState.log.push(
      createMockLog({ action: GameLogAction.NEXT_TURN, turn: 2, playerIndex: 99 })
    );
    expect(() => getPlayerForTurn(gameState, 2)).toThrow(
      'Invalid player index 99 for turn 2 in the log'
    );
  });

  it('should handle an empty gameState', () => {
    const emptyGameState: IGame = createMockGame(2, { players: [], log: [] });
    expect(() => getPlayerForTurn(emptyGameState, 1)).toThrow('Could not find turn 1 in the log');
  });
});

describe('getAverageActionsPerTurn', () => {
  let game: IGame;
  const gameStart = new Date('2023-01-01T00:00:00Z');

  beforeEach(() => {
    game = createMockGame(2);
  });

  it('should return the correct average actions per turn', () => {
    game.log = [
      createMockLog({
        action: GameLogAction.START_GAME,
        turn: 1,
        playerIndex: 0,
        timestamp: gameStart,
      }),
      createMockLog({
        action: GameLogAction.ADD_AUTHORITY,
        turn: 1,
        count: 3,
        playerIndex: 0,
        timestamp: new Date(gameStart.getTime() + 1000),
      }),
      createMockLog({
        action: GameLogAction.NEXT_TURN,
        turn: 2,
        playerIndex: 1,
        prevPlayerIndex: 0,
        timestamp: new Date(gameStart.getTime() + 2000),
      }),
      createMockLog({
        action: GameLogAction.ADD_AUTHORITY,
        turn: 2,
        count: 5,
        playerIndex: 1,
        timestamp: new Date(gameStart.getTime() + 3000),
      }),
      createMockLog({
        action: GameLogAction.END_GAME,
        turn: 2,
        playerIndex: -1,
        prevPlayerIndex: 1,
        timestamp: new Date(gameStart.getTime() + 4000),
      }),
    ];

    const averageActions = getAverageActionsPerTurn(game);
    expect(averageActions).toBe(1);
  });

  it('should return 0 if there are no turns', () => {
    game.log = [];
    const averageActions = getAverageActionsPerTurn(game);
    expect(averageActions).toBe(0);
  });

  it('should handle a single turn correctly', () => {
    game.log = [
      createMockLog({ action: GameLogAction.START_GAME, turn: 1, timestamp: gameStart }),
      createMockLog({
        action: GameLogAction.ADD_AUTHORITY,
        turn: 1,
        count: 4,
        timestamp: new Date(gameStart.getTime() + 1000),
      }),
      createMockLog({
        action: GameLogAction.ADD_AUTHORITY,
        turn: 1,
        count: 4,
        timestamp: new Date(gameStart.getTime() + 2000),
      }),
      createMockLog({
        action: GameLogAction.END_GAME,
        turn: 1,
        timestamp: new Date(gameStart.getTime() + 3000),
      }),
    ];

    const averageActions = getAverageActionsPerTurn(game);
    expect(averageActions).toBe(2);
  });

  it('should exclude non-action log entries', () => {
    game.log = [
      createMockLog({ action: GameLogAction.START_GAME, turn: 1, timestamp: gameStart }),
      createMockLog({
        action: GameLogAction.PAUSE,
        turn: 1,
        timestamp: new Date(gameStart.getTime() + 1000),
      }),
      createMockLog({
        action: GameLogAction.UNPAUSE,
        turn: 1,
        timestamp: new Date(gameStart.getTime() + 2000),
      }),
      createMockLog({
        action: GameLogAction.ADD_AUTHORITY,
        turn: 1,
        count: 3,
        timestamp: new Date(gameStart.getTime() + 3000),
      }),
      createMockLog({
        action: GameLogAction.NEXT_TURN,
        turn: 2,
        timestamp: new Date(gameStart.getTime() + 4000),
      }),
      createMockLog({
        action: GameLogAction.SAVE_GAME,
        turn: 2,
        timestamp: new Date(gameStart.getTime() + 5000),
      }),
      createMockLog({
        action: GameLogAction.LOAD_GAME,
        turn: 2,
        timestamp: new Date(gameStart.getTime() + 6000),
      }),
      createMockLog({
        action: GameLogAction.ADD_AUTHORITY,
        turn: 2,
        count: 5,
        timestamp: new Date(gameStart.getTime() + 7000),
      }),
      createMockLog({
        action: GameLogAction.END_GAME,
        turn: 2,
        timestamp: new Date(gameStart.getTime() + 8000),
      }),
    ];

    const averageActions = getAverageActionsPerTurn(game);
    expect(averageActions).toBe(1);
  });

  it('should handle turns with zero actions', () => {
    game.log = [
      createMockLog({ action: GameLogAction.START_GAME, turn: 1, timestamp: gameStart }),
      createMockLog({
        action: GameLogAction.NEXT_TURN,
        turn: 2,
        timestamp: new Date(gameStart.getTime() + 1000),
      }),
      createMockLog({
        action: GameLogAction.END_GAME,
        turn: 2,
        timestamp: new Date(gameStart.getTime() + 2000),
      }),
    ];

    const averageActions = getAverageActionsPerTurn(game);
    expect(averageActions).toBe(0);
  });
});

describe('getPlayerNextTurnCount', () => {
  let mockGame: IGame;
  const gameStart = new Date('2023-01-01T00:00:00Z');

  beforeEach(() => {
    mockGame = createMockGame(3, {
      currentTurn: 5,
      currentPlayerIndex: 1,
      log: [
        createMockLog({
          action: GameLogAction.START_GAME,
          turn: 1,
          playerIndex: 0,
          timestamp: gameStart,
        }),
        createMockLog({
          action: GameLogAction.ADD_AUTHORITY,
          turn: 1,
          count: 3,
          playerIndex: 0,
          timestamp: new Date(gameStart.getTime() + 1000),
        }),
        createMockLog({
          action: GameLogAction.NEXT_TURN,
          timestamp: new Date(gameStart.getTime() + 2000),
          turn: 2,
          playerIndex: 1,
          prevPlayerIndex: 0,
        }),
        createMockLog({
          action: GameLogAction.ADD_AUTHORITY,
          turn: 2,
          count: 5,
          playerIndex: 1,
          timestamp: new Date(gameStart.getTime() + 3000),
        }),
        createMockLog({
          action: GameLogAction.NEXT_TURN,
          timestamp: new Date(gameStart.getTime() + 4000),
          turn: 3,
          playerIndex: 2,
          prevPlayerIndex: 1,
        }),
        createMockLog({
          action: GameLogAction.ADD_AUTHORITY,
          turn: 3,
          count: 7,
          playerIndex: 2,
          timestamp: new Date(gameStart.getTime() + 5000),
        }),
        createMockLog({
          action: GameLogAction.NEXT_TURN,
          timestamp: new Date(gameStart.getTime() + 6000),
          turn: 4,
          playerIndex: 0,
          prevPlayerIndex: 2,
        }),
        createMockLog({
          action: GameLogAction.ADD_AUTHORITY,
          turn: 4,
          count: 9,
          playerIndex: 0,
          timestamp: new Date(gameStart.getTime() + 7000),
        }),
        createMockLog({
          action: GameLogAction.NEXT_TURN,
          timestamp: new Date(gameStart.getTime() + 8000),
          turn: 5,
          playerIndex: 1,
          prevPlayerIndex: 0,
        }),
      ],
    });
  });

  it('should return the current turn if the player is the current player', () => {
    const result = getPlayerNextTurnCount(mockGame, 1);
    expect(result).toBe(5);
  });

  it('should return the next turn number for the given player', () => {
    const result = getPlayerNextTurnCount(mockGame, 2);
    expect(result).toBe(6);
  });

  it('should return the correct turn number when the player index wraps around', () => {
    const result = getPlayerNextTurnCount(mockGame, 0);
    expect(result).toBe(7);
  });

  it('should throw an error if the player index is negative', () => {
    expect(() => getPlayerNextTurnCount(mockGame, -1)).toThrow(InvalidPlayerIndexError);
  });

  it('should throw an error if the player index is out of bounds', () => {
    expect(() => getPlayerNextTurnCount(mockGame, 3)).toThrow(InvalidPlayerIndexError);
  });

  it('should return the next turn number for the current player when skipCurrentTurn is true', () => {
    const result = getPlayerNextTurnCount(mockGame, 1, true);
    expect(result).toBe(8);
  });

  it('should return the next turn number for a different player when skipCurrentTurn is true', () => {
    const result = getPlayerNextTurnCount(mockGame, 2, true);
    expect(result).toBe(6);
  });

  it('should return the correct turn number when the player index wraps around and skipCurrentTurn is true', () => {
    const result = getPlayerNextTurnCount(mockGame, 0, true);
    expect(result).toBe(7);
  });

  it('should handle the case where skipCurrentTurn is true and the player is the last in the list', () => {
    mockGame.currentPlayerIndex = 2;
    const result = getPlayerNextTurnCount(mockGame, 2, true);
    expect(result).toBe(8);
  });
});

describe('getMasterActionId', () => {
  const gameStart = new Date('2023-01-01T00:00:00Z');

  it('should return the linked action ID for a valid log entry', () => {
    const logEntry: ILogEntry = createMockLog({
      id: '1',
      action: GameLogAction.ADD_AUTHORITY,
      timestamp: new Date(gameStart.getTime() + 1000),
      linkedActionId: 'master-123',
      // other properties
    });
    const result = getMasterActionId(logEntry);
    expect(result).toBe('master-123');
  });

  it('should return id for a log entry without linked action ID', () => {
    const logEntry: ILogEntry = createMockLog({
      id: '2',
      action: GameLogAction.ADD_AUTHORITY,
      timestamp: new Date(gameStart.getTime() + 1000),
      // other properties
    });
    const result = getMasterActionId(logEntry);
    expect(result).toBe('2');
  });
});
