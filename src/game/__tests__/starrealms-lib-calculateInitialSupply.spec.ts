import { calculateInitialSupply } from '@/game/starrealms-lib';
import { MinPlayersError } from '@/game/errors/min-players';
import { MaxPlayersError } from '@/game/errors/max-players';
import { GameSupplyForPlayers } from '@/game/constants';

describe('calculateInitialSupply', () => {
  it('should throw MinPlayersError when players are less than minimum', () => {
    expect(() => calculateInitialSupply(1)).toThrow(MinPlayersError);
  });

  it('should throw MaxPlayersError when players are more than maximum', () => {
    expect(() => calculateInitialSupply(7)).toThrow(MaxPlayersError);
  });

  it('should return correct supply for 2 players', () => {
    const supply = calculateInitialSupply(2);
    expect(supply).toEqual(GameSupplyForPlayers(2).supply);
  });

  it('should return correct supply for 3 players', () => {
    const supply = calculateInitialSupply(3);
    expect(supply).toEqual(GameSupplyForPlayers(3).supply);
  });

  it('should return correct supply for 4 players', () => {
    const supply = calculateInitialSupply(4);
    expect(supply).toEqual(GameSupplyForPlayers(4).supply);
  });

  it('should return correct supply for 5 players', () => {
    const supply = calculateInitialSupply(5);
    expect(supply).toEqual(GameSupplyForPlayers(5).supply);
  });

  it('should return correct supply for 6 players', () => {
    const supply = calculateInitialSupply(6);
    expect(supply).toEqual(GameSupplyForPlayers(6).supply);
  });
});
