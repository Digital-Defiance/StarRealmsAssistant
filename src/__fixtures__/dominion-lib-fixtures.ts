import { faker } from '@faker-js/faker';
import { IPlayer } from '@/game/interfaces/player';
import {
  NOT_PRESENT,
  EmptyVictoryDetails,
  EmptyMatDetails,
  DefaultTurnDetails,
  DefaultPlayerColors,
  VERSION_NUMBER,
  DefaultRenaissanceFeatures,
} from '@/game/constants';
import { calculateInitialSupply, distributeInitialSupply } from '@/game/dominion-lib';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import { IGameOptions } from '@/game/interfaces/game-options';
import { IGame } from '@/game/interfaces/game';
import { IMatsEnabled } from '@/game/interfaces/mats-enabled';
import { IExpansionsEnabled } from '@/game/interfaces/expansions-enabled';
import { CurrentStep } from '@/game/enumerations/current-step';
import { ILogEntry } from '@/game/interfaces/log-entry';
import { deepClone } from '@/game/utils';
import { IGameRaw } from '@/game/interfaces/game-raw';

export function createMockGame(playerCount: number, overrides?: Partial<IGame>): IGame {
  const firstPlayerIndex =
    overrides?.firstPlayerIndex ?? faker.number.int({ min: 0, max: playerCount - 1 });
  const options: IGameOptions = {
    curses: true,
    expansions: { prosperity: false, renaissance: false, risingSun: false } as IExpansionsEnabled,
    mats: {
      coffersVillagers: false,
      debt: false,
      favors: false,
    } as IMatsEnabled,
    trackCardCounts: true,
    trackCardGains: true,
  };
  const supply = calculateInitialSupply(playerCount, options);
  const game: IGame = {
    players: Array(playerCount)
      .fill(null)
      .map((value, index) => createMockPlayer(index, overrides?.players?.[index])),
    supply,
    options,
    expansions: {
      renaissance: DefaultRenaissanceFeatures(),
      risingSun: {
        prophecy: {
          suns: NOT_PRESENT,
        },
        greatLeaderProphecy: false,
      },
    },
    currentTurn: 1,
    currentPlayerIndex: firstPlayerIndex,
    firstPlayerIndex: firstPlayerIndex,
    selectedPlayerIndex: firstPlayerIndex,
    log: [
      {
        id: faker.string.uuid(),
        timestamp: new Date(),
        playerIndex: firstPlayerIndex,
        currentPlayerIndex: firstPlayerIndex,
        turn: 1,
        action: GameLogAction.START_GAME,
      },
    ],
    timeCache: [],
    turnStatisticsCache: [],
    currentStep: CurrentStep.Game,
    setsRequired: 1,
    gameVersion: VERSION_NUMBER,
    pendingGroupedActions: [],
    ...(overrides ? deepClone<Partial<IGame>>(overrides) : {}),
  };
  return distributeInitialSupply(game);
}

export function createMockPlayer(index?: number, overrides?: Partial<IPlayer>): IPlayer {
  return {
    name: faker.person.firstName(),
    color:
      DefaultPlayerColors[
        index ?? faker.number.int({ min: 0, max: DefaultPlayerColors.length - 1 })
      ],
    mats: EmptyMatDetails(),
    turn: DefaultTurnDetails(),
    newTurn: DefaultTurnDetails(),
    victory: EmptyVictoryDetails(),
    ...deepClone<Partial<IPlayer>>(overrides ?? {}),
  } as IPlayer;
}

export function createMockLog(log?: Partial<ILogEntry>): ILogEntry {
  return {
    id: faker.string.uuid(),
    timestamp: new Date(),
    playerIndex: faker.number.int({ min: 0, max: 3 }),
    currentPlayerIndex: faker.number.int({ min: 0, max: 3 }),
    turn: faker.number.int({ min: 1, max: 10 }),
    action: GameLogAction.ADD_ACTIONS,
    count: faker.number.int({ min: 1, max: 5 }),
    correction: false,
    // linkedActionId: faker.string.uuid(),
    prevPlayerIndex:
      log?.action && log.action === GameLogAction.START_GAME
        ? -1
        : faker.number.int({ min: 0, max: 3 }),
    ...(log ? deepClone<Partial<ILogEntry>>(log) : {}),
  };
}

export function createMockGameRaw(numPlayers: number, overrides?: Partial<IGameRaw>): IGameRaw {
  // First, create a mock game using createMockGame
  const mockGame: IGame = createMockGame(numPlayers);

  // Convert the IGame to IGameRaw
  const baseGameRaw: IGameRaw = {
    ...mockGame,
    log: mockGame.log.map((logEntry) => ({
      ...logEntry,
      timestamp: logEntry.timestamp.toISOString(),
    })),
    timeCache: mockGame.timeCache.map((timeCache) => ({
      ...timeCache,
      saveStartTime: timeCache.saveStartTime ? timeCache.saveStartTime.toISOString() : null,
      pauseStartTime: timeCache.pauseStartTime ? timeCache.pauseStartTime.toISOString() : null,
    })),
    turnStatisticsCache: mockGame.turnStatisticsCache.map((turnStatistics) => ({
      ...turnStatistics,
      start: turnStatistics.start.toISOString(),
      end: turnStatistics.end.toISOString(),
    })),
    pendingGroupedActions: mockGame.pendingGroupedActions.map((logEntry) => ({
      ...logEntry,
      timestamp: logEntry.timestamp?.toISOString(),
    })),
  };

  // Apply overrides if provided
  if (overrides) {
    // Merge overrides with baseGameRaw
    Object.keys(overrides).forEach((key) => {
      if (key === 'log' && Array.isArray(overrides.log)) {
        baseGameRaw.log = overrides.log.map((logEntry) => ({
          ...logEntry,
          timestamp:
            typeof logEntry.timestamp === 'string'
              ? logEntry.timestamp
              : new Date(logEntry.timestamp).toISOString(),
        }));
      } else if (key === 'timeCache' && Array.isArray(overrides.timeCache)) {
        baseGameRaw.timeCache = overrides.timeCache.map((timeCache) => ({
          ...timeCache,
          saveStartTime: timeCache.saveStartTime
            ? new Date(timeCache.saveStartTime).toISOString()
            : null,
          pauseStartTime: timeCache.pauseStartTime
            ? new Date(timeCache.pauseStartTime).toISOString()
            : null,
        }));
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (baseGameRaw as any)[key] = (overrides as any)[key];
      }
    });
  }

  return baseGameRaw;
}
