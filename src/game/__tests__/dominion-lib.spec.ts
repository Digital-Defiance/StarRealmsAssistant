import { SupplyForPlayerCount, NOT_PRESENT } from '@/game/constants';

describe('SupplyForPlayerCount', () => {
  test('should return correct supply for 2 players without prosperity', () => {
    const supply = SupplyForPlayerCount(2, false);
    expect(supply.supply.estates).toBe(8);
    expect(supply.supply.duchies).toBe(8);
    expect(supply.supply.provinces).toBe(8);
    expect(supply.supply.coppers).toBe(46);
    expect(supply.supply.silvers).toBe(40);
    expect(supply.supply.golds).toBe(30);
    expect(supply.supply.curses).toBe(10);
    expect(supply.supply.colonies).toBe(NOT_PRESENT);
    expect(supply.supply.platinums).toBe(NOT_PRESENT);
  });

  test('should return correct supply for 2 players with prosperity', () => {
    const supply = SupplyForPlayerCount(2, true);
    expect(supply.supply.estates).toBe(8);
    expect(supply.supply.duchies).toBe(8);
    expect(supply.supply.provinces).toBe(8);
    expect(supply.supply.coppers).toBe(46);
    expect(supply.supply.silvers).toBe(40);
    expect(supply.supply.golds).toBe(30);
    expect(supply.supply.curses).toBe(10);
    expect(supply.supply.colonies).toBe(8);
    expect(supply.supply.platinums).toBe(12);
  });

  test('should return correct supply for 3 players without prosperity', () => {
    const supply = SupplyForPlayerCount(3, false);
    expect(supply.supply.estates).toBe(12);
    expect(supply.supply.duchies).toBe(12);
    expect(supply.supply.provinces).toBe(12);
    expect(supply.supply.coppers).toBe(39);
    expect(supply.supply.silvers).toBe(40);
    expect(supply.supply.golds).toBe(30);
    expect(supply.supply.curses).toBe(20);
    expect(supply.supply.colonies).toBe(NOT_PRESENT);
    expect(supply.supply.platinums).toBe(NOT_PRESENT);
  });

  test('should return correct supply for 4 players with prosperity', () => {
    const supply = SupplyForPlayerCount(4, true);
    expect(supply.supply.estates).toBe(12);
    expect(supply.supply.duchies).toBe(12);
    expect(supply.supply.provinces).toBe(12);
    expect(supply.supply.coppers).toBe(32);
    expect(supply.supply.silvers).toBe(40);
    expect(supply.supply.golds).toBe(30);
    expect(supply.supply.curses).toBe(30);
    expect(supply.supply.colonies).toBe(12);
    expect(supply.supply.platinums).toBe(12);
  });

  test('should return correct supply for 5 players without prosperity', () => {
    const supply = SupplyForPlayerCount(5, false);
    expect(supply.supply.estates).toBe(12);
    expect(supply.supply.duchies).toBe(12);
    expect(supply.supply.provinces).toBe(15);
    expect(supply.supply.coppers).toBe(85);
    expect(supply.supply.silvers).toBe(80);
    expect(supply.supply.golds).toBe(60);
    expect(supply.supply.curses).toBe(40);
    expect(supply.supply.colonies).toBe(NOT_PRESENT);
    expect(supply.supply.platinums).toBe(NOT_PRESENT);
  });

  test('should return correct supply for 6 players with prosperity', () => {
    const supply = SupplyForPlayerCount(6, true);
    expect(supply.supply.estates).toBe(12);
    expect(supply.supply.duchies).toBe(12);
    expect(supply.supply.provinces).toBe(18);
    expect(supply.supply.coppers).toBe(78);
    expect(supply.supply.silvers).toBe(80);
    expect(supply.supply.golds).toBe(60);
    expect(supply.supply.curses).toBe(50);
    expect(supply.supply.colonies).toBe(12);
    expect(supply.supply.platinums).toBe(12);
  });

  test('should throw an error for invalid player count', () => {
    expect(() => SupplyForPlayerCount(1, false)).toThrow(`Invalid player count: 1`);
    expect(() => SupplyForPlayerCount(7, true)).toThrow(`Invalid player count: 7`);
  });
});
