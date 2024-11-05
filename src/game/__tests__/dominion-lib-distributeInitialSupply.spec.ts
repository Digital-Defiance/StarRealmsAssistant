import { calculateInitialSupply, distributeInitialSupply } from '@/game/dominion-lib';
import { IGame } from '@/game/interfaces/game';
import { IPlayer } from '@/game/interfaces/player';
import {
  DefaultGameOptions,
  DefaultRenaissanceFeatures,
  DefaultRisingSunFeatures,
  HAND_STARTING_COPPERS,
  HAND_STARTING_ESTATES,
  TwoPlayerSupply,
  VERSION_NUMBER,
} from '@/game/constants';
import { CurrentStep } from '@/game/enumerations/current-step';
import { MinPlayersError } from '@/game/errors/min-players';
import { createMockGame, createMockPlayer } from '@/__fixtures__/dominion-lib-fixtures';

describe('distributeInitialSupply', () => {
  it('should return the original supply when there are no players', () => {
    const game = createMockGame(2, { players: [], supply: TwoPlayerSupply(false).supply });
    const updatedGame = distributeInitialSupply(game);

    expect(updatedGame.supply).toStrictEqual(game.supply);
  });

  it('should distribute initial supply correctly for 2 players', () => {
    const initialSupply = calculateInitialSupply(2, DefaultGameOptions());
    const mockGame: IGame = {
      players: [createMockPlayer(), createMockPlayer()] as IPlayer[],
      supply: initialSupply,
      options: DefaultGameOptions(),
      expansions: {
        renaissance: DefaultRenaissanceFeatures(),
        risingSun: DefaultRisingSunFeatures(),
      },
      currentTurn: 1,
      currentPlayerIndex: 0,
      firstPlayerIndex: 0,
      selectedPlayerIndex: 0,
      log: [],
      timeCache: [],
      turnStatisticsCache: [],
      currentStep: CurrentStep.Game,
      setsRequired: 1,
      gameVersion: VERSION_NUMBER,
      pendingGroupedActions: [],
    };

    const updatedGame = distributeInitialSupply(mockGame);

    updatedGame.players.forEach((player) => {
      expect(player.victory.estates).toBe(HAND_STARTING_ESTATES);
    });
    expect(updatedGame.supply.coppers).toBe(initialSupply.coppers - 2 * HAND_STARTING_COPPERS);
  });

  it('should throw MinPlayersError when calculating initial supply for less than 2 players', () => {
    expect(() => calculateInitialSupply(1, DefaultGameOptions())).toThrow(MinPlayersError);
  });

  it('should distribute the correct number of estates to each player', () => {
    const game = createMockGame(3);
    const updatedGame = distributeInitialSupply(game);

    updatedGame.players.forEach((player) => {
      expect(player.victory.estates).toBe(HAND_STARTING_ESTATES);
    });
  });

  it('should reduce the copper supply by the correct amount', () => {
    const game = createMockGame(3);
    const initialCopperSupply = game.supply.coppers;
    const updatedGame = distributeInitialSupply(game);

    expect(updatedGame.supply.coppers).toBe(initialCopperSupply - 3 * HAND_STARTING_COPPERS);
  });

  it('should work correctly with different numbers of players', () => {
    [2, 3, 4, 5, 6].forEach((playerCount) => {
      const game = createMockGame(playerCount);
      const initialCopperSupply = game.supply.coppers;
      const updatedGame = distributeInitialSupply(game);

      expect(updatedGame.supply.coppers).toBe(
        initialCopperSupply - playerCount * HAND_STARTING_COPPERS
      );
      updatedGame.players.forEach((player) => {
        expect(player.victory.estates).toBe(HAND_STARTING_ESTATES);
      });
    });
  });

  it('should not modify other victory card counts', () => {
    const game = createMockGame(3);
    const initialSupply = { ...game.supply };
    const updatedGame = distributeInitialSupply(game);

    expect(updatedGame.supply.duchies).toBe(initialSupply.duchies);
    expect(updatedGame.supply.provinces).toBe(initialSupply.provinces);
    expect(updatedGame.supply.curses).toBe(initialSupply.curses);
  });

  it('should not modify other supply counts', () => {
    const game = createMockGame(3);
    const initialSupply = { ...game.supply };
    const updatedGame = distributeInitialSupply(game);

    expect(updatedGame.supply.silvers).toBe(initialSupply.silvers);
    expect(updatedGame.supply.golds).toBe(initialSupply.golds);
  });
});
