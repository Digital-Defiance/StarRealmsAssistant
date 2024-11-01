import { createMockGame, createMockLog } from '@/__fixtures__/dominion-lib-fixtures';
import {
  getGameStartTime,
  getGameEndTime,
  getTurnStartTime,
  getGameTurnCount,
  getTurnEndTime,
} from '@/game/dominion-lib-log';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import { EmptyLogError } from '@/game/errors/empty-log';
import { InvalidLogStartGameError } from '@/game/errors/invalid-log-start-game';
import { IGame } from '@/game/interfaces/game';

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
      log: [createMockLog({ action: GameLogAction.START_GAME, timestamp: startTime })],
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
      log: [createMockLog({ action: GameLogAction.START_GAME, timestamp: new Date() })],
    });
    expect(() => getGameEndTime(game)).toThrow('Game has not ended');
  });

  it('should return the timestamp of the last log entry if it is END_GAME', () => {
    const endTime = new Date();
    const game: IGame = createMockGame(2, {
      log: [
        createMockLog({ action: GameLogAction.START_GAME, timestamp: new Date() }),
        createMockLog({ action: GameLogAction.END_GAME, timestamp: endTime }),
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
    expect(() => getTurnStartTime(game, 3)).toThrow('Could not find turn 3 in log');
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
        timestamp: new Date('2023-01-01T00:00:00Z'),
      }),
      createMockLog({
        turn: 1,
        action: GameLogAction.END_GAME,
        timestamp: new Date('2023-01-01T02:00:00Z'),
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
