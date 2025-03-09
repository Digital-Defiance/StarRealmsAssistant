import {
  SupplyForPlayerCount,
  STARTING_VIPERS,
  STARTING_SCOUTS,
  STARTING_EXPLORERS,
  DefaultTurnDetails,
  EmptyAuthorityDetails,
  NOT_PRESENT,
  DefaultGameOptions,
} from '@/game/constants';
import { getFirstBossTurn, hasBoss } from '../starrealms-lib';
import { IPlayer } from '../interfaces/player';
import { IGame } from '../interfaces/game';
import { createMockGame, createMockPlayer } from '@/__fixtures__/starrealms-lib-fixtures';

describe('SupplyForPlayerCount', () => {
  test('should return correct supply for 2 players', () => {
    const supply = SupplyForPlayerCount(2);
    expect(supply.supply.explorers).toBe(STARTING_EXPLORERS);
    expect(supply.supply.scouts).toBe(STARTING_SCOUTS);
    expect(supply.supply.vipers).toBe(STARTING_VIPERS);
  });

  test('should return correct supply for 3 players', () => {
    const supply = SupplyForPlayerCount(3);
    expect(supply.supply.explorers).toBe(STARTING_EXPLORERS * 2);
    expect(supply.supply.scouts).toBe(STARTING_SCOUTS * 2);
    expect(supply.supply.vipers).toBe(STARTING_VIPERS * 2);
  });

  test('should return correct supply for 4 players', () => {
    const supply = SupplyForPlayerCount(4);
    expect(supply.supply.explorers).toBe(STARTING_EXPLORERS * 2);
    expect(supply.supply.scouts).toBe(STARTING_SCOUTS * 2);
    expect(supply.supply.vipers).toBe(STARTING_VIPERS * 2);
  });

  test('should return correct supply for 5 players', () => {
    const supply = SupplyForPlayerCount(5);
    expect(supply.supply.explorers).toBe(STARTING_EXPLORERS * 3);
    expect(supply.supply.scouts).toBe(STARTING_SCOUTS * 3);
    expect(supply.supply.vipers).toBe(STARTING_VIPERS * 3);
  });

  test('should return correct supply for 6 players', () => {
    const supply = SupplyForPlayerCount(6);
    expect(supply.supply.explorers).toBe(STARTING_EXPLORERS * 3);
    expect(supply.supply.scouts).toBe(STARTING_SCOUTS * 3);
    expect(supply.supply.vipers).toBe(STARTING_VIPERS * 3);
  });

  test('should throw an error for invalid player count', () => {
    expect(() => SupplyForPlayerCount(1)).toThrow(`Invalid player count: 1`);
    expect(() => SupplyForPlayerCount(7)).toThrow(`Invalid player count: 7`);
  });
});

describe('hasBoss', () => {
  it('should return false when there are no players', () => {
    expect(hasBoss([])).toBe(false);
  });

  it('should return false when there are no boss players', () => {
    const players: IPlayer[] = [
      createMockPlayer(0, { name: 'Player 1', boss: false }),
      createMockPlayer(1, { name: 'Player 2', boss: false }),
    ];
    expect(hasBoss(players)).toBe(false);
  });

  it('should return true when there is at least one boss player', () => {
    const players: IPlayer[] = [
      createMockPlayer(0, { name: 'Boss', boss: true }),
      createMockPlayer(1, { name: 'Player 1', boss: false }),
    ];
    expect(hasBoss(players)).toBe(true);
  });
});

describe('getFirstBossTurn', () => {
  it('should return NOT_PRESENT when there is no boss', () => {
    const game = createMockGame(2);
    expect(getFirstBossTurn(game)).toBe(NOT_PRESENT);
  });

  it('should return 1 when bossStartTurn is 0', () => {
    const game = createMockGame(
      3,
      { options: { ...DefaultGameOptions(), bossStartTurn: 0 } },
      true
    );
    expect(getFirstBossTurn(game)).toBe(1);
  });

  it('should return 1 when bossStartTurn is undefined', () => {
    const game = createMockGame(3, {}, true);
    expect(getFirstBossTurn(game)).toBe(1);
  });

  it('should correctly calculate first boss turn for different player counts and start turns', () => {
    // 2 human players, boss starts after 1 round
    let game = createMockGame(3, { options: { ...DefaultGameOptions(), bossStartTurn: 1 } }, true);
    expect(getFirstBossTurn(game)).toBe(4); // 3 * 1 + 1 = 4

    // 3 human players, boss starts after 1 round
    game = createMockGame(4, { options: { ...DefaultGameOptions(), bossStartTurn: 1 } }, true);
    expect(getFirstBossTurn(game)).toBe(5); // 4 * 1 + 1 = 5

    // 3 human players, boss starts after 2 rounds
    game = createMockGame(4, { options: { ...DefaultGameOptions(), bossStartTurn: 2 } }, true);
    expect(getFirstBossTurn(game)).toBe(9); // 4 * 2 + 1 = 9

    // 5 human players, boss starts after 3 rounds
    game = createMockGame(6, { options: { ...DefaultGameOptions(), bossStartTurn: 3 } }, true);
    expect(getFirstBossTurn(game)).toBe(19); // 6 * 3 + 1 = 19
  });
});
