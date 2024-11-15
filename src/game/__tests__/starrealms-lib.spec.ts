import {
  SupplyForPlayerCount,
  STARTING_VIPERS,
  STARTING_SCOUTS,
  STARTING_EXPLORERS,
} from '@/game/constants';

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
