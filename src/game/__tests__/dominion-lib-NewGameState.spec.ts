import { IGame } from '@/game/interfaces/game';
import { CurrentStep } from '@/game/enumerations/current-step';
import { newPlayer, NewGameState } from '@/game/dominion-lib';
import { calculateInitialSunTokens } from '@/game/interfaces/set-mats/prophecy';
import { EmptyGameState, MAX_PLAYERS, NOT_PRESENT } from '@/game/constants';
import { MinPlayersError } from '@/game/errors/min-players';
import { MaxPlayersError } from '@/game/errors/max-players';
import { ILogEntry } from '@/game/interfaces/log-entry';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import { faker } from '@faker-js/faker';

jest.mock('@/game/interfaces/set-mats/prophecy', () => ({
  calculateInitialSunTokens: jest.fn(() => ({ suns: 5 })),
}));

describe('NewGameState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize a new game state with default options', () => {
    const firstPlayerIndex = faker.number.int({ min: 0, max: 1 });
    const initialGameState: IGame = {
      ...EmptyGameState(),
      players: [newPlayer('Player 1', 0), newPlayer('Player 2', 1)],
      currentPlayerIndex: firstPlayerIndex,
      firstPlayerIndex: firstPlayerIndex,
      selectedPlayerIndex: firstPlayerIndex,
    };

    const result = NewGameState(initialGameState);

    expect(result.currentStep).toBe(CurrentStep.Game);
    expect(result.players.length).toBe(2);
    expect(result.currentPlayerIndex).toBe(initialGameState.currentPlayerIndex);
    expect(result.firstPlayerIndex).toBe(initialGameState.firstPlayerIndex);
    expect(result.currentTurn).toBe(1);
    expect(result.log).toEqual([
      {
        id: expect.any(String),
        timestamp: expect.any(Date),
        action: GameLogAction.START_GAME,
        playerIndex: initialGameState.firstPlayerIndex,
        currentPlayerIndex: initialGameState.currentPlayerIndex,
        turn: 1,
      } as ILogEntry,
    ]);
    expect(result.supply).toBeDefined();
  });

  it('should initialize Rising Sun tokens when the expansion is enabled', () => {
    const initialGameState: IGame = {
      ...EmptyGameState(),
      players: [newPlayer('Player 1', 0), newPlayer('Player 2', 1)],
      options: {
        ...EmptyGameState().options,
        expansions: { ...EmptyGameState().options.expansions, risingSun: true },
      },
      expansions: {
        renaissance: {
          flagBearer: null,
          flagBearerEnabled: false,
        },
        risingSun: {
          prophecy: {
            suns: -1,
          },
          greatLeaderProphecy: true,
        },
      },
    };

    const result = NewGameState(initialGameState);

    expect(result.expansions.risingSun.prophecy.suns).toBe(5);
    expect(result.expansions.risingSun.greatLeaderProphecy).toBe(true);
    expect(calculateInitialSunTokens).toHaveBeenCalledWith(2);
  });

  it('should not initialize Rising Sun tokens when the expansion is disabled', () => {
    const initialGameState: IGame = {
      ...EmptyGameState(),
      players: [newPlayer('Player 1', 0), newPlayer('Player 2', 1)],
    };

    const result = NewGameState(initialGameState);

    expect(result.expansions.risingSun.prophecy.suns).toBe(NOT_PRESENT);
    expect(result.expansions.risingSun.greatLeaderProphecy).toBe(false);
    expect(calculateInitialSunTokens).not.toHaveBeenCalled();
  });

  it('should throw MinPlayersError for less than minimum players', () => {
    const initialGameState: IGame = {
      ...EmptyGameState(),
      players: [newPlayer('Player 1', 0)],
    };

    expect(() => NewGameState(initialGameState)).toThrow(MinPlayersError);
  });

  it('should preserve custom options', () => {
    const customOptions = {
      curses: false,
      expansions: { prosperity: true, renaissance: true, risingSun: false },
      mats: { coffersVillagers: true, debt: true, favors: false },
      trackCardCounts: true,
      trackCardGains: true,
    };
    const initialGameState: IGame = {
      ...EmptyGameState(),
      players: [newPlayer('Player 1', 0), newPlayer('Player 2', 1)],
      options: customOptions,
    };

    const result = NewGameState(initialGameState);

    expect(result.options).toEqual(customOptions);
  });

  it('should handle maximum number of players', () => {
    const initialGameState: IGame = {
      ...EmptyGameState(),
      players: Array(MAX_PLAYERS)
        .fill(null)
        .map((_, i) => newPlayer(`Player ${i + 1}`, i)),
    };

    const result = NewGameState(initialGameState);

    expect(result.players.length).toBe(MAX_PLAYERS);
  });

  it('should throw MaxPlayersError for more than maximum players', () => {
    const initialGameState: IGame = {
      ...EmptyGameState(),
      players: Array(MAX_PLAYERS + 1)
        .fill(null)
        .map((_, i) => newPlayer(`Player ${i + 1}`, i)),
    };

    expect(() => NewGameState(initialGameState)).toThrow(MaxPlayersError);
  });
});
