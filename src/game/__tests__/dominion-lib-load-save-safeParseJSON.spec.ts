import { safeParseJSON } from '@/game/dominion-lib-load-save';

describe('safeParseJSON', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    // Spy on console.error so we can check if errors are logged
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore the original console.error after each test
    jest.restoreAllMocks();
  });

  it('should parse valid JSON and return the result', () => {
    const validJson = JSON.stringify([
      { id: '1', name: 'Game 1', savedAt: new Date().toISOString() },
      { id: '2', name: 'Game 2', savedAt: new Date().toISOString() },
    ]) as string;

    const result = safeParseJSON(validJson);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('1');
    expect(result[0].name).toBe('Game 1');
    expect(result[1].id).toBe('2');
    expect(result[1].name).toBe('Game 2');
    expect(consoleErrorSpy).not.toHaveBeenCalled(); // No error should be logged
  });

  it('should return an empty array and log an error for invalid JSON', () => {
    const invalidJson = 'invalid JSON';

    const result = safeParseJSON(invalidJson);

    expect(result).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error parsing saved games JSON:',
      expect.any(SyntaxError)
    );
  });

  it('should return an empty array for an empty string', () => {
    const emptyString = '';

    const result = safeParseJSON(emptyString);

    expect(result).toEqual([]); // It should return an empty array
    expect(consoleErrorSpy).not.toHaveBeenCalled(); // No error should be logged for an empty string
  });

  it('should return an empty array for null input', () => {
    const nullInput = null;

    const result = safeParseJSON(nullInput as unknown as string); // We are testing it by passing null

    expect(result).toEqual([]);
    expect(consoleErrorSpy).not.toHaveBeenCalled(); // No error should be logged
  });

  it('should handle invalid JSON', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const result = safeParseJSON('invalid JSON');
    expect(result).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error parsing saved games JSON:',
      expect.any(SyntaxError)
    );
    consoleErrorSpy.mockRestore();
  });
});
