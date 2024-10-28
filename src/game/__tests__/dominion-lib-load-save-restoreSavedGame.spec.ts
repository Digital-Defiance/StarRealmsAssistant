import { restoreSavedGame } from '@/game/dominion-lib-load-save';
import { IGameRaw } from '@/game/interfaces/game-raw';
import { ILogEntryRaw } from '@/game/interfaces/log-entry-raw';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import { createMockGameRaw } from '@/__fixtures__/dominion-lib-fixtures';
import { NO_PLAYER } from '@/game/constants';
import { faker } from '@faker-js/faker';
import { EmptyLogError } from '@/game/errors/empty-log';

describe('restoreSavedGame', () => {
  const saveGameTime = new Date();
  const validLogEntryRaw: ILogEntryRaw = {
    id: faker.string.uuid(),
    action: GameLogAction.SAVE_GAME,
    timestamp: saveGameTime.toISOString(),
    playerIndex: NO_PLAYER,
    currentPlayerIndex: 0,
    turn: 1,
  };

  // Assuming `createMockGameRaw` returns an IGameRaw object with string timestamps
  const validGameRaw: IGameRaw = createMockGameRaw(2, { log: [validLogEntryRaw] });

  let mockConsoleError: jest.SpyInstance;

  beforeEach(() => {
    jest.restoreAllMocks();
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {
      /* do nothing */
    });
  });

  it('should throw an error when the game object is invalid', () => {
    const invalidGame = { ...validGameRaw, players: null as unknown as IGameRaw['players'] }; // Invalid players

    expect(() => restoreSavedGame(invalidGame)).toThrow('Invalid game object');
    expect(mockConsoleError).toHaveBeenCalledTimes(1);
    expect(mockConsoleError).toHaveBeenCalledWith('Error restoring saved game:', expect.any(Error));
  });

  it('should restore timestamps correctly for a valid game object', () => {
    const game = JSON.parse(JSON.stringify(validGameRaw));

    const result = restoreSavedGame(game);

    expect(result.log[0].timestamp).toBeInstanceOf(Date);

    // Allow for a 15-millisecond difference tolerance due to floating point precision
    const restoredTime = result.log[0].timestamp.getTime();
    const originalTime = saveGameTime.getTime();
    expect(Math.abs(restoredTime - originalTime)).toBeLessThanOrEqual(15); // Compare with tolerance
  });

  it('should throw an error when a log entry has an invalid timestamp', () => {
    const game = JSON.parse(JSON.stringify(validGameRaw));

    // Set an invalid timestamp
    game.log[0].timestamp = 'invalid-timestamp';

    expect(() => restoreSavedGame(game)).toThrow('Invalid timestamp: invalid-timestamp');
  });

  // Additional edge case tests

  it('should throw an error if the log array is empty', () => {
    const game = { ...validGameRaw, log: [] };

    expect(() => restoreSavedGame(game)).toThrow(EmptyLogError);
    expect(mockConsoleError).not.toHaveBeenCalled();
  });

  it('should throw an error if a log entry has a missing timestamp', () => {
    const game = JSON.parse(JSON.stringify(validGameRaw));

    // Remove the timestamp field
    delete game.log[0].timestamp;

    expect(() => restoreSavedGame(game)).toThrow('Invalid timestamp: undefined');
  });
});
