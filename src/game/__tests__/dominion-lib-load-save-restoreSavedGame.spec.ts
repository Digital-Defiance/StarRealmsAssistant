import { restoreSavedGame } from '@/game/dominion-lib-load-save';
import { IGameRaw } from '@/game/interfaces/game-raw';
import { ILogEntryRaw } from '@/game/interfaces/log-entry-raw';
import { GameLogActionWithCount } from '@/game/enumerations/game-log-action-with-count';
import { createMockGame } from '@/__fixtures__/dominion-lib-fixtures';
import { NO_PLAYER } from '@/game/constants';
import { faker } from '@faker-js/faker';
import { EmptyLogError } from '@/game/errors/empty-log';

function createMockGameRaw(numPlayers: number, overrides: Partial<IGameRaw>): IGameRaw {
  const mockGame = createMockGame(numPlayers);
  return {
    ...mockGame,
    ...overrides,
    log: mockGame.log.map((logEntry) => ({
      ...logEntry,
      timestamp: logEntry.timestamp.toISOString(), // Convert Date to string
    })) as ILogEntryRaw[],
  };
}

describe('restoreSavedGame', () => {
  const saveGameTime = new Date();
  const validLogEntryRaw: ILogEntryRaw = {
    id: faker.string.uuid(),
    action: GameLogActionWithCount.SAVE_GAME,
    timestamp: saveGameTime.toISOString(),
    playerIndex: NO_PLAYER,
    playerName: 'player1',
  };

  // Assuming `createMockGameRaw` returns an IGameRaw object with string timestamps
  const validGameRaw: IGameRaw = createMockGameRaw(2, { log: [validLogEntryRaw] });

  it('should throw an error when the game object is invalid', () => {
    const invalidGame = { ...validGameRaw, players: null as any }; // Invalid players

    expect(() => restoreSavedGame(invalidGame)).toThrow('Invalid game object');
  });

  it('should restore timestamps correctly for a valid game object', () => {
    const game = JSON.parse(JSON.stringify(validGameRaw));

    const result = restoreSavedGame(game);

    expect(result.log[0].timestamp).toBeInstanceOf(Date);

    // Allow for a 5-millisecond difference tolerance due to floating point precision
    const restoredTime = result.log[0].timestamp.getTime();
    const originalTime = saveGameTime.getTime();
    expect(Math.abs(restoredTime - originalTime)).toBeLessThanOrEqual(5); // Compare with tolerance
  });

  it('should throw an error when a log entry has an invalid timestamp', () => {
    const game = JSON.parse(JSON.stringify(validGameRaw));

    // Set an invalid timestamp
    game.log[0].timestamp = 'invalid-timestamp';

    expect(() => restoreSavedGame(game)).toThrow('Invalid log entry timestamp');
  });

  // Additional edge case tests

  it('should throw an error if the log array is empty', () => {
    const game = { ...validGameRaw, log: [] };

    expect(() => restoreSavedGame(game)).toThrow(EmptyLogError);
  });

  it('should throw an error if a log entry has a missing timestamp', () => {
    const game = JSON.parse(JSON.stringify(validGameRaw));

    // Remove the timestamp field
    delete game.log[0].timestamp;

    expect(() => restoreSavedGame(game)).toThrow('Invalid log entry timestamp');
  });
});
