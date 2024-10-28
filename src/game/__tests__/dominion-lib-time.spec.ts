import {
  updateCache,
  validateCache,
  getCacheEntryForLog,
  getAdjustedDurationFromCache,
  getTotalPauseTimeFromCache,
  calculateDurationUpToEventWithCache,
} from '@/game/dominion-lib-time';
import { IGame } from '@/game/interfaces/game';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import { IEventTimeCache } from '@/game/interfaces/event-time-cache';
import { createMockGame, createMockLog } from '@/__fixtures__/dominion-lib-fixtures';

describe('dominion-lib-time', () => {
  let consoleErrorMock: jest.SpyInstance;

  const mockStartDate = new Date('2023-01-01T00:00:00Z');

  beforeEach(() => {
    consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {
      // do nothing
    });
  });

  describe('updateCache', () => {
    it('should return an empty array for an empty log', () => {
      const game = createMockGame(2, { log: [], timeCache: [] });
      expect(updateCache(game)).toEqual([]);
    });

    it('should create a new cache for a game with no existing cache', () => {
      const log = [
        createMockLog({ id: '1', action: GameLogAction.START_GAME, timestamp: mockStartDate }),
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

      expect(result).toHaveLength(3);
      expect(result[0].eventId).toBe('1');
      expect(result[1].eventId).toBe('2');
      expect(result[2].eventId).toBe('3');
      expect(result[2].totalPauseTime).toBe(1000);
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
        createMockLog({ id: '1', action: GameLogAction.START_GAME, timestamp: mockStartDate }),
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
  });

  describe('validateCache', () => {
    it('should return -1 for an empty log and cache', () => {
      expect(validateCache([], [])).toBe(-1);
    });

    it('should return the last valid index when cache is fully valid', () => {
      const log = [
        createMockLog({ id: '1', action: GameLogAction.START_GAME, timestamp: mockStartDate }),
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
        createMockLog({ id: '1', action: GameLogAction.START_GAME, timestamp: mockStartDate }),
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
        createMockLog({ id: '1', action: GameLogAction.START_GAME, timestamp: mockStartDate }),
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
        createMockLog({ id: '1', action: GameLogAction.START_GAME, timestamp: mockStartDate }),
      ];
      const cache: IEventTimeCache[] = [{ eventId: '1', totalPauseTime: 0 } as IEventTimeCache];
      const game = createMockGame(2, { log, timeCache: cache });
      expect(getCacheEntryForLog(game, '1')).toEqual(cache[0]);
    });

    it('should update cache and return entry if not found initially', () => {
      const log = [
        createMockLog({ id: '1', action: GameLogAction.START_GAME, timestamp: mockStartDate }),
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
        createMockLog({ id: '1', action: GameLogAction.START_GAME, timestamp: mockStartDate }),
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
        createMockLog({ id: '1', action: GameLogAction.START_GAME, timestamp: mockStartDate }),
      ];
      const cache: IEventTimeCache[] = [{ eventId: '1', totalPauseTime: 500 } as IEventTimeCache];
      const game = createMockGame(2, { log, timeCache: cache });
      expect(getTotalPauseTimeFromCache(game, '1')).toBe(500);
    });
  });

  describe('calculateDurationUpToEventWithCache', () => {
    const mockStartDate = new Date('2023-01-01T00:00:00Z');

    it('should calculate duration without pauses', () => {
      const log = [
        createMockLog({ id: '1', action: GameLogAction.START_GAME, timestamp: mockStartDate }),
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
        createMockLog({ id: '1', action: GameLogAction.START_GAME, timestamp: mockStartDate }),
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
        createMockLog({ id: '1', action: GameLogAction.START_GAME, timestamp: mockStartDate }),
      ];
      const game = createMockGame(2, { log, timeCache: [] });
      expect(
        calculateDurationUpToEventWithCache(game, new Date(mockStartDate.getTime() - 1000))
      ).toBe(0);
    });

    it('should handle event time exactly at game start', () => {
      const log = [
        createMockLog({ id: '1', action: GameLogAction.START_GAME, timestamp: mockStartDate }),
      ];
      const game = createMockGame(2, { log, timeCache: [] });
      expect(calculateDurationUpToEventWithCache(game, mockStartDate)).toBe(0);
    });
    it('should handle unpaired SAVE_GAME before eventTime', () => {
      const log = [
        createMockLog({ id: '1', action: GameLogAction.START_GAME, timestamp: mockStartDate }),
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
        createMockLog({ id: '1', action: GameLogAction.START_GAME, timestamp: mockStartDate }),
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
        createMockLog({ id: '1', action: GameLogAction.START_GAME, timestamp: mockStartDate }),
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
      const game = createMockGame(2, { log, timeCache: [] });
      const eventTime = new Date(mockStartDate.getTime() + 5000);
      expect(calculateDurationUpToEventWithCache(game, eventTime)).toBe(3000);
    });

    it('should handle multiple PAUSE and UNPAUSE pairs', () => {
      const log = [
        createMockLog({ id: '1', action: GameLogAction.START_GAME, timestamp: mockStartDate }),
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
      const game = createMockGame(2, { log, timeCache: [] });
      const eventTime = new Date(mockStartDate.getTime() + 5000);
      expect(calculateDurationUpToEventWithCache(game, eventTime)).toBe(3000);
    });

    it('should handle a mix of SAVE_GAME, LOAD_GAME, PAUSE, and UNPAUSE actions', () => {
      const log = [
        createMockLog({ id: '1', action: GameLogAction.START_GAME, timestamp: mockStartDate }),
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
      const game = createMockGame(2, { log, timeCache: [] });
      const eventTime = new Date(mockStartDate.getTime() + 5000);
      expect(calculateDurationUpToEventWithCache(game, eventTime)).toBe(3000);
    });

    it('should use existing cache entries when available', () => {
      const log = [
        createMockLog({ id: '1', action: GameLogAction.START_GAME, timestamp: mockStartDate }),
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
          inSaveState: false,
          inPauseState: false,
          saveStartTime: null,
          pauseStartTime: null,
          adjustedDuration: 0,
        },
        {
          eventId: '2',
          totalPauseTime: 0,
          inSaveState: true,
          inPauseState: false,
          saveStartTime: new Date(mockStartDate.getTime() + 1000),
          pauseStartTime: null,
          adjustedDuration: 1000,
        },
      ];
      const game = createMockGame(2, { log, timeCache: cache });
      const eventTime = new Date(mockStartDate.getTime() + 3000);
      expect(calculateDurationUpToEventWithCache(game, eventTime)).toBe(2000);
    });
  });
});
