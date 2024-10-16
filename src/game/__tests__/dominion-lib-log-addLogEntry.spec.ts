import { addLogEntry } from '@/game/dominion-lib-log';
import { GameLogActionWithCount } from '@/game/enumerations/game-log-action-with-count';
import { IGame } from '@/game/interfaces/game';
import { createMockGame } from '@/__fixtures__/dominion-lib-fixtures';

describe('addLogEntry', () => {
  let mockGame: IGame;

  beforeEach(() => {
    mockGame = createMockGame(2);
  });

  it('should add a log entry to an empty log', () => {
    const newEntry = addLogEntry(mockGame, 0, GameLogActionWithCount.START_GAME);
    expect(mockGame.log).toContainEqual(
      expect.objectContaining({
        playerIndex: 0,
        action: GameLogActionWithCount.START_GAME,
      })
    );
  });

  it('should add multiple log entries', () => {
    const entry1 = addLogEntry(mockGame, 0, GameLogActionWithCount.START_GAME);
    const entry2 = addLogEntry(mockGame, 1, GameLogActionWithCount.ADD_COINS, 5);

    expect(mockGame.log).toContainEqual(
      expect.objectContaining({
        playerIndex: 0,
        action: GameLogActionWithCount.START_GAME,
      })
    );
    expect(mockGame.log).toContainEqual(
      expect.objectContaining({
        playerIndex: 1,
        action: GameLogActionWithCount.ADD_COINS,
        count: 5,
      })
    );
  });

  it('should add a log entry with missing optional fields', () => {
    const newEntry = addLogEntry(mockGame, 0, GameLogActionWithCount.START_GAME);
    expect(mockGame.log).toContainEqual(
      expect.objectContaining({
        playerIndex: 0,
        action: GameLogActionWithCount.START_GAME,
      })
    );
  });

  it('should add a log entry with all fields', () => {
    const newEntry = addLogEntry(
      mockGame,
      0,
      GameLogActionWithCount.ADD_COINS,
      5,
      false,
      'someAction',
      []
    );
    expect(mockGame.log).toContainEqual(
      expect.objectContaining({
        playerIndex: 0,
        playerName: mockGame.players[0].name,
        action: GameLogActionWithCount.ADD_COINS,
        count: 5,
        correction: false,
        linkedAction: 'someAction',
        playerTurnDetails: [],
      })
    );
  });

  it('should add a log entry with special characters in player name', () => {
    mockGame.players[0].name = 'Al!ce@#';
    const newEntry = addLogEntry(mockGame, 0, GameLogActionWithCount.ADD_COINS, 5);
    expect(mockGame.log).toContainEqual(
      expect.objectContaining({
        playerIndex: 0,
        playerName: 'Al!ce@#',
        action: GameLogActionWithCount.ADD_COINS,
        count: 5,
      })
    );
  });
});
