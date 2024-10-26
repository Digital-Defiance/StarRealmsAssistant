import { safeParseSavedGame } from '@/game/dominion-lib-load-save';
import { EmptyLogError } from '@/game/errors/empty-log';
import { createMockGame } from '@/__fixtures__/dominion-lib-fixtures';
import { GameLogAction } from '@/game/enumerations/game-log-action';

describe('safeParseSavedGame', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    // Spy on console.error so we can check if errors are logged
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {
      // do nothing
    });
  });

  afterEach(() => {
    // Restore the original console.error after each test
    jest.restoreAllMocks();
  });

  it('should parse valid JSON and return the result', () => {
    const mockGame = createMockGame(2);
    const validJson = JSON.stringify(mockGame);

    const result = safeParseSavedGame(validJson);

    expect(result.log).toHaveLength(1);
    expect(result.log[0].id).toBe(mockGame.log[0].id);
    expect(result.log[0].action).toBe(GameLogAction.START_GAME);
    expect(consoleErrorSpy).not.toHaveBeenCalled(); // No error should be logged
  });

  it('should throw an error for invalid JSON', () => {
    const invalidJson = 'invalid JSON';

    expect(() => safeParseSavedGame(invalidJson)).toThrow(SyntaxError);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error parsing game JSON:',
      expect.any(SyntaxError)
    );
  });

  it('should throw an error for an empty string', () => {
    const emptyString = '';

    expect(() => safeParseSavedGame(emptyString)).toThrow('Invalid game JSON');
    expect(consoleErrorSpy).not.toHaveBeenCalled(); // No error should be logged for an empty string
  });

  it('should throw an error for null input', () => {
    const nullInput = null;

    expect(() => safeParseSavedGame(nullInput as unknown as string)).toThrow('Invalid game JSON');
    expect(consoleErrorSpy).not.toHaveBeenCalled(); // No error should be logged
  });

  it('should throw an EmptyLogError if the log is empty', () => {
    const validJsonWithEmptyLog = JSON.stringify(createMockGame(2, { log: [] }));

    expect(() => safeParseSavedGame(validJsonWithEmptyLog)).toThrow(EmptyLogError);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error parsing game JSON:',
      expect.any(EmptyLogError)
    );
  });
});
