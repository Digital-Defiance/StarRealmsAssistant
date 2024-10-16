import { computeStartingSupply } from '@/game/interfaces/set-kingdom/prosperity';
import { MinPlayersError } from '@/game/errors/min-players';

describe('computeStartingSupply for Prosperity set', () => {
  it('should throw MinPlayersError when players are less than minimum', () => {
    expect(() => computeStartingSupply(1)).toThrow(MinPlayersError);
  });

  it('should return correct supply for 2 players', () => {
    const supply = computeStartingSupply(2);
    expect(supply).toEqual({
      colonies: 8,
      platinums: 12,
    });
  });

  it('should return correct supply for 3 players', () => {
    const supply = computeStartingSupply(3);
    expect(supply).toEqual({
      colonies: 12,
      platinums: 12,
    });
  });

  it('should return correct supply for 4 players', () => {
    const supply = computeStartingSupply(4);
    expect(supply).toEqual({
      colonies: 12,
      platinums: 12,
    });
  });

  it('should return correct supply for 5 players', () => {
    const supply = computeStartingSupply(5);
    expect(supply).toEqual({
      colonies: 12,
      platinums: 12,
    });
  });
});
