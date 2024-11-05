import { createMockGame, createMockLog } from '@/__fixtures__/dominion-lib-fixtures';
import { IGame } from '@/game/interfaces/game';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import {
  applyLogAction,
  applyPendingGroupedActions,
  getGameStartTime,
} from '@/game/dominion-lib-log';
import { getNextPlayerIndexByIndex } from '../dominion-lib';

describe('applyPendingGroupedActions', () => {
  let mockGame: IGame;
  let actionDate: Date;
  let playerIndices: number[];
  let applyLogActionMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockGame = createMockGame(2, {
      currentTurn: 3,
      pendingGroupedActions: [],
    });
    playerIndices = [
      mockGame.currentPlayerIndex,
      getNextPlayerIndexByIndex(mockGame.currentPlayerIndex, mockGame.players.length),
    ];
    playerIndices.push(getNextPlayerIndexByIndex(playerIndices[1], mockGame.players.length));
    mockGame.log.push(
      createMockLog({
        action: GameLogAction.NEXT_TURN,
        turn: 2,
        playerIndex: playerIndices[1],
        prevPlayerIndex: playerIndices[0],
      })
    );
    mockGame.log.push(
      createMockLog({
        action: GameLogAction.NEXT_TURN,
        turn: 3,
        playerIndex: playerIndices[2],
        prevPlayerIndex: playerIndices[1],
      })
    );
    mockGame.currentPlayerIndex = playerIndices[2];
    mockGame.selectedPlayerIndex = playerIndices[2];
    actionDate = new Date(getGameStartTime(mockGame).getTime() + 10000);
    applyLogActionMock = jest
      .fn()
      .mockImplementation((game, logEntry) => applyLogAction(game, logEntry));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should not change the game state if there are no pending actions for the current turn', () => {
    const result = applyPendingGroupedActions(mockGame, actionDate, applyLogActionMock);
    expect(result).toEqual(mockGame);
    expect(applyLogActionMock).not.toHaveBeenCalled();
  });

  it('should apply pending actions for the current turn', () => {
    mockGame.pendingGroupedActions.push(
      createMockLog({
        action: GameLogAction.ADD_ACTIONS,
        playerIndex: playerIndices[0],
        turn: 3,
        count: 2,
      })
    );

    const result = applyPendingGroupedActions(mockGame, actionDate, applyLogActionMock);
    expect(result.pendingGroupedActions.length).toBe(0);
    expect(result.log.length).toBe(4);
    expect(result.log[3].action).toBe(GameLogAction.ADD_ACTIONS);
    expect(result.log[3].count).toBe(2);
    expect(applyLogActionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        currentTurn: 3,
        currentPlayerIndex: playerIndices[2],
        pendingGroupedActions: [],
      }),
      expect.objectContaining({
        id: expect.any(String),
        action: GameLogAction.ADD_ACTIONS,
        playerIndex: playerIndices[0],
        turn: 3,
        count: 2,
        timestamp: actionDate,
      })
    );
  });

  it('should throw an error for invalid actions in pendingGroupedActions', () => {
    mockGame.pendingGroupedActions.push(
      createMockLog({
        action: 'INVALID_ACTION' as GameLogAction,
        playerIndex: playerIndices[0],
        turn: 3,
      })
    );

    expect(() => applyPendingGroupedActions(mockGame, actionDate, applyLogActionMock)).toThrow(
      Error
    );
  });

  it('should apply multiple pending actions for the current turn', () => {
    const actionDate = new Date();
    mockGame.pendingGroupedActions.push(
      createMockLog({
        action: GameLogAction.ADD_ACTIONS,
        playerIndex: playerIndices[2],
        turn: 3,
        count: 2,
        timestamp: actionDate,
      }),
      createMockLog({
        action: GameLogAction.ADD_BUYS,
        playerIndex: playerIndices[2],
        turn: 3,
        count: 1,
        timestamp: actionDate,
      })
    );

    const result = applyPendingGroupedActions(mockGame, actionDate, applyLogActionMock);
    expect(result.pendingGroupedActions.length).toBe(0);
    expect(result.log.length).toBe(5);
    expect(result.log[3].action).toBe(GameLogAction.ADD_ACTIONS);
    expect(result.log[3].count).toBe(2);
    expect(result.log[4].action).toBe(GameLogAction.ADD_BUYS);
    expect(result.log[4].count).toBe(1);
    expect(applyLogActionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        currentTurn: 3,
        currentPlayerIndex: playerIndices[2],
        pendingGroupedActions: [],
      }),
      expect.objectContaining({
        action: GameLogAction.ADD_ACTIONS,
        playerIndex: playerIndices[2],
        turn: 3,
        count: 2,
        timestamp: actionDate,
      })
    );

    expect(applyLogActionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        currentTurn: 3,
        currentPlayerIndex: playerIndices[2],
        pendingGroupedActions: [],
      }),
      expect.objectContaining({
        action: GameLogAction.ADD_BUYS,
        playerIndex: playerIndices[2],
        turn: 3,
        count: 1,
        timestamp: actionDate,
      })
    );
  });

  it('should not apply actions for turns other than the current turn', () => {
    const actionDate = new Date();
    mockGame.pendingGroupedActions.push(
      createMockLog({
        action: GameLogAction.ADD_ACTIONS,
        playerIndex: playerIndices[1],
        turn: 4,
        count: 2,
        timestamp: actionDate,
      })
    );

    const result = applyPendingGroupedActions(mockGame, actionDate, applyLogActionMock);
    expect(result.pendingGroupedActions.length).toBe(1);
    expect(result.log.length).toBe(3);
  });
});
