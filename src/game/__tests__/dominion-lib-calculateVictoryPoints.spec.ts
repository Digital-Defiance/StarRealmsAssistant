import { calculateVictoryPoints } from '@/game/dominion-lib';
import { ESTATE_VP, DUCHY_VP, PROVINCE_VP, COLONY_VP, CURSE_VP } from '@/game/constants';
import { createMockPlayer } from '@/__fixtures__/dominion-lib-fixtures';

describe('calculateVictoryPoints', () => {
  it('should calculate points correctly with only estates', () => {
    const player = createMockPlayer({ estates: 3 });
    expect(calculateVictoryPoints(player)).toBe(3 * ESTATE_VP);
  });

  it('should calculate points correctly with only duchies', () => {
    const player = createMockPlayer({ duchies: 2 });
    expect(calculateVictoryPoints(player)).toBe(2 * DUCHY_VP);
  });

  it('should calculate points correctly with only provinces', () => {
    const player = createMockPlayer({ provinces: 4 });
    expect(calculateVictoryPoints(player)).toBe(4 * PROVINCE_VP);
  });

  it('should calculate points correctly with only colonies', () => {
    const player = createMockPlayer({ colonies: 2 });
    expect(calculateVictoryPoints(player)).toBe(2 * COLONY_VP);
  });

  it('should calculate points correctly with only tokens', () => {
    const player = createMockPlayer({ tokens: 5 });
    expect(calculateVictoryPoints(player)).toBe(5);
  });

  it('should calculate points correctly with only other points', () => {
    const player = createMockPlayer({ other: 3 });
    expect(calculateVictoryPoints(player)).toBe(3);
  });

  it('should calculate points correctly with only curses', () => {
    const player = createMockPlayer({ curses: 2 });
    expect(calculateVictoryPoints(player)).toBe(2 * CURSE_VP);
  });

  it('should calculate points correctly with a mix of victory cards', () => {
    const player = createMockPlayer({
      estates: 1,
      duchies: 2,
      provinces: 3,
      colonies: 1,
      tokens: 2,
      other: 1,
      curses: 1,
    });
    const expectedPoints =
      1 * ESTATE_VP + 2 * DUCHY_VP + 3 * PROVINCE_VP + 1 * COLONY_VP + 2 + 1 + 1 * CURSE_VP;
    expect(calculateVictoryPoints(player)).toBe(expectedPoints);
  });

  it('should return 0 for a player with no victory points', () => {
    const player = createMockPlayer({});
    expect(calculateVictoryPoints(player)).toBe(0);
  });

  it('should handle undefined values correctly', () => {
    const player = createMockPlayer({ estates: undefined, duchies: undefined });
    expect(calculateVictoryPoints(player)).toBe(0);
  });
});
