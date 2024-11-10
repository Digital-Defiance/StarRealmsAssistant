import { IGameOptions } from '@/game/interfaces/game-options';
import { calculateInitialSupply } from '@/game/dominion-lib';
import { MinPlayersError } from '@/game/errors/min-players';
import { MaxPlayersError } from '@/game/errors/max-players';
import {
  FivePlayerSupply,
  FourPlayerSupply,
  SixPlayerSupply,
  ThreePlayerSupply,
  TwoPlayerSupply,
} from '@/game/constants';

describe('calculateInitialSupply', () => {
  const defaultOptions = (): IGameOptions => ({
    curses: true,
    expansions: { prosperity: false, renaissance: false, risingSun: false },
    mats: { coffersVillagers: false, debt: false, favors: false },
    trackCardCounts: true,
    trackCardGains: true,
    trackDiscard: true,
  });

  const prosperityOptions = (): IGameOptions => ({
    ...defaultOptions(),
    expansions: { ...defaultOptions().expansions, prosperity: true },
  });

  it('should throw MinPlayersError when players are less than minimum', () => {
    expect(() => calculateInitialSupply(1, defaultOptions())).toThrow(MinPlayersError);
  });

  it('should throw MaxPlayersError when players are more than maximum', () => {
    expect(() => calculateInitialSupply(7, defaultOptions())).toThrow(MaxPlayersError);
  });

  it('should return correct supply for 2 players without Prosperity', () => {
    const supply = calculateInitialSupply(2, defaultOptions());
    expect(supply).toEqual(TwoPlayerSupply(false).supply);
  });

  it('should return correct supply for 2 players with Prosperity', () => {
    const supply = calculateInitialSupply(2, prosperityOptions());
    expect(supply).toEqual(TwoPlayerSupply(true).supply);
  });

  it('should return correct supply for 3 players without Prosperity', () => {
    const supply = calculateInitialSupply(3, defaultOptions());
    expect(supply).toEqual(ThreePlayerSupply(false).supply);
  });

  it('should return correct supply for 3 players with Prosperity', () => {
    const supply = calculateInitialSupply(3, prosperityOptions());
    expect(supply).toEqual(ThreePlayerSupply(true).supply);
  });

  it('should return correct supply for 4 players without Prosperity', () => {
    const supply = calculateInitialSupply(4, defaultOptions());
    expect(supply).toEqual(FourPlayerSupply(false).supply);
  });

  it('should return correct supply for 4 players with Prosperity', () => {
    const supply = calculateInitialSupply(4, prosperityOptions());
    expect(supply).toEqual(FourPlayerSupply(true).supply);
  });

  it('should return correct supply for 5 players without Prosperity', () => {
    const supply = calculateInitialSupply(5, defaultOptions());
    expect(supply).toEqual(FivePlayerSupply(false).supply);
  });

  it('should return correct supply for 5 players with Prosperity', () => {
    const supply = calculateInitialSupply(5, prosperityOptions());
    expect(supply).toEqual(FivePlayerSupply(true).supply);
  });

  it('should return correct supply for 6 players without Prosperity', () => {
    const supply = calculateInitialSupply(6, defaultOptions());
    expect(supply).toEqual(SixPlayerSupply(false).supply);
  });

  it('should return correct supply for 6 players with Prosperity', () => {
    const supply = calculateInitialSupply(6, prosperityOptions());
    expect(supply).toEqual(SixPlayerSupply(true).supply);
  });

  it('should return correct supply when curses are disabled', () => {
    const noCursesOptions = { ...defaultOptions(), curses: false };
    const supply = calculateInitialSupply(3, noCursesOptions);
    expect(supply.curses).toBe(-1); // Assuming NOT_PRESENT is -1
  });
});
