import { loadGame } from '@/game/dominion-lib-load-save';
import { IGame } from '@/game/interfaces/game';
import { IStorageService } from '@/game/interfaces/storage-service';
import { NO_PLAYER, SaveGameStorageKeyPrefix } from '@/game/constants';
import { EmptyLogError } from '@/game/errors/empty-log';
import { InvalidLogSaveGameError } from '@/game/errors/invalid-log-save-game';
import { GameLogActionWithCount } from '@/game/enumerations/game-log-action-with-count';
import { createMockGame } from '@/__fixtures__/dominion-lib-fixtures';
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

    const result = loadGame(badId, mockStorageService);

    expect(result).toBeNull();
    expect(mockStorageService.getItem).toHaveBeenCalledWith(`${SaveGameStorageKeyPrefix}${badId}`);
    expect(consoleErrorSpy).toHaveBeenCalledWith(`No game found for saveId: ${badId}`);
  });

  it('should return null when the game data is invalid JSON', () => {
    mockStorageService.getItem.mockReturnValue('invalid json');

    const result = loadGame('invalid-json-id', mockStorageService);

    expect(result).toBeNull();
    expect(mockStorageService.getItem).toHaveBeenCalledWith(
      `${SaveGameStorageKeyPrefix}invalid-json-id`
    );
  });

  it('should throw EmptyLogError when the game log is empty', () => {
    const game: IGame = createMockGame(2, { log: [] }); // Create a mock game with an empty log
    mockStorageService.getItem.mockReturnValue(JSON.stringify(game)); // Simulate stored game data

    expect(() => loadGame('empty-log-id', mockStorageService)).toThrow(EmptyLogError); // Ensure EmptyLogError is thrown
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
          action: GameLogActionWithCount.START_GAME,
          timestamp: new Date(),
          playerIndex: 0,
        },
      ],
    });
    mockStorageService.getItem.mockReturnValue(JSON.stringify(game));

    expect(() => loadGame(id, mockStorageService)).toThrow(InvalidLogSaveGameError);
    expect(mockStorageService.getItem).toHaveBeenCalledWith(`${SaveGameStorageKeyPrefix}${id}`);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error loading game:',
      expect.any(InvalidLogSaveGameError)
    );
  });

  it('should return the loaded game when the game is loaded successfully', () => {
    const saveGameLogId = faker.string.uuid();
    const game: IGame = createMockGame(2, {
      log: [
        {
          id: faker.string.uuid(),
          action: GameLogActionWithCount.START_GAME,
          timestamp: new Date(),
          playerIndex: 0,
        },
        {
          id: saveGameLogId,
          action: GameLogActionWithCount.SAVE_GAME,
          timestamp: new Date(),
          playerIndex: NO_PLAYER,
        },
      ],
    });
    mockStorageService.getItem.mockReturnValue(JSON.stringify(game));

    const result = loadGame('valid-id', mockStorageService);

    expect(result).toEqual({
      ...game,
      log: [
        ...game.log,
        {
          id: expect.any(String),
          timestamp: expect.any(Date),
          playerIndex: NO_PLAYER,
          action: GameLogActionWithCount.LOAD_GAME,
          linkedActionId: saveGameLogId,
        },
      ],
    });
    expect(mockStorageService.getItem).toHaveBeenCalledWith(`${SaveGameStorageKeyPrefix}valid-id`);
  });
});
