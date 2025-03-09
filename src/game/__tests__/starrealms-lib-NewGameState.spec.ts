import { IGame } from '@/game/interfaces/game';
import { CurrentStep } from '@/game/enumerations/current-step';
import { newPlayer, NewGameState } from '@/game/starrealms-lib';
import { DefaultPlayerColors, EmptyGameState, MAX_PLAYERS } from '@/game/constants';
import { MinPlayersError } from '@/game/errors/min-players';
import { MaxPlayersError } from '@/game/errors/max-players';
import { ILogEntry } from '@/game/interfaces/log-entry';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import { faker } from '@faker-js/faker';

describe('NewGameState', () => {
  const gameStart = new Date('2022-01-01T00:00:00Z');
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize a new game state with default options', () => {
    const initialGameState: IGame = {
      ...EmptyGameState(),
      players: [
        newPlayer('Player 1', false, DefaultPlayerColors[0]),
        newPlayer('Player 2', false, DefaultPlayerColors[1]),
      ],
      currentPlayerIndex: 0,
      selectedPlayerIndex: 0,
    };

    const result = NewGameState(initialGameState, gameStart);

    expect(result.currentStep).toBe(CurrentStep.Game);
    expect(result.players.length).toBe(2);
    expect(result.currentPlayerIndex).toBe(initialGameState.currentPlayerIndex);
    expect(result.currentTurn).toBe(1);
    expect(result.log).toEqual([
      {
        id: expect.any(String),
        timestamp: gameStart,
        gameTime: 0,
        action: GameLogAction.START_GAME,
        playerIndex: 0,
        currentPlayerIndex: initialGameState.currentPlayerIndex,
        turn: 1,
      } as ILogEntry,
    ]);
    expect(result.supply).toBeDefined();
  });

  it('should throw MinPlayersError for less than minimum players', () => {
    const initialGameState: IGame = {
      ...EmptyGameState(),
      players: [newPlayer('Player 1', false, DefaultPlayerColors[0])],
    };

    expect(() => NewGameState(initialGameState, gameStart)).toThrow(MinPlayersError);
  });

  it('should preserve custom options', () => {
    const customOptions = {
      trackCardCounts: true,
      trackCardGains: true,
      trackDiscard: true,
      trackAssimilation: false,
      startingAuthorityByPlayerIndex: [50, 50],
      startingCardsByPlayerIndex: [5, 5],
    };
    const initialGameState: IGame = {
      ...EmptyGameState(),
      players: [
        newPlayer('Player 1', false, DefaultPlayerColors[0]),
        newPlayer('Player 2', false, DefaultPlayerColors[1]),
      ],
      options: customOptions,
    };

    const result = NewGameState(initialGameState, gameStart);

    expect(result.options).toEqual(customOptions);
  });

  it('should handle maximum number of players', () => {
    const initialGameState: IGame = {
      ...EmptyGameState(),
      players: Array(MAX_PLAYERS)
        .fill(null)
        .map((_, i) => newPlayer(`Player ${i + 1}`, false, DefaultPlayerColors[i])),
    };

    const result = NewGameState(initialGameState, gameStart);

    expect(result.players.length).toBe(MAX_PLAYERS);
  });

  it('should throw MaxPlayersError for more than maximum players', () => {
    const initialGameState: IGame = {
      ...EmptyGameState(),
      players: Array(MAX_PLAYERS + 1)
        .fill(null)
        .map((_, i) => newPlayer(`Player ${i + 1}`, false, DefaultPlayerColors[i])),
    };

    expect(() => NewGameState(initialGameState, gameStart)).toThrow(MaxPlayersError);
  });
});
