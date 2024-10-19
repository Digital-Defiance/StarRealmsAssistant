import { faker } from '@faker-js/faker';
import { IPlayer } from '@/game/interfaces/player';
import {
  NOT_PRESENT,
  NO_PLAYER,
  EmptyVictoryDetails,
  EmptyMatDetails,
  DefaultTurnDetails,
} from '@/game/constants';
import { calculateInitialSupply } from '@/game/dominion-lib';
import { GameLogActionWithCount } from '@/game/enumerations/game-log-action-with-count';
import { IGameOptions } from '@/game/interfaces/game-options';
import { IGame } from '@/game/interfaces/game';
import { IMatsEnabled } from '@/game/interfaces/mats-enabled';
import { IExpansionsEnabled } from '@/game/interfaces/expansions-enabled';
import { CurrentStep } from '@/game/enumerations/current-step';

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
  return {
    players: Array(playerCount)
      .fill(null)
      .map(() => createMockPlayer()),
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
        playerIndex: NO_PLAYER,
        action: GameLogActionWithCount.START_GAME,
      },
    ],
    currentStep: CurrentStep.GameScreen,
    setsRequired: 1,
    ...overrides,
  };
}

export function createMockPlayer(victory?: Partial<IPlayer['victory']>): IPlayer {
  return {
    name: faker.person.firstName(),
    mats: { ...EmptyMatDetails },
    turn: { ...DefaultTurnDetails },
    newTurn: { ...DefaultTurnDetails },
    victory: {
      ...EmptyVictoryDetails,
      ...victory,
    },
  } as IPlayer;
}
