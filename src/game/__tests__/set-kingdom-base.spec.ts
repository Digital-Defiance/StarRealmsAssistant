import { computeStartingSupply } from '@/game/interfaces/set-kingdom/base';
import { MinPlayersError } from '@/game/errors/min-players';
import { MaxPlayersError } from '@/game/errors/max-players';

describe('computeStartingSupply for base set', () => {
  it('should throw MinPlayersError when players are less than minimum', () => {
    expect(() => computeStartingSupply(1, true)).toThrow(MinPlayersError);
  });

  it('should throw MaxPlayersError when players are more than maximum', () => {
    expect(() => computeStartingSupply(7, true)).toThrow(MaxPlayersError);
  });

  it('should return correct supply for 2 players with curses', () => {
    const supply = computeStartingSupply(2, true);
    expect(supply).toEqual({
      estates: 8,
      duchies: 8,
      provinces: 8,
      coppers: 46,
      silvers: 40,
      golds: 30,
      curses: 10,
    });
  });

  it('should return correct supply for 3 players with curses', () => {
    const supply = computeStartingSupply(3, true);
    expect(supply).toEqual({
      estates: 12,
      duchies: 12,
      provinces: 12,
      coppers: 39,
      silvers: 40,
      golds: 30,
      curses: 20,
    });
  });

  it('should return correct supply for 4 players with curses', () => {
    const supply = computeStartingSupply(4, true);
    expect(supply).toEqual({
      estates: 12,
      duchies: 12,
      provinces: 12,
      coppers: 32,
      silvers: 40,
      golds: 30,
      curses: 30,
    });
  });

  it('should return correct supply for 5 players with curses', () => {
    const supply = computeStartingSupply(5, true);
    expect(supply).toEqual({
      estates: 12,
      duchies: 12,
      provinces: 15,
      coppers: 25,
      silvers: 40,
      golds: 30,
      curses: 40,
    });
  });

  it('should return correct supply when curses are disabled', () => {
    const supply = computeStartingSupply(3, false);
    expect(supply.curses).toBe(-1); // Assuming NOT_PRESENT is -1
  });
});
