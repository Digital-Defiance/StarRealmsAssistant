import { faker } from '@faker-js/faker';
import { IPlayer } from '@/game/interfaces/player';
import {
  NOT_PRESENT,
  EmptyVictoryDetails,
  EmptyMatDetails,
  DefaultTurnDetails,
  DefaultPlayerColors,
} from '@/game/constants';
import { calculateInitialSupply, distributeInitialSupply } from '@/game/dominion-lib';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import { IGameOptions } from '@/game/interfaces/game-options';
import { IGame } from '@/game/interfaces/game';
import { IMatsEnabled } from '@/game/interfaces/mats-enabled';
import { IExpansionsEnabled } from '@/game/interfaces/expansions-enabled';
import { CurrentStep } from '@/game/enumerations/current-step';
import { ILogEntry } from '@/game/interfaces/log-entry';

export function createMockGame(playerCount: number, overrides?: Partial<IGame>): IGame {
  const options: IGameOptions = {
    curses: true,
    expansions: { prosperity: false, renaissance: false, risingSun: false } as IExpansionsEnabled,
    mats: {
      coffersVillagers: false,
      debt: false,
      favors: false,
    } as IMatsEnabled,
  };
  const supply = calculateInitialSupply(playerCount, options);
  const game: IGame = {
    players: Array(playerCount)
      .fill(null)
      .map((value, index) => createMockPlayer(undefined, index)),
    supply,
    options,
    risingSun: {
      prophecy: {
        suns: NOT_PRESENT,
      },
      greatLeaderProphecy: false,
    },
    currentTurn: 1,
    currentPlayerIndex: 0,
    firstPlayerIndex: 0,
    selectedPlayerIndex: 0,
    log: [
      {
        id: faker.string.uuid(),
        timestamp: new Date(),
        playerIndex: 0,
        currentPlayerIndex: 0,
        turn: 1,
        action: GameLogAction.START_GAME,
      },
    ],
    currentStep: CurrentStep.GameScreen,
    setsRequired: 1,
    ...overrides,
  };
  return distributeInitialSupply(game);
}

export function createMockPlayer(victory?: Partial<IPlayer['victory']>, index?: number): IPlayer {
  return {
    name: faker.person.firstName(),
    color:
      DefaultPlayerColors[
        index ?? faker.number.int({ min: 0, max: DefaultPlayerColors.length - 1 })
      ],
    mats: { ...EmptyMatDetails },
    turn: { ...DefaultTurnDetails },
    newTurn: { ...DefaultTurnDetails },
    victory: {
      ...EmptyVictoryDetails,
      ...victory,
    },
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
    linkedActionId: faker.string.uuid(),
    prevPlayerIndex: faker.number.int({ min: 0, max: 3 }),
    ...log,
  };
}
