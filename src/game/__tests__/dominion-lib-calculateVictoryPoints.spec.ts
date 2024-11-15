import { calculateVictoryPoints } from '@/game/dominion-lib';
import {
  ESTATE_VP,
  DUCHY_VP,
  PROVINCE_VP,
  COLONY_VP,
  CURSE_VP,
  EmptyVictoryDetails,
} from '@/game/constants';
import { createMockPlayer } from '@/__fixtures__/dominion-lib-fixtures';
import { IAuthorityDetails } from '../interfaces/authority-details';
import { faker } from '@faker-js/faker';

describe('calculateVictoryPoints', () => {
  it('should calculate points correctly with only estates', () => {
    const player = createMockPlayer(undefined, {
      authority: { ...EmptyVictoryDetails(), estates: 3 },
    });
    expect(calculateVictoryPoints(player)).toBe(3 * ESTATE_VP);
  });

  it('should calculate points correctly with only duchies', () => {
    const player = createMockPlayer(undefined, {
      authority: { ...EmptyVictoryDetails(), duchies: 2 },
    });
    expect(calculateVictoryPoints(player)).toBe(2 * DUCHY_VP);
  });

  it('should calculate points correctly with only provinces', () => {
    const player = createMockPlayer(undefined, {
      authority: { ...EmptyVictoryDetails(), provinces: 4 },
    });
    expect(calculateVictoryPoints(player)).toBe(4 * PROVINCE_VP);
  });

  it('should calculate points correctly with only colonies', () => {
    const player = createMockPlayer(undefined, {
      authority: { ...EmptyVictoryDetails(), colonies: 2 },
    });
    expect(calculateVictoryPoints(player)).toBe(2 * COLONY_VP);
  });

  it('should calculate points correctly with only tokens', () => {
    const player = createMockPlayer(undefined, {
      authority: { ...EmptyVictoryDetails(), tokens: 5 },
    });
    expect(calculateVictoryPoints(player)).toBe(5);
  });

  it('should calculate points correctly with only other points', () => {
    const player = createMockPlayer(undefined, {
      authority: { ...EmptyVictoryDetails(), other: 3 },
    });
    expect(calculateVictoryPoints(player)).toBe(3);
  });

  it('should calculate points correctly with only curses', () => {
    const player = createMockPlayer(undefined, {
      authority: { ...EmptyVictoryDetails(), curses: 2 },
    });
    expect(calculateVictoryPoints(player)).toBe(2 * CURSE_VP);
  });

  it('should calculate points correctly with a mix of victory cards', () => {
    const ESTATE_COUNT = faker.number.int({ min: 1, max: 5 }) as number;
    const DUCHY_COUNT = faker.number.int({ min: 1, max: 5 }) as number;
    const PROVINCE_COUNT = faker.number.int({ min: 1, max: 5 }) as number;
    const COLONY_COUNT = faker.number.int({ min: 1, max: 5 }) as number;
    const TOKEN_COUNT = faker.number.int({ min: 1, max: 5 }) as number;
    const OTHER_COUNT = faker.number.int({ min: 1, max: 5 }) as number;
    const CURSE_COUNT = faker.number.int({ min: 1, max: 5 }) as number;
    const player = createMockPlayer(undefined, {
      authority: {
        ...EmptyVictoryDetails(),
        estates: ESTATE_COUNT,
        duchies: DUCHY_COUNT,
        provinces: PROVINCE_COUNT,
        colonies: COLONY_COUNT,
        tokens: TOKEN_COUNT,
        other: OTHER_COUNT,
        curses: CURSE_COUNT,
      },
    });
    const expectedPoints =
      ESTATE_COUNT * ESTATE_VP +
      DUCHY_COUNT * DUCHY_VP +
      PROVINCE_COUNT * PROVINCE_VP +
      COLONY_COUNT * COLONY_VP +
      TOKEN_COUNT +
      OTHER_COUNT +
      CURSE_COUNT * CURSE_VP;
    expect(calculateVictoryPoints(player)).toBe(expectedPoints);
  });

  it('should return 0 for a player with no victory points', () => {
    const player = createMockPlayer(undefined, { authority: {} as IAuthorityDetails });
    expect(calculateVictoryPoints(player)).toBe(0);
  });

  it('should handle undefined values correctly', () => {
    const player = createMockPlayer(undefined, {
      authority: {
        ...EmptyVictoryDetails(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        estates: undefined as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        duchies: undefined as any,
      } as IAuthorityDetails,
    });
    expect(calculateVictoryPoints(player)).toBe(0);
  });
});
