import {
  updateCache,
  validateCache,
  getCacheEntryForLog,
  getAdjustedDurationFromCache,
  getTotalPauseTimeFromCache,
  calculateDurationUpToEventWithCache,
  rebuildCaches,
  calculateAverageTurnDurationForPlayer,
  calculateAverageTurnDuration,
  updateCachesForEntry,
  calculateCurrentTurnDuration,
} from '@/game/dominion-lib-time';
import { IGame } from '@/game/interfaces/game';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import { IEventTimeCache } from '@/game/interfaces/event-time-cache';
import { createMockGame, createMockLog } from '@/__fixtures__/dominion-lib-fixtures';
import { ITurnStatistics } from '@/game/interfaces/turn-statistics';
import { EmptyGameSupply } from '@/game/constants';
import { calculateInitialSupply, getNextPlayerIndexByIndex } from '@/game/dominion-lib';
import { EmptyLogError } from '../errors/empty-log';

describe('dominion-lib-time', () => {
  let consoleErrorMock: jest.SpyInstance;

  const mockStartDate = new Date('2023-01-01T00:00:00Z');

  beforeEach(() => {
    consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {
      // do nothing
    });
  });

  afterEach(() => {
    consoleErrorMock.mockRestore();
  });

  describe('updateCache', () => {
    it('should return an empty array for an empty log', () => {
      const game = createMockGame(2, { log: [], timeCache: [] });
      expect(updateCache(game)).toEqual([]);
    });

    it('should create a new cache for a game with no existing cache', () => {
      const log = [
        createMockLog({
          id: '1',
          action: GameLogAction.START_GAME,
          timestamp: mockStartDate,
          playerIndex: 0,
          prevPlayerIndex: -1,
          turn: 1,
        }),
        createMockLog({
          id: '2',
          action: GameLogAction.PAUSE,
          timestamp: new Date(mockStartDate.getTime() + 1000),
        }),
        createMockLog({
          id: '3',
          action: GameLogAction.UNPAUSE,
          timestamp: new Date(mockStartDate.getTime() + 2000),
        }),
      ];
      const game = createMockGame(2, { log, timeCache: [] });
      const result = updateCache(game);
      expect(result).toEqual([
        {
          eventId: '1',
          totalPauseTime: 0,
          turnPauseTime: 0,
          inSaveState: false,
          inPauseState: false,
          saveStartTime: null,
          pauseStartTime: null,
          adjustedDuration: 0,
        },
        {
          eventId: '2',
          totalPauseTime: 0,
          turnPauseTime: 0,
          inSaveState: false,
          inPauseState: true,
          saveStartTime: null,
          pauseStartTime: new Date(mockStartDate.getTime() + 1000),
          adjustedDuration: 1000,
        },
        {
          eventId: '3',
          totalPauseTime: 1000,
          turnPauseTime: 1000,
          inSaveState: false,
          inPauseState: false,
          saveStartTime: null,
          pauseStartTime: null,
          adjustedDuration: 1000,
        },
      ]);
    });

    it('should update an existing cache', () => {
      const existingCache = [
        {
          eventId: '1',
          totalPauseTime: 0,
          inSaveState: false,
          inPauseState: false,
          saveStartTime: null,
          pauseStartTime: null,
          adjustedDuration: 0,
        },
      ];
      const game = {
        log: [
          {
            id: '1',
            action: GameLogAction.START_GAME,
            timestamp: new Date('2023-01-01T00:00:00Z'),
            playerIndex: 0,
            prevPlayerIndex: -1,
            turn: 1,
          },
          { id: '2', action: GameLogAction.PAUSE, timestamp: new Date('2023-01-01T00:01:00Z') },
          { id: '3', action: GameLogAction.UNPAUSE, timestamp: new Date('2023-01-01T00:02:00Z') },
        ],
        timeCache: existingCache,
      };

      const result = updateCache(game as IGame);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual(existingCache[0]);
      expect(result[2].totalPauseTime).toBe(60000);
    });

    it('should handle multiple pause and save events', () => {
      const log = [
        createMockLog({
          id: '1',
          action: GameLogAction.START_GAME,
          timestamp: mockStartDate,
          playerIndex: 0,
          prevPlayerIndex: -1,
          turn: 1,
        }),
        createMockLog({
          id: '2',
          action: GameLogAction.PAUSE,
          timestamp: new Date(mockStartDate.getTime() + 1000),
        }),
        createMockLog({
          id: '3',
          action: GameLogAction.UNPAUSE,
          timestamp: new Date(mockStartDate.getTime() + 2000),
        }),
        createMockLog({
          id: '4',
          action: GameLogAction.SAVE_GAME,
          timestamp: new Date(mockStartDate.getTime() + 3000),
        }),
        createMockLog({
          id: '5',
          action: GameLogAction.LOAD_GAME,
          timestamp: new Date(mockStartDate.getTime() + 4000),
        }),
      ];
      const game = createMockGame(2, { log, timeCache: [] });
      const result = updateCache(game);

      expect(result).toHaveLength(5);
      expect(result[4].totalPauseTime).toBe(2000);
    });

    it('should return an empty array for invalid logs', () => {
      const game = createMockGame(2, {
        log: [
          createMockLog({
            id: '1',
            action: GameLogAction.PAUSE,
            timestamp: new Date('2023-01-01T00:00:00Z'),
          }),
          createMockLog({
            id: '2',
            action: GameLogAction.START_GAME,
            timestamp: new Date('2023-01-01T00:01:00Z'),
            playerIndex: 0,
            prevPlayerIndex: -1,
            turn: 1,
          }),
          createMockLog({
            id: '3',
            action: GameLogAction.UNPAUSE,
            timestamp: new Date('2023-01-01T00:02:00Z'),
          }),
        ],
        timeCache: [],
      });

      const result = updateCache(game);

      expect(consoleErrorMock).toHaveBeenCalledWith('Invalid log: First entry must be START_GAME');
      expect(result).toHaveLength(0);
      consoleErrorMock.mockRestore();
    });

    it('should handle NEXT_TURN and reset turnPauseTime', () => {
      const log = [
        createMockLog({
          id: '1',
          action: GameLogAction.START_GAME,
          timestamp: mockStartDate,
          playerIndex: 0,
          prevPlayerIndex: -1,
        }),
        createMockLog({
          id: '2',
          action: GameLogAction.PAUSE,
          timestamp: new Date(mockStartDate.getTime() + 1000),
        }),
        createMockLog({
          id: '3',
          action: GameLogAction.UNPAUSE,
          timestamp: new Date(mockStartDate.getTime() + 2000),
        }),
        createMockLog({
          id: '4',
          action: GameLogAction.NEXT_TURN,
          timestamp: new Date(mockStartDate.getTime() + 3000),
        }),
      ];
      const game = createMockGame(2, { log, timeCache: [] });
      const result = updateCache(game);
      expect(result).toEqual([
        {
          eventId: '1',
          totalPauseTime: 0,
          turnPauseTime: 0,
          inSaveState: false,
          inPauseState: false,
          saveStartTime: null,
          pauseStartTime: null,
          adjustedDuration: 0,
        },
        {
          eventId: '2',
          totalPauseTime: 0,
          turnPauseTime: 0,
          inSaveState: false,
          inPauseState: true,
          saveStartTime: null,
          pauseStartTime: new Date(mockStartDate.getTime() + 1000),
          adjustedDuration: 1000,
        },
        {
          eventId: '3',
          totalPauseTime: 1000,
          turnPauseTime: 1000,
          inSaveState: false,
          inPauseState: false,
          saveStartTime: null,
          pauseStartTime: null,
          adjustedDuration: 1000,
        },
        {
          eventId: '4',
          totalPauseTime: 1000,
          turnPauseTime: 0,
          inSaveState: false,
          inPauseState: false,
          saveStartTime: null,
          pauseStartTime: null,
          adjustedDuration: 2000,
        },
      ]);
    });

    it('should handle SAVE_GAME and LOAD_GAME actions', () => {
      const log = [
        createMockLog({
          id: '1',
          action: GameLogAction.START_GAME,
          timestamp: mockStartDate,
          playerIndex: 0,
          prevPlayerIndex: -1,
          turn: 1,
        }),
        createMockLog({
          id: '2',
          action: GameLogAction.SAVE_GAME,
          timestamp: new Date(mockStartDate.getTime() + 1000),
        }),
        createMockLog({
          id: '3',
          action: GameLogAction.LOAD_GAME,
          timestamp: new Date(mockStartDate.getTime() + 2000),
        }),
      ];
      const game = createMockGame(2, { log, timeCache: [] });
      const result = updateCache(game);
      expect(result).toEqual([
        {
          eventId: '1',
          totalPauseTime: 0,
          turnPauseTime: 0,
          inSaveState: false,
          inPauseState: false,
          saveStartTime: null,
          pauseStartTime: null,
          adjustedDuration: 0,
        },
        {
          eventId: '2',
          totalPauseTime: 0,
          turnPauseTime: 0,
          inSaveState: true,
          inPauseState: false,
          saveStartTime: new Date(mockStartDate.getTime() + 1000),
          pauseStartTime: null,
          adjustedDuration: 1000,
        },
        {
          eventId: '3',
          totalPauseTime: 1000,
          turnPauseTime: 1000,
          inSaveState: false,
          inPauseState: false,
          saveStartTime: null,
          pauseStartTime: null,
          adjustedDuration: 1000,
        },
      ]);
    });

    it('should handle END_GAME action', () => {
      const log = [
        createMockLog({
          id: '1',
          action: GameLogAction.START_GAME,
          timestamp: mockStartDate,
          playerIndex: 0,
          prevPlayerIndex: -1,
          turn: 1,
        }),
        createMockLog({
          id: '2',
          action: GameLogAction.END_GAME,
          timestamp: new Date(mockStartDate.getTime() + 1000),
          playerIndex: -1,
        }),
      ];
      const game = createMockGame(2, { log, timeCache: [] });
      const result = updateCache(game);
      expect(result).toEqual([
        {
          eventId: '1',
          totalPauseTime: 0,
          turnPauseTime: 0,
          inSaveState: false,
          inPauseState: false,
          saveStartTime: null,
          pauseStartTime: null,
          adjustedDuration: 0,
        },
        {
          eventId: '2',
          totalPauseTime: 0,
          turnPauseTime: 0,
          inSaveState: false,
          inPauseState: false,
          saveStartTime: null,
          pauseStartTime: null,
          adjustedDuration: 1000,
        },
      ]);
    });
  });

  describe('validateCache', () => {
    it('should return -1 for an empty log and cache', () => {
      expect(validateCache([], [])).toBe(-1);
    });

    it('should return the last valid index when cache is fully valid', () => {
      const log = [
        createMockLog({
          id: '1',
          action: GameLogAction.START_GAME,
          timestamp: mockStartDate,
          playerIndex: 0,
          prevPlayerIndex: -1,
          turn: 1,
        }),
        createMockLog({
          id: '2',
          action: GameLogAction.PAUSE,
          timestamp: new Date(mockStartDate.getTime() + 1000),
        }),
      ];
      const cache: IEventTimeCache[] = [
        { eventId: '1', totalPauseTime: 0 } as IEventTimeCache,
        { eventId: '2', totalPauseTime: 0 } as IEventTimeCache,
      ];
      expect(validateCache(log, cache)).toBe(1);
    });

    it('should return the last valid index when cache is partially valid', () => {
      const log = [
        createMockLog({
          id: '1',
          action: GameLogAction.START_GAME,
          timestamp: mockStartDate,
          playerIndex: 0,
          prevPlayerIndex: -1,
          turn: 1,
        }),
        createMockLog({
          id: '2',
          action: GameLogAction.PAUSE,
          timestamp: new Date(mockStartDate.getTime() + 1000),
        }),
        createMockLog({
          id: '3',
          action: GameLogAction.UNPAUSE,
          timestamp: new Date(mockStartDate.getTime() + 2000),
        }),
      ];
      const cache: IEventTimeCache[] = [
        { eventId: '1', totalPauseTime: 0 } as IEventTimeCache,
        { eventId: '2', totalPauseTime: 0 } as IEventTimeCache,
      ];
      expect(validateCache(log, cache)).toBe(1);
    });

    it('should return -1 when cache is invalid', () => {
      const log = [
        createMockLog({
          id: '1',
          action: GameLogAction.START_GAME,
          timestamp: mockStartDate,
          playerIndex: 0,
          prevPlayerIndex: -1,
          turn: 1,
        }),
        createMockLog({
          id: '2',
          action: GameLogAction.PAUSE,
          timestamp: new Date(mockStartDate.getTime() + 1000),
        }),
      ];
      const cache: IEventTimeCache[] = [
        { eventId: 'invalid', totalPauseTime: 0 } as IEventTimeCache,
        { eventId: 'invalid', totalPauseTime: 0 } as IEventTimeCache,
      ];
      expect(validateCache(log, cache)).toBe(-1);
    });
  });

  describe('getCacheEntryForLog', () => {
    it('should return null for non-existent log entry', () => {
      const game = createMockGame(2, { log: [], timeCache: [] });
      expect(getCacheEntryForLog(game, 'non-existent')).toBeNull();
    });

    it('should return the cache entry for an existing log entry', () => {
      const log = [
        createMockLog({
          id: '1',
          action: GameLogAction.START_GAME,
          timestamp: mockStartDate,
          playerIndex: 0,
          prevPlayerIndex: -1,
          turn: 1,
        }),
      ];
      const cache: IEventTimeCache[] = [{ eventId: '1', totalPauseTime: 0 } as IEventTimeCache];
      const game = createMockGame(2, { log, timeCache: cache });
      expect(getCacheEntryForLog(game, '1')).toEqual(cache[0]);
    });

    it('should update cache and return entry if not found initially', () => {
      const log = [
        createMockLog({
          id: '1',
          action: GameLogAction.START_GAME,
          timestamp: mockStartDate,
          playerIndex: 0,
          prevPlayerIndex: -1,
          turn: 1,
        }),
        createMockLog({
          id: '2',
          action: GameLogAction.PAUSE,
          timestamp: new Date(mockStartDate.getTime() + 1000),
        }),
      ];
      const game = createMockGame(2, { log, timeCache: [] });
      const result = getCacheEntryForLog(game, '2');
      expect(result).not.toBeNull();
      expect(result?.eventId).toBe('2');
    });
  });

  describe('getAdjustedDurationFromCache', () => {
    it('should return null for non-existent log entry', () => {
      const game = createMockGame(2, { log: [], timeCache: [] });
      expect(getAdjustedDurationFromCache(game, 'non-existent')).toBeNull();
    });

    it('should return the adjusted duration for an existing log entry', () => {
      const log = [
        createMockLog({
          id: '1',
          action: GameLogAction.START_GAME,
          timestamp: mockStartDate,
          playerIndex: 0,
          prevPlayerIndex: -1,
          turn: 1,
        }),
      ];
      const cache: IEventTimeCache[] = [
        { eventId: '1', adjustedDuration: 1000 } as IEventTimeCache,
      ];
      const game = createMockGame(2, { log, timeCache: cache });
      expect(getAdjustedDurationFromCache(game, '1')).toBe(1000);
    });
  });

  describe('getTotalPauseTimeFromCache', () => {
    it('should return null for non-existent log entry', () => {
      const game = createMockGame(2, { log: [], timeCache: [] });
      expect(getTotalPauseTimeFromCache(game, 'non-existent')).toBeNull();
    });

    it('should return the total pause time for an existing log entry', () => {
      const log = [
        createMockLog({
          id: '1',
          action: GameLogAction.START_GAME,
          timestamp: mockStartDate,
          playerIndex: 0,
          prevPlayerIndex: -1,
          turn: 1,
        }),
      ];
      const cache: IEventTimeCache[] = [{ eventId: '1', totalPauseTime: 500 } as IEventTimeCache];
      const game = createMockGame(2, { log, timeCache: cache });
      expect(getTotalPauseTimeFromCache(game, '1')).toBe(500);
    });
  });

  describe('calculateDurationUpToEventWithCache', () => {
    it('should calculate duration without pauses', () => {
      const log = [
        createMockLog({
          id: '1',
          action: GameLogAction.START_GAME,
          timestamp: mockStartDate,
          playerIndex: 0,
          prevPlayerIndex: -1,
          turn: 1,
        }),
        createMockLog({
          id: '2',
          action: GameLogAction.NEXT_TURN,
          timestamp: new Date(mockStartDate.getTime() + 5000),
        }),
      ];
      const game = createMockGame(2, { log, timeCache: [] });
      expect(
        calculateDurationUpToEventWithCache(game, new Date(mockStartDate.getTime() + 5000))
      ).toBe(5000);
    });

    it('should calculate duration with pauses', () => {
      const log = [
        createMockLog({
          id: '1',
          action: GameLogAction.START_GAME,
          timestamp: mockStartDate,
          playerIndex: 0,
          prevPlayerIndex: -1,
          turn: 1,
        }),
        createMockLog({
          id: '2',
          action: GameLogAction.PAUSE,
          timestamp: new Date(mockStartDate.getTime() + 1000),
        }),
        createMockLog({
          id: '3',
          action: GameLogAction.UNPAUSE,
          timestamp: new Date(mockStartDate.getTime() + 3000),
        }),
        createMockLog({
          id: '4',
          action: GameLogAction.NEXT_TURN,
          timestamp: new Date(mockStartDate.getTime() + 5000),
        }),
      ];
      const game = createMockGame(2, { log, timeCache: [] });
      expect(
        calculateDurationUpToEventWithCache(game, new Date(mockStartDate.getTime() + 5000))
      ).toBe(3000);
    });

    it('should handle event time before game start', () => {
      const log = [
        createMockLog({
          id: '1',
          action: GameLogAction.START_GAME,
          timestamp: mockStartDate,
          playerIndex: 0,
          prevPlayerIndex: -1,
          turn: 1,
        }),
      ];
      const game = createMockGame(2, { log, timeCache: [] });
      expect(
        calculateDurationUpToEventWithCache(game, new Date(mockStartDate.getTime() - 1000))
      ).toBe(0);
    });

    it('should handle event time exactly at game start', () => {
      const log = [
        createMockLog({
          id: '1',
          action: GameLogAction.START_GAME,
          timestamp: mockStartDate,
          playerIndex: 0,
          prevPlayerIndex: -1,
          turn: 1,
        }),
      ];
      const game = createMockGame(2, { log, timeCache: [] });
      expect(calculateDurationUpToEventWithCache(game, mockStartDate)).toBe(0);
    });
    it('should handle unpaired SAVE_GAME before eventTime', () => {
      const log = [
        createMockLog({
          id: '1',
          action: GameLogAction.START_GAME,
          timestamp: mockStartDate,
          playerIndex: 0,
          prevPlayerIndex: -1,
          turn: 1,
        }),
        createMockLog({
          id: '2',
          action: GameLogAction.SAVE_GAME,
          timestamp: new Date(mockStartDate.getTime() + 2000),
        }),
      ];
      const game = createMockGame(2, { log, timeCache: [] });
      const eventTime = new Date(mockStartDate.getTime() + 5000);
      expect(calculateDurationUpToEventWithCache(game, eventTime)).toBe(2000);
    });

    it('should handle unpaired PAUSE before eventTime', () => {
      const log = [
        createMockLog({
          id: '1',
          action: GameLogAction.START_GAME,
          timestamp: mockStartDate,
          playerIndex: 0,
          prevPlayerIndex: -1,
          turn: 1,
        }),
        createMockLog({
          id: '2',
          action: GameLogAction.PAUSE,
          timestamp: new Date(mockStartDate.getTime() + 2000),
        }),
      ];
      const game = createMockGame(2, { log, timeCache: [] });
      const eventTime = new Date(mockStartDate.getTime() + 5000);
      expect(calculateDurationUpToEventWithCache(game, eventTime)).toBe(2000);
    });

    it('should handle multiple SAVE_GAME and LOAD_GAME pairs', () => {
      const log = [
        createMockLog({
          id: '1',
          action: GameLogAction.START_GAME,
          timestamp: mockStartDate,
          playerIndex: 0,
          prevPlayerIndex: -1,
          turn: 1,
        }),
        createMockLog({
          id: '2',
          action: GameLogAction.SAVE_GAME,
          timestamp: new Date(mockStartDate.getTime() + 1000),
        }),
        createMockLog({
          id: '3',
          action: GameLogAction.LOAD_GAME,
          timestamp: new Date(mockStartDate.getTime() + 2000),
        }),
        createMockLog({
          id: '4',
          action: GameLogAction.SAVE_GAME,
          timestamp: new Date(mockStartDate.getTime() + 3000),
        }),
        createMockLog({
          id: '5',
          action: GameLogAction.LOAD_GAME,
          timestamp: new Date(mockStartDate.getTime() + 4000),
        }),
      ];
      const game = createMockGame(2, {
        log,
        timeCache: [],
        currentPlayerIndex: 0,
        firstPlayerIndex: 0,
        selectedPlayerIndex: 0,
      });
      const eventTime = new Date(mockStartDate.getTime() + 5000);
      expect(calculateDurationUpToEventWithCache(game, eventTime)).toBe(3000);
    });

    it('should handle multiple PAUSE and UNPAUSE pairs', () => {
      const log = [
        createMockLog({
          id: '1',
          action: GameLogAction.START_GAME,
          timestamp: mockStartDate,
          playerIndex: 0,
          prevPlayerIndex: -1,
          turn: 1,
        }),
        createMockLog({
          id: '2',
          action: GameLogAction.PAUSE,
          timestamp: new Date(mockStartDate.getTime() + 1000),
        }),
        createMockLog({
          id: '3',
          action: GameLogAction.UNPAUSE,
          timestamp: new Date(mockStartDate.getTime() + 2000),
        }),
        createMockLog({
          id: '4',
          action: GameLogAction.PAUSE,
          timestamp: new Date(mockStartDate.getTime() + 3000),
        }),
        createMockLog({
          id: '5',
          action: GameLogAction.UNPAUSE,
          timestamp: new Date(mockStartDate.getTime() + 4000),
        }),
      ];
      const game = createMockGame(2, {
        log,
        timeCache: [],
        firstPlayerIndex: 0,
        selectedPlayerIndex: 0,
        currentPlayerIndex: 0,
      });
      const eventTime = new Date(mockStartDate.getTime() + 5000);
      expect(calculateDurationUpToEventWithCache(game, eventTime)).toBe(3000);
    });

    it('should handle a mix of SAVE_GAME, LOAD_GAME, PAUSE, and UNPAUSE actions', () => {
      const log = [
        createMockLog({
          id: '1',
          action: GameLogAction.START_GAME,
          timestamp: mockStartDate,
          playerIndex: 0,
          prevPlayerIndex: -1,
          turn: 1,
        }),
        createMockLog({
          id: '2',
          action: GameLogAction.SAVE_GAME,
          timestamp: new Date(mockStartDate.getTime() + 1000),
        }),
        createMockLog({
          id: '3',
          action: GameLogAction.LOAD_GAME,
          timestamp: new Date(mockStartDate.getTime() + 2000),
        }),
        createMockLog({
          id: '4',
          action: GameLogAction.PAUSE,
          timestamp: new Date(mockStartDate.getTime() + 3000),
        }),
        createMockLog({
          id: '5',
          action: GameLogAction.UNPAUSE,
          timestamp: new Date(mockStartDate.getTime() + 4000),
        }),
      ];
      const game = createMockGame(2, {
        log,
        timeCache: [],
        firstPlayerIndex: 0,
        selectedPlayerIndex: 0,
        currentPlayerIndex: 0,
      });
      const eventTime = new Date(mockStartDate.getTime() + 5000);
      expect(calculateDurationUpToEventWithCache(game, eventTime)).toBe(3000);
    });

    it('should use existing cache entries when available', () => {
      const log = [
        createMockLog({
          id: '1',
          action: GameLogAction.START_GAME,
          timestamp: mockStartDate,
          playerIndex: 0,
          prevPlayerIndex: -1,
          turn: 1,
        }),
        createMockLog({
          id: '2',
          action: GameLogAction.SAVE_GAME,
          timestamp: new Date(mockStartDate.getTime() + 1000),
        }),
        createMockLog({
          id: '3',
          action: GameLogAction.LOAD_GAME,
          timestamp: new Date(mockStartDate.getTime() + 2000),
        }),
      ];
      const cache = [
        {
          eventId: '1',
          totalPauseTime: 0,
          turnPauseTime: 0,
          inSaveState: false,
          inPauseState: false,
          saveStartTime: null,
          pauseStartTime: null,
          adjustedDuration: 0,
        },
        {
          eventId: '2',
          totalPauseTime: 0,
          turnPauseTime: 0,
          inSaveState: true,
          inPauseState: false,
          saveStartTime: new Date(mockStartDate.getTime() + 1000),
          pauseStartTime: null,
          adjustedDuration: 1000,
        },
      ];
      const game = createMockGame(2, {
        log,
        timeCache: cache,
        firstPlayerIndex: 0,
        selectedPlayerIndex: 0,
        currentPlayerIndex: 0,
      });
      const eventTime = new Date(mockStartDate.getTime() + 3000);
      expect(calculateDurationUpToEventWithCache(game, eventTime)).toBe(2000);
    });

    it('should calculate the correct duration', () => {
      const game: IGame = createMockGame(2, {
        currentPlayerIndex: 0,
        firstPlayerIndex: 0,
        selectedPlayerIndex: 0,
        currentTurn: 2,
        log: [
          createMockLog({
            id: '1',
            action: GameLogAction.START_GAME,
            timestamp: new Date('2023-01-01T00:00:00Z'),
            playerIndex: 0,
          }),
          createMockLog({
            id: '2',
            action: GameLogAction.PAUSE,
            timestamp: new Date('2023-01-01T00:10:00Z'),
            playerIndex: undefined,
          }),
          createMockLog({
            id: '3',
            action: GameLogAction.UNPAUSE,
            timestamp: new Date('2023-01-01T00:20:00Z'),
            playerIndex: undefined,
          }),
          createMockLog({
            id: '4',
            action: GameLogAction.NEXT_TURN,
            timestamp: new Date('2023-01-01T00:30:00Z'),
            turn: 2,
            playerIndex: 1,
            prevPlayerIndex: 0,
          }),
        ],
        timeCache: [],
        // other game properties
      });
      const eventTime = new Date('2023-01-01T00:40:00Z');
      const duration = calculateDurationUpToEventWithCache(game, eventTime);
      expect(duration).toBe(1800000); // 30 minutes in milliseconds
    });
  });

  describe('rebuildCaches', () => {
    it('should return empty caches for an empty log', () => {
      const game = createMockGame(2, { log: [], timeCache: [], turnStatisticsCache: [] });
      const result = rebuildCaches(game);
      expect(result.timeCache).toEqual([]);
      expect(result.turnStatisticsCache).toEqual([]);
    });

    it('should handle a log with only START_GAME action', () => {
      const log = [
        createMockLog({
          id: '1',
          action: GameLogAction.START_GAME,
          timestamp: mockStartDate,
          playerIndex: 0,
          prevPlayerIndex: -1,
          turn: 1,
        }),
      ];
      const game = createMockGame(2, {
        log,
        timeCache: [],
        turnStatisticsCache: [],
        firstPlayerIndex: 0,
        selectedPlayerIndex: 0,
        currentPlayerIndex: 0,
      });
      const result = rebuildCaches(game);
      expect(result.timeCache).toEqual([
        {
          eventId: '1',
          totalPauseTime: 0,
          turnPauseTime: 0,
          inSaveState: false,
          inPauseState: false,
          saveStartTime: null,
          pauseStartTime: null,
          adjustedDuration: 0,
        },
      ]);
      expect(result.turnStatisticsCache).toEqual([]);
    });

    it('should handle a log with multiple actions', () => {
      const log = [
        createMockLog({
          id: '1',
          action: GameLogAction.START_GAME,
          timestamp: mockStartDate,
          playerIndex: 0,
          prevPlayerIndex: -1,
          turn: 1,
        }),
        createMockLog({
          id: '2',
          action: GameLogAction.PAUSE,
          timestamp: new Date(mockStartDate.getTime() + 1000),
          playerIndex: undefined,
          turn: 1,
        }),
        createMockLog({
          id: '3',
          action: GameLogAction.UNPAUSE,
          timestamp: new Date(mockStartDate.getTime() + 2000),
          playerIndex: undefined,
          turn: 1,
        }),
        createMockLog({
          id: '4',
          action: GameLogAction.NEXT_TURN,
          timestamp: new Date(mockStartDate.getTime() + 3000),
          playerIndex: 1,
          prevPlayerIndex: 0,
          turn: 2,
        }),
        createMockLog({
          id: '5',
          action: GameLogAction.END_GAME,
          timestamp: new Date(mockStartDate.getTime() + 4000),
          playerIndex: -1,
          prevPlayerIndex: 1,
          turn: 2,
        }),
      ];
      const game = createMockGame(2, { log, timeCache: [], turnStatisticsCache: [] });
      const result = rebuildCaches(game);
      expect(result.turnStatisticsCache).toEqual([
        {
          turn: 1,
          start: new Date('2023-01-01T00:00:00Z'),
          end: new Date('2023-01-01T00:00:03.000Z'),
          supply: game.supply,
          playerScores: [3, 3],
          playerIndex: 0,
          turnDuration: 3000,
        },
        {
          turn: 2,
          start: new Date('2023-01-01T00:00:03.000Z'),
          end: new Date('2023-01-01T00:00:04.000Z'),
          supply: game.supply,
          playerScores: [3, 3],
          playerIndex: 1,
          turnDuration: 1000,
        },
      ]);
    });

    it('should handle a log with SAVE_GAME and LOAD_GAME actions', () => {
      const log = [
        createMockLog({
          id: '1',
          action: GameLogAction.START_GAME,
          timestamp: mockStartDate,
          playerIndex: 0,
          prevPlayerIndex: -1,
          turn: 1,
        }),
        createMockLog({
          id: '2',
          action: GameLogAction.SAVE_GAME,
          timestamp: new Date(mockStartDate.getTime() + 1000),
          playerIndex: undefined,
        }),
        createMockLog({
          id: '3',
          action: GameLogAction.LOAD_GAME,
          timestamp: new Date(mockStartDate.getTime() + 2000),
          playerIndex: undefined,
        }),
      ];
      const game = createMockGame(2, { log, timeCache: [], turnStatisticsCache: [] });
      const result = rebuildCaches(game);
      expect(result.timeCache).toEqual([
        {
          eventId: '1',
          totalPauseTime: 0,
          turnPauseTime: 0,
          inSaveState: false,
          inPauseState: false,
          saveStartTime: null,
          pauseStartTime: null,
          adjustedDuration: 0,
        },
        {
          eventId: '2',
          totalPauseTime: 0,
          turnPauseTime: 0,
          inSaveState: true,
          inPauseState: false,
          saveStartTime: new Date(mockStartDate.getTime() + 1000),
          pauseStartTime: null,
          adjustedDuration: 1000,
        },
        {
          eventId: '3',
          totalPauseTime: 1000,
          turnPauseTime: 1000,
          inSaveState: false,
          inPauseState: false,
          saveStartTime: null,
          pauseStartTime: null,
          adjustedDuration: 1000,
        },
      ]);
      expect(result.turnStatisticsCache).toEqual([]);
    });

    it('should handle a log with multiple NEXT_TURN actions', () => {
      const log = [
        createMockLog({
          id: '1',
          action: GameLogAction.START_GAME,
          timestamp: mockStartDate,
          playerIndex: 0,
          prevPlayerIndex: -1,
          turn: 1,
        }),
        createMockLog({
          id: '2',
          action: GameLogAction.NEXT_TURN,
          timestamp: new Date(mockStartDate.getTime() + 1000),
          playerIndex: 1,
          prevPlayerIndex: 0,
          turn: 2,
        }),
        createMockLog({
          id: '3',
          action: GameLogAction.NEXT_TURN,
          timestamp: new Date(mockStartDate.getTime() + 2000),
          playerIndex: 0,
          prevPlayerIndex: 1,
          turn: 3,
        }),
      ];
      const game = createMockGame(2, { log, timeCache: [], turnStatisticsCache: [] });
      const result = rebuildCaches(game);
      expect(result.timeCache).toEqual([
        {
          eventId: '1',
          totalPauseTime: 0,
          turnPauseTime: 0,
          inSaveState: false,
          inPauseState: false,
          saveStartTime: null,
          pauseStartTime: null,
          adjustedDuration: 0,
        },
        {
          eventId: '2',
          totalPauseTime: 0,
          turnPauseTime: 0,
          inSaveState: false,
          inPauseState: false,
          saveStartTime: null,
          pauseStartTime: null,
          adjustedDuration: 1000,
        },
        {
          eventId: '3',
          totalPauseTime: 0,
          turnPauseTime: 0,
          inSaveState: false,
          inPauseState: false,
          saveStartTime: null,
          pauseStartTime: null,
          adjustedDuration: 2000,
        },
      ]);
      expect(result.turnStatisticsCache).toEqual([
        {
          turn: 1,
          start: new Date('2023-01-01T00:00:00.000Z'),
          end: new Date('2023-01-01T00:00:01.000Z'),
          supply: game.supply,
          playerScores: [3, 3],
          playerIndex: 0,
          turnDuration: 1000,
        },
        {
          turn: 2,
          start: new Date('2023-01-01T00:00:01.000Z'),
          end: new Date('2023-01-01T00:00:02.000Z'),
          supply: game.supply,
          playerScores: [3, 3],
          playerIndex: 1,
          turnDuration: 1000,
        },
      ]);
    });

    it('should handle a log with PAUSE and UNPAUSE actions', () => {
      const log = [
        createMockLog({
          id: '1',
          action: GameLogAction.START_GAME,
          timestamp: mockStartDate,
          playerIndex: 0,
          prevPlayerIndex: -1,
          turn: 1,
        }),
        createMockLog({
          id: '2',
          action: GameLogAction.PAUSE,
          timestamp: new Date(mockStartDate.getTime() + 1000),
          playerIndex: undefined,
        }),
        createMockLog({
          id: '3',
          action: GameLogAction.UNPAUSE,
          timestamp: new Date(mockStartDate.getTime() + 2000),
          playerIndex: undefined,
        }),
      ];
      const game = createMockGame(2, { log, timeCache: [], turnStatisticsCache: [] });
      const result = rebuildCaches(game);
      expect(result.timeCache).toEqual([
        {
          eventId: '1',
          totalPauseTime: 0,
          turnPauseTime: 0,
          inSaveState: false,
          inPauseState: false,
          saveStartTime: null,
          pauseStartTime: null,
          adjustedDuration: 0,
        },
        {
          eventId: '2',
          totalPauseTime: 0,
          turnPauseTime: 0,
          inSaveState: false,
          inPauseState: true,
          saveStartTime: null,
          pauseStartTime: new Date(mockStartDate.getTime() + 1000),
          adjustedDuration: 1000,
        },
        {
          eventId: '3',
          totalPauseTime: 1000,
          turnPauseTime: 1000,
          inSaveState: false,
          inPauseState: false,
          saveStartTime: null,
          pauseStartTime: null,
          adjustedDuration: 1000,
        },
      ]);
      expect(result.turnStatisticsCache).toEqual([]);
    });

    it('should produce the same caches as a normally built-up game', () => {
      const log = [
        createMockLog({
          id: '1',
          action: GameLogAction.START_GAME,
          timestamp: mockStartDate,
          playerIndex: 0,
          prevPlayerIndex: -1,
          turn: 1,
        }),
        createMockLog({
          id: '2',
          action: GameLogAction.PAUSE,
          timestamp: new Date(mockStartDate.getTime() + 1000),
          turn: 1,
          playerIndex: undefined,
        }),
        createMockLog({
          id: '3',
          action: GameLogAction.UNPAUSE,
          timestamp: new Date(mockStartDate.getTime() + 2000),
          turn: 1,
          playerIndex: undefined,
        }),
        createMockLog({
          id: '4',
          action: GameLogAction.NEXT_TURN,
          timestamp: new Date(mockStartDate.getTime() + 3000),
          playerIndex: 1,
          prevPlayerIndex: 0,
          turn: 2,
        }),
        createMockLog({
          id: '5',
          action: GameLogAction.END_GAME,
          timestamp: new Date(mockStartDate.getTime() + 4000),
          playerIndex: -1,
          prevPlayerIndex: 1,
          turn: 2,
        }),
      ];
      const game = createMockGame(2, { log, timeCache: [], turnStatisticsCache: [] });

      // Build up the caches normally
      const normalTimeCache = updateCache(game);
      const normalTurnStatisticsCache = [
        {
          end: new Date('2023-01-01T00:00:03.000Z'),
          playerIndex: 0,
          playerScores: [3, 3],
          start: new Date('2023-01-01T00:00:00.000Z'),
          supply: {
            ...calculateInitialSupply(2, {
              curses: true,
              mats: { coffersVillagers: false, favors: false, debt: false },
              expansions: { prosperity: false, renaissance: false, risingSun: false },
              trackCardCounts: true,
              trackCardGains: true,
            }),
            coppers: 32, // 46 - 14 (2 player game)
          },
          turn: 1,
          turnDuration: 3000,
        },
        {
          end: new Date('2023-01-01T00:00:04.000Z'),
          playerIndex: 1,
          playerScores: [3, 3],
          start: new Date('2023-01-01T00:00:03.000Z'),
          supply: {
            ...calculateInitialSupply(2, {
              curses: true,
              mats: { coffersVillagers: false, favors: false, debt: false },
              expansions: { prosperity: false, renaissance: false, risingSun: false },
              trackCardCounts: true,
              trackCardGains: true,
            }),
            coppers: 32, // 46 - 14 (2 player game)
          },
          turn: 2,
          turnDuration: 1000,
        },
      ];
      game.timeCache = normalTimeCache;
      game.turnStatisticsCache = normalTurnStatisticsCache;

      // Rebuild the caches
      const rebuiltCaches = rebuildCaches(game);

      // Compare the caches
      expect(rebuiltCaches.timeCache).toEqual(normalTimeCache);
      expect(rebuiltCaches.turnStatisticsCache).toEqual(normalTurnStatisticsCache);
    });

    it('should produce the same caches as a normally built-up game with multiple actions', () => {
      const log = [
        createMockLog({
          id: '1',
          action: GameLogAction.START_GAME,
          timestamp: mockStartDate,
          playerIndex: 0,
          prevPlayerIndex: -1,
          turn: 1,
        }),
        createMockLog({
          id: '2',
          action: GameLogAction.PAUSE,
          timestamp: new Date(mockStartDate.getTime() + 1000),
          turn: 1,
          playerIndex: undefined,
        }),
        createMockLog({
          id: '3',
          action: GameLogAction.UNPAUSE,
          timestamp: new Date(mockStartDate.getTime() + 2000),
          turn: 1,
          playerIndex: undefined,
        }),
        createMockLog({
          id: '4',
          action: GameLogAction.NEXT_TURN,
          timestamp: new Date(mockStartDate.getTime() + 3000),
          playerIndex: 1,
          prevPlayerIndex: 0,
          turn: 2,
        }),
        createMockLog({
          id: '5',
          action: GameLogAction.SAVE_GAME,
          timestamp: new Date(mockStartDate.getTime() + 4000),
          turn: 2,
          playerIndex: undefined,
        }),
        createMockLog({
          id: '6',
          action: GameLogAction.LOAD_GAME,
          timestamp: new Date(mockStartDate.getTime() + 5000),
          turn: 2,
          playerIndex: undefined,
        }),
        createMockLog({
          id: '7',
          action: GameLogAction.END_GAME,
          timestamp: new Date(mockStartDate.getTime() + 6000),
          playerIndex: -1,
          prevPlayerIndex: 1,
          turn: 2,
        }),
      ];
      const game = createMockGame(2, { log, timeCache: [], turnStatisticsCache: [] });

      // Build up the caches normally
      const normalTimeCache = updateCache(game);
      const normalTurnStatisticsCache = [
        {
          end: new Date('2023-01-01T00:00:03.000Z'),
          playerIndex: 0,
          playerScores: [3, 3],
          start: new Date('2023-01-01T00:00:00.000Z'),
          supply: {
            ...calculateInitialSupply(2, {
              curses: true,
              mats: { coffersVillagers: false, favors: false, debt: false },
              expansions: { prosperity: false, renaissance: false, risingSun: false },
              trackCardCounts: true,
              trackCardGains: true,
            }),
            coppers: 32, // 46 - 14 (2 players)
          },
          turn: 1,
          turnDuration: 3000,
        },
        {
          end: new Date('2023-01-01T00:00:06.000Z'),
          playerIndex: 1,
          playerScores: [3, 3],
          start: new Date('2023-01-01T00:00:03.000Z'),
          supply: {
            ...calculateInitialSupply(2, {
              curses: true,
              mats: { coffersVillagers: false, favors: false, debt: false },
              expansions: { prosperity: false, renaissance: false, risingSun: false },
              trackCardCounts: true,
              trackCardGains: true,
            }),
            coppers: 32, // 46 - 14 (2 players)
          },
          turn: 2,
          turnDuration: 3000,
        },
      ];
      game.timeCache = normalTimeCache;
      game.turnStatisticsCache = normalTurnStatisticsCache;

      // Rebuild the caches
      const rebuiltCaches = rebuildCaches(game);

      // Compare the caches
      expect(rebuiltCaches.timeCache).toEqual(normalTimeCache);
      expect(rebuiltCaches.turnStatisticsCache).toEqual(normalTurnStatisticsCache);
    });
  });

  describe('calculateAverageTurnDuration', () => {
    it('should return 0 for a game with no turns', () => {
      const game = createMockGame(2, { log: [], timeCache: [], turnStatisticsCache: [] });
      const result = calculateAverageTurnDuration(game);
      expect(result).toBe(0);
    });

    it('should calculate the average turn duration for a game with multiple turns', () => {
      const turnStatisticsCache: ITurnStatistics[] = [
        {
          turn: 1,
          start: new Date('2024-10-31T17:45:59.454Z'),
          end: new Date('2024-10-31T17:46:00.454Z'),
          supply: EmptyGameSupply(),
          playerScores: [3, 3],
          playerIndex: 0,
          turnDuration: 1000,
        },
        {
          turn: 2,
          start: new Date('2024-10-31T17:46:00.454Z'),
          end: new Date('2024-10-31T17:46:01.454Z'),
          supply: EmptyGameSupply(),
          playerScores: [3, 3],
          playerIndex: 1,
          turnDuration: 1000,
        },
      ];
      const game = createMockGame(2, { log: [], timeCache: [], turnStatisticsCache });
      const result = calculateAverageTurnDuration(game);
      expect(result).toBe(1000); // (1000 + 1000) / 2
    });
  });

  describe('calculateAverageTurnDurationForPlayer', () => {
    it('should return 0 for a player with no turns', () => {
      const game = createMockGame(2, { log: [], timeCache: [], turnStatisticsCache: [] });
      const result = calculateAverageTurnDurationForPlayer(game, 0);
      expect(result).toBe(0);
    });

    it('should calculate the average turn duration for a specific player', () => {
      const turnStatisticsCache: ITurnStatistics[] = [
        {
          turn: 1,
          start: new Date('2024-10-31T17:45:59.454Z'),
          end: new Date('2024-10-31T17:46:00.454Z'),
          supply: EmptyGameSupply(),
          playerScores: [3, 3],
          playerIndex: 0,
          turnDuration: 1000,
        },
        {
          turn: 2,
          start: new Date('2024-10-31T17:46:00.454Z'),
          end: new Date('2024-10-31T17:46:01.454Z'),
          supply: EmptyGameSupply(),
          playerScores: [3, 3],
          playerIndex: 1,
          turnDuration: 1000,
        },
        {
          turn: 3,
          start: new Date('2024-10-31T17:46:01.454Z'),
          end: new Date('2024-10-31T17:46:02.454Z'),
          supply: EmptyGameSupply(),
          playerScores: [3, 3],
          playerIndex: 0,
          turnDuration: 1000,
        },
      ];
      const game = createMockGame(2, { log: [], timeCache: [], turnStatisticsCache });
      const result = calculateAverageTurnDurationForPlayer(game, 0);
      expect(result).toBe(1000); // (1000 + 1000) / 2
    });
  });

  describe('updateCachesForEntry', () => {
    it('should update caches for START_GAME entry', () => {
      const game = createMockGame(2);
      const logEntry = createMockLog({
        action: GameLogAction.START_GAME,
        timestamp: mockStartDate,
        playerIndex: game.firstPlayerIndex,
        prevPlayerIndex: -1,
        turn: 1,
      });
      game.log = [logEntry];

      const { timeCache: updatedTimeCache, turnStatisticsCache: updatedTurnStatisticsCache } =
        updateCachesForEntry(game, logEntry);

      expect(updatedTimeCache).toHaveLength(1);
      expect(updatedTimeCache[0]).toStrictEqual({
        eventId: logEntry.id,
        adjustedDuration: 0,
        inPauseState: false,
        inSaveState: false,
        pauseStartTime: null,
        saveStartTime: null,
        totalPauseTime: 0,
        turnPauseTime: 0,
      });
      expect(updatedTurnStatisticsCache).toHaveLength(0);
    });

    it('should update caches for PAUSE entry', () => {
      const game = createMockGame(2);
      const startLog = createMockLog({
        action: GameLogAction.START_GAME,
        playerIndex: game.firstPlayerIndex,
        prevPlayerIndex: -1,
        timestamp: mockStartDate,
        turn: 1,
      });

      const pauseLog = createMockLog({
        action: GameLogAction.PAUSE,
        timestamp: new Date(mockStartDate.getTime() + 1000),
      });
      game.log = [startLog, pauseLog];

      const { timeCache: updatedTimeCache, turnStatisticsCache: updatedTurnStatisticsCache } =
        updateCachesForEntry(game, pauseLog);

      expect(updatedTimeCache).toHaveLength(2);
      expect(updatedTimeCache[1]).toStrictEqual({
        eventId: pauseLog.id,
        adjustedDuration: 1000,
        inPauseState: true,
        inSaveState: false,
        pauseStartTime: new Date('2023-01-01T00:00:01.000Z'),
        saveStartTime: null,
        totalPauseTime: 0,
        turnPauseTime: 0,
      });
      expect(updatedTurnStatisticsCache).toHaveLength(0);
    });

    it('should update caches for UNPAUSE entry', () => {
      const game = createMockGame(2);
      const startLog = createMockLog({
        action: GameLogAction.START_GAME,
        playerIndex: game.firstPlayerIndex,
        prevPlayerIndex: -1,
        timestamp: mockStartDate,
        turn: 1,
      });
      const pauseLog = createMockLog({
        action: GameLogAction.PAUSE,
        timestamp: new Date(mockStartDate.getTime() + 1000),
      });

      const unpauseLog = createMockLog({
        action: GameLogAction.UNPAUSE,
        timestamp: new Date(mockStartDate.getTime() + 2000),
      });
      game.log = [startLog, pauseLog, unpauseLog];

      const { timeCache: updatedTimeCache, turnStatisticsCache: updatedTurnStatisticsCache } =
        updateCachesForEntry(game, unpauseLog);

      expect(updatedTimeCache).toHaveLength(3);
      expect(updatedTimeCache[2]).toStrictEqual({
        eventId: unpauseLog.id,
        adjustedDuration: 1000,
        inPauseState: false,
        inSaveState: false,
        pauseStartTime: null,
        saveStartTime: null,
        totalPauseTime: 1000,
        turnPauseTime: 1000,
      });
      expect(updatedTurnStatisticsCache).toHaveLength(0);
    });

    it('should update caches for NEXT_TURN entry', () => {
      const game = createMockGame(2);
      const nextPlayerIndex = getNextPlayerIndexByIndex(game.firstPlayerIndex, game.players.length);
      const startLog = createMockLog({
        action: GameLogAction.START_GAME,
        playerIndex: game.firstPlayerIndex,
        prevPlayerIndex: -1,
        timestamp: mockStartDate,
        turn: 1,
      });

      const nextTurnLog = createMockLog({
        action: GameLogAction.NEXT_TURN,
        timestamp: new Date(mockStartDate.getTime() + 3000),
        playerIndex: nextPlayerIndex,
        prevPlayerIndex: game.firstPlayerIndex,
        turn: 2,
      });
      game.log = [startLog, nextTurnLog];
      // update the cache for the start game entry
      game.timeCache = [
        {
          eventId: startLog.id,
          timestamp: mockStartDate,
          totalPauseTime: 0,
          turnPauseTime: 0,
          inPauseState: false,
          inSaveState: false,
          saveStartTime: null,
          pauseStartTime: null,
          adjustedDuration: 0,
        } as IEventTimeCache,
      ] as Array<IEventTimeCache>;

      const { timeCache: updatedTimeCache, turnStatisticsCache: updatedTurnStatisticsCache } =
        updateCachesForEntry(game, nextTurnLog);

      game.timeCache = updatedTimeCache;
      game.turnStatisticsCache = updatedTurnStatisticsCache;

      expect(game.timeCache).toHaveLength(2);
      expect(game.timeCache[1]).toStrictEqual({
        eventId: nextTurnLog.id,
        adjustedDuration: 3000,
        inPauseState: false,
        inSaveState: false,
        pauseStartTime: null,
        saveStartTime: null,
        totalPauseTime: 0,
        turnPauseTime: 0,
      });
      expect(game.turnStatisticsCache).toHaveLength(1);
      expect(game.turnStatisticsCache[0]).toStrictEqual({
        turn: 1,
        playerIndex: game.firstPlayerIndex,
        end: nextTurnLog.timestamp,
        playerScores: [3, 3],
        start: mockStartDate,
        supply: {
          ...calculateInitialSupply(2, {
            curses: true,
            mats: { coffersVillagers: false, favors: false, debt: false },
            expansions: { prosperity: false, renaissance: false, risingSun: false },
            trackCardCounts: true,
            trackCardGains: true,
          }),
          coppers: 32, // 46 - 14 (2 players)
        },
        turnDuration: 3000,
      });
    });

    it('should update caches for END_GAME entry', () => {
      const game = createMockGame(2);
      const startLog = createMockLog({
        action: GameLogAction.START_GAME,
        timestamp: mockStartDate,
        playerIndex: game.firstPlayerIndex,
        prevPlayerIndex: -1,
        turn: 1,
      });

      const endGameLog = createMockLog({
        action: GameLogAction.END_GAME,
        timestamp: new Date(mockStartDate.getTime() + 4000),
        playerIndex: -1,
        prevPlayerIndex: game.firstPlayerIndex,
        turn: 1,
      });
      game.log = [startLog, endGameLog];

      const { timeCache: updatedTimeCache, turnStatisticsCache: updatedTurnStatisticsCache } =
        updateCachesForEntry(game, endGameLog);

      expect(updatedTimeCache).toHaveLength(2);
      expect(updatedTimeCache[1]).toStrictEqual({
        eventId: endGameLog.id,
        adjustedDuration: 4000,
        inPauseState: false,
        inSaveState: false,
        pauseStartTime: null,
        saveStartTime: null,
        totalPauseTime: 0,
        turnPauseTime: 0,
      });
      expect(updatedTurnStatisticsCache).toStrictEqual([
        {
          end: endGameLog.timestamp,
          playerIndex: game.firstPlayerIndex,
          playerScores: [3, 3],
          start: mockStartDate,
          supply: {
            ...calculateInitialSupply(2, {
              curses: true,
              mats: { coffersVillagers: false, favors: false, debt: false },
              expansions: { prosperity: false, renaissance: false, risingSun: false },
              trackCardCounts: true,
              trackCardGains: true,
            }),
            coppers: 32, // 46 - 14 (2 players)
          },
          turn: 1,
          turnDuration: 4000,
        },
      ]);
    });
  });
});

describe('calculateCurrentTurnDuration', () => {
  let mockGame: IGame;
  let currentTime: Date;

  beforeEach(() => {
    currentTime = new Date('2023-01-01T12:00:00Z');
    mockGame = createMockGame(2, {
      currentPlayerIndex: 0,
      firstPlayerIndex: 0,
      selectedPlayerIndex: 0,
      log: [
        createMockLog({
          action: GameLogAction.START_GAME,
          timestamp: new Date('2023-01-01T10:00:00Z'),
          turn: 1,
          prevPlayerIndex: -1,
          playerIndex: 0,
          currentPlayerIndex: 0,
        }),
        createMockLog({
          action: GameLogAction.NEXT_TURN,
          timestamp: new Date('2023-01-01T11:00:00Z'),
          turn: 2,
          playerIndex: 1,
          prevPlayerIndex: 0,
          currentPlayerIndex: 1,
        }),
      ],
      currentTurn: 2,
    });
  });

  it('should calculate the duration of the current turn', () => {
    const duration = calculateCurrentTurnDuration(mockGame, currentTime);
    expect(duration).toBe(3600000); // 1 hour in milliseconds
  });

  it('should return 0 if there are no log entries', () => {
    mockGame.log = [];
    expect(() => calculateCurrentTurnDuration(mockGame, currentTime)).toThrow(EmptyLogError);
  });

  it('should handle a single log entry correctly', () => {
    mockGame.log = [
      createMockLog({
        action: GameLogAction.START_GAME,
        timestamp: new Date('2023-01-01T10:00:00Z'),
        turn: 1,
        prevPlayerIndex: -1,
        playerIndex: 0,
        currentPlayerIndex: 0,
      }),
    ];
    mockGame.currentTurn = 1;
    const duration = calculateCurrentTurnDuration(mockGame, currentTime);
    expect(duration).toBe(7200000); // 2 hours in milliseconds
  });

  it('should handle log entries with the same timestamp', () => {
    mockGame.log = [
      createMockLog({
        action: GameLogAction.START_GAME,
        timestamp: new Date('2023-01-01T10:00:00Z'),
        turn: 1,
        prevPlayerIndex: -1,
        playerIndex: 0,
        currentPlayerIndex: 0,
      }),
      createMockLog({
        action: GameLogAction.NEXT_TURN,
        timestamp: new Date('2023-01-01T10:00:00Z'),
        turn: 2,
        playerIndex: 1,
        prevPlayerIndex: 0,
        currentPlayerIndex: 1,
      }),
    ];
    const duration = calculateCurrentTurnDuration(mockGame, currentTime);
    expect(duration).toBe(7200000); // 2 hours in milliseconds
  });

  it('should handle log entries with future timestamps', () => {
    mockGame.log = [
      createMockLog({
        action: GameLogAction.START_GAME,
        timestamp: new Date('2023-01-01T13:00:00Z'),
        turn: 1,
        prevPlayerIndex: -1,
        playerIndex: 0,
        currentPlayerIndex: 0,
      }),
    ];
    mockGame.currentTurn = 1;
    const duration = calculateCurrentTurnDuration(mockGame, currentTime);
    expect(duration).toBe(0);
  });

  it('should handle multiple NEXT_TURN entries correctly', () => {
    const secondPlayerIndex = getNextPlayerIndexByIndex(
      mockGame.firstPlayerIndex,
      mockGame.players.length
    );
    const thirdPlayerIndex = getNextPlayerIndexByIndex(secondPlayerIndex, mockGame.players.length);
    mockGame.log = [
      createMockLog({
        action: GameLogAction.START_GAME,
        timestamp: new Date('2023-01-01T10:00:00Z'),
        turn: 1,
        prevPlayerIndex: -1,
        playerIndex: mockGame.firstPlayerIndex,
      }),
      createMockLog({
        action: GameLogAction.NEXT_TURN,
        timestamp: new Date('2023-01-01T11:00:00Z'),
        turn: 2,
        playerIndex: secondPlayerIndex,
        prevPlayerIndex: mockGame.firstPlayerIndex,
      }),
      createMockLog({
        action: GameLogAction.NEXT_TURN,
        timestamp: new Date('2023-01-01T11:30:00Z'),
        turn: 3,
        playerIndex: thirdPlayerIndex,
        prevPlayerIndex: secondPlayerIndex,
      }),
    ];
    mockGame.currentTurn = 3;
    const duration = calculateCurrentTurnDuration(mockGame, currentTime);
    expect(duration).toBe(1800000); // 30 minutes in milliseconds
  });
});
