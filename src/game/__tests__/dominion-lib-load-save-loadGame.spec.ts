import { loadGame } from '@/game/dominion-lib-load-save';
import { IGame } from '@/game/interfaces/game';
import { IStorageService } from '@/game/interfaces/storage-service';
import { NO_PLAYER, SaveGameStorageKeyPrefix } from '@/game/constants';
import { EmptyLogError } from '@/game/errors/empty-log';
import { InvalidLogSaveGameError } from '@/game/errors/invalid-log-save-game';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import { createMockGame, createMockLog } from '@/__fixtures__/dominion-lib-fixtures';
import { faker } from '@faker-js/faker';

describe('loadGame', () => {
  let mockStorageService: jest.Mocked<IStorageService>;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    mockStorageService = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {
      // do nothing
    });
  });

  it('should return null when no game is found for the given save ID', () => {
    mockStorageService.getItem.mockReturnValue(null);

    const badId = 'nonexistent-id';

    const result = loadGame(badId, mockStorageService, new Date());

    expect(result).toBeNull();
    expect(mockStorageService.getItem).toHaveBeenCalledWith(`${SaveGameStorageKeyPrefix}${badId}`);
    expect(consoleErrorSpy).toHaveBeenCalledWith(`No game found for saveId: ${badId}`);
  });

  it('should return null when the game data is invalid JSON', () => {
    mockStorageService.getItem.mockReturnValue('invalid json');

    const result = loadGame('invalid-json-id', mockStorageService, new Date());

    expect(result).toBeNull();
    expect(mockStorageService.getItem).toHaveBeenCalledWith(
      `${SaveGameStorageKeyPrefix}invalid-json-id`
    );
  });

  it('should throw EmptyLogError when the game log is empty', () => {
    const game: IGame = createMockGame(2, { log: [] }); // Create a mock game with an empty log
    mockStorageService.getItem.mockReturnValue(JSON.stringify(game)); // Simulate stored game data

    expect(() => loadGame('empty-log-id', mockStorageService, new Date())).toThrow(EmptyLogError); // Ensure EmptyLogError is thrown
    expect(mockStorageService.getItem).toHaveBeenCalledWith(
      `${SaveGameStorageKeyPrefix}empty-log-id`
    );
  });

  it('should throw InvalidLogSaveGameError when the last log action is not SAVE_GAME', () => {
    const id = faker.string.uuid();
    const game: IGame = createMockGame(2, {
      log: [
        {
          id: id,
          action: GameLogAction.START_GAME,
          timestamp: new Date(),
          playerIndex: 0,
          currentPlayerIndex: 0,
          turn: 1,
        },
      ],
    });
    mockStorageService.getItem.mockReturnValue(JSON.stringify(game));

    expect(() => loadGame(id, mockStorageService, new Date())).toThrow(InvalidLogSaveGameError);
    expect(mockStorageService.getItem).toHaveBeenCalledWith(`${SaveGameStorageKeyPrefix}${id}`);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error loading game:',
      expect.any(InvalidLogSaveGameError)
    );
  });

  it('should return the loaded game when the game is loaded successfully', () => {
    const saveGameLogId = faker.string.uuid();
    const game: IGame = createMockGame(3, {
      firstPlayerIndex: 0,
      currentPlayerIndex: 0,
      selectedPlayerIndex: 0,
      log: [
        createMockLog({
          id: faker.string.uuid(),
          action: GameLogAction.START_GAME,
          timestamp: new Date('2023-01-01T00:00:00Z'),
          playerIndex: 0,
          currentPlayerIndex: 0,
          turn: 1,
        }),
        createMockLog({
          id: saveGameLogId,
          action: GameLogAction.SAVE_GAME,
          timestamp: new Date('2023-01-01T00:01:00Z'),
          playerIndex: NO_PLAYER,
          currentPlayerIndex: 0,
          turn: 1,
        }),
      ],
    });
    mockStorageService.getItem.mockReturnValue(JSON.stringify(game));

    const result = loadGame('valid-id', mockStorageService, new Date('2023-01-01T00:02:00Z'));

    expect(result).toStrictEqual({
      ...game,
      log: [
        ...game.log,
        {
          id: expect.any(String),
          timestamp: expect.any(Date),
          playerIndex: NO_PLAYER,
          currentPlayerIndex: game.currentPlayerIndex,
          turn: 1,
          action: GameLogAction.LOAD_GAME,
          linkedActionId: saveGameLogId,
        },
      ],
      timeCache: [
        {
          adjustedDuration: 0,
          eventId: expect.any(String),
          inPauseState: false,
          inSaveState: false,
          pauseStartTime: null,
          saveStartTime: null,
          totalPauseTime: 0,
          turnPauseTime: 0,
        },
        {
          adjustedDuration: 60000,
          eventId: expect.any(String),
          inPauseState: false,
          inSaveState: true,
          pauseStartTime: null,
          saveStartTime: new Date('2023-01-01T00:01:00.000Z'),
          totalPauseTime: 0,
          turnPauseTime: 0,
        },
        {
          adjustedDuration: 60000,
          eventId: expect.any(String),
          inPauseState: false,
          inSaveState: false,
          pauseStartTime: null,
          saveStartTime: null,
          totalPauseTime: 60000,
          turnPauseTime: 60000,
        },
      ],
    });
    expect(mockStorageService.getItem).toHaveBeenCalledWith(`${SaveGameStorageKeyPrefix}valid-id`);
  });
});
