import { calculateInitialSupply, distributeInitialSupply } from '@/game/starrealms-lib';
import { IGame } from '@/game/interfaces/game';
import { IPlayer } from '@/game/interfaces/player';
import {
  DEFAULT_STARTING_AUTHORITY,
  DefaultGameOptions,
  SupplyForPlayerCount,
  VERSION_NUMBER,
} from '@/game/constants';
import { CurrentStep } from '@/game/enumerations/current-step';
import { MinPlayersError } from '@/game/errors/min-players';
import { createMockGame, createMockPlayer } from '@/__fixtures__/starrealms-lib-fixtures';

describe('distributeInitialSupply', () => {
  it('should return the original supply when there are no players', () => {
    const game = createMockGame(2, { players: [], supply: SupplyForPlayerCount(2).supply });
    const updatedGame = distributeInitialSupply(game);

    expect(updatedGame.supply).toStrictEqual(game.supply);
  });

  it('should distribute initial supply correctly for 2 players', () => {
    const initialSupply = calculateInitialSupply(2);
    const mockGame: IGame = {
      players: [createMockPlayer(), createMockPlayer()] as IPlayer[],
      supply: initialSupply,
      options: DefaultGameOptions(),
      currentTurn: 1,
      currentPlayerIndex: 0,
      selectedPlayerIndex: 0,
      log: [],
      turnStatisticsCache: [],
      currentStep: CurrentStep.Game,
      setsRequired: 1,
      gameVersion: VERSION_NUMBER,
    };

    const updatedGame = distributeInitialSupply(mockGame);

    updatedGame.players.forEach((player) => {
      expect(player.authority.authority).toBe(DEFAULT_STARTING_AUTHORITY);
    });
  });

  it('should throw MinPlayersError when calculating initial supply for less than 2 players', () => {
    expect(() => calculateInitialSupply(1)).toThrow(MinPlayersError);
  });

  it('should work correctly with different numbers of players', () => {
    [2, 3, 4, 5, 6].forEach((playerCount) => {
      const game = createMockGame(playerCount);
      const initialExplorerSupply = game.supply.explorers;
      const updatedGame = distributeInitialSupply(game);

      expect(updatedGame.supply.explorers).toEqual(initialExplorerSupply);
      updatedGame.players.forEach((player, index) => {
        expect(player.authority.authority).toEqual(
          updatedGame.options.startingAuthorityByPlayerIndex[index]
        );
      });
    });
  });
});
