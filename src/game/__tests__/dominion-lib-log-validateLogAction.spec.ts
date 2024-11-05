import { createMockGame, createMockLog } from '@/__fixtures__/dominion-lib-fixtures';
import { IGame } from '@/game/interfaces/game';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import { validateLogAction } from '@/game/dominion-lib-log';
import { ILogEntry } from '@/game/interfaces/log-entry';

describe('validateLogAction', () => {
  let mockGame: IGame;

  beforeEach(() => {
    mockGame = createMockGame(2);
  });

  it('should not return an error for a valid log entry', () => {
    const logEntry: ILogEntry = createMockLog({
      action: GameLogAction.ADD_ACTIONS,
      playerIndex: 0,
      count: 3,
    });
    const result = validateLogAction(mockGame, logEntry);
    expect(result).toBe(null);
  });

  it('should return an error for an invalid log entry action', () => {
    const logEntry: ILogEntry = createMockLog({
      action: 'INVALID_ACTION' as GameLogAction,
      playerIndex: 0,
      count: 3,
    });
    const result = validateLogAction(mockGame, logEntry);
    expect(result).toStrictEqual(Error('Invalid log entry action: INVALID_ACTION'));
  });

  it('should return an error for an invalid player index', () => {
    const logEntry: ILogEntry = createMockLog({
      action: GameLogAction.ADD_ACTIONS,
      playerIndex: 99,
      count: 3,
    });
    const result = validateLogAction(mockGame, logEntry);
    expect(result).toStrictEqual(Error('Invalid player index: 99'));
  });

  it('should return an error for a negative player index', () => {
    const logEntry: ILogEntry = createMockLog({
      action: GameLogAction.ADD_ACTIONS,
      playerIndex: -1,
      count: 3,
    });
    const result = validateLogAction(mockGame, logEntry);
    expect(result).toStrictEqual(Error('Invalid player index: -1'));
  });

  it('should return an error for a negative count', () => {
    const logEntry: ILogEntry = createMockLog({
      action: GameLogAction.ADD_ACTIONS,
      playerIndex: 0,
      count: -3,
    });
    const result = validateLogAction(mockGame, logEntry);
    expect(result).toStrictEqual(Error('Invalid log entry count: -3'));
  });

  it('should not return an error for a valid log entry with no player index required', () => {
    const logEntry: ILogEntry = createMockLog({
      action: GameLogAction.SAVE_GAME,
      playerIndex: -1,
    });
    const result = validateLogAction(mockGame, logEntry);
    expect(result).toBe(null);
  });

  it('should return an error for a log entry with a player index when not required', () => {
    const logEntry: ILogEntry = createMockLog({
      action: GameLogAction.SAVE_GAME,
      playerIndex: 0,
    });
    const result = validateLogAction(mockGame, logEntry);
    expect(result).toStrictEqual(Error('Player index is not relevant for this action: Saved Game'));
  });
});
