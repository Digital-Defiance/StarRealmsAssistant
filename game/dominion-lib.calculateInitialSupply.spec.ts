import { IGameOptions } from '@/game/interfaces/game-options';
import { calculateInitialSupply } from '@/game/dominion-lib';
import { MinPlayersError } from '@/game/errors/min-players';
import { MaxPlayersError } from '@/game/errors/max-players';
import { NOT_PRESENT } from '@/game/constants';

describe('calculateInitialSupply', () => {
  const defaultOptions: IGameOptions = {
    curses: true,
    expansions: { prosperity: false, renaissance: false, risingSun: false },
    mats: { coffersVillagers: false, debt: false, favors: false },
  };

  it('should throw MinPlayersError when players are less than minimum', () => {
    expect(() => calculateInitialSupply(1, defaultOptions)).toThrow(MinPlayersError);
  });

  it('should throw MaxPlayersError when players are more than maximum', () => {
    expect(() => calculateInitialSupply(7, defaultOptions)).toThrow(MaxPlayersError);
  });

  it('should return correct supply for 2 players without Prosperity', () => {
    const supply = calculateInitialSupply(2, defaultOptions);
    expect(supply).toEqual({
      estates: 8,
      duchies: 8,
      provinces: 8,
      coppers: 46,
      silvers: 40,
      golds: 30,
      curses: 10,
      colonies: NOT_PRESENT,
      platinums: NOT_PRESENT,
    });
  });

  it('should return correct supply for 4 players without Prosperity', () => {
    const supply = calculateInitialSupply(4, defaultOptions);
    expect(supply).toEqual({
      estates: 12,
      duchies: 12,
      provinces: 12,
      coppers: 32,
      silvers: 40,
      golds: 30,
      curses: 30,
      colonies: NOT_PRESENT,
      platinums: NOT_PRESENT,
    });
  });

  it('should return correct supply for 4 players with Prosperity', () => {
    const prosperityOptions = {
      ...defaultOptions,
      expansions: { ...defaultOptions.expansions, prosperity: true },
    };
    const supply = calculateInitialSupply(4, prosperityOptions);
    expect(supply).toEqual({
      estates: 12,
      duchies: 12,
      provinces: 12,
      coppers: 32,
      silvers: 40,
      golds: 30,
      curses: 30,
      colonies: 12,
      platinums: 12,
    });
  });

  it('should return correct supply when curses are disabled', () => {
    const noCursesOptions = { ...defaultOptions, curses: false };
    const supply = calculateInitialSupply(3, noCursesOptions);
    expect(supply.curses).toBe(-1); // Assuming NOT_PRESENT is -1
  });
});
