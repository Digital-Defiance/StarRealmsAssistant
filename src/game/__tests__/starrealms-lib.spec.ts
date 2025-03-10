import {
  SupplyForPlayerCount,
  STARTING_VIPERS,
  STARTING_SCOUTS,
  STARTING_EXPLORERS,
  NOT_PRESENT,
  DefaultGameOptions,
} from '@/game/constants';
import { getFirstBossTurn, getPlayerLabel, hasBoss, shuffleArray } from '../starrealms-lib';
import { IPlayer } from '../interfaces/player';
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

describe('shuffleArray', () => {
  // Test with primitive types
  describe('with primitive types', () => {
    it('should shuffle an array of numbers', () => {
      const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const result = shuffleArray(numbers);

      expect(result.shuffled).toHaveLength(10);
      expect(result.shuffled).toEqual(expect.arrayContaining(numbers));
      // Original array shouldn't be modified
      expect(numbers).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it('should shuffle an array of strings', () => {
      const strings = ['apple', 'banana', 'cherry', 'date', 'elderberry'];
      const result = shuffleArray(strings);

      expect(result.shuffled).toHaveLength(5);
      expect(result.shuffled).toEqual(expect.arrayContaining(strings));
      // Original array shouldn't be modified
      expect(strings).toEqual(['apple', 'banana', 'cherry', 'date', 'elderberry']);
    });

    it('should handle empty arrays', () => {
      const empty: number[] = [];
      const result = shuffleArray(empty);

      expect(result.shuffled).toEqual([]);
      expect(result.changed).toBe(false);
    });

    it('should handle single-element arrays', () => {
      const single = ['solo'];
      const result = shuffleArray(single);

      expect(result.shuffled).toEqual(['solo']);
      expect(result.changed).toBe(false);
    });
  });

  // Test with complex objects
  describe('with complex objects', () => {
    it('should shuffle an array of objects', () => {
      const objects = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 3, name: 'Charlie' },
        { id: 4, name: 'David' },
        { id: 5, name: 'Eve' },
      ];

      const result = shuffleArray(objects);

      expect(result.shuffled).toHaveLength(5);
      // Check all objects are present (by reference)
      objects.forEach((obj) => {
        expect(result.shuffled).toContain(obj);
      });
    });

    it('should maintain object references', () => {
      const obj1 = { id: 1, data: { value: 'test' } };
      const obj2 = { id: 2, data: { value: 'sample' } };
      const obj3 = { id: 3, data: { value: 'example' } };

      const objects = [obj1, obj2, obj3];
      const result = shuffleArray(objects);

      // Verify references are maintained
      result.shuffled.forEach((obj) => {
        // Modifying the shuffled array's objects should affect the original objects
        if (obj.id === 1) {
          obj.data.value = 'modified';
          expect(obj1.data.value).toBe('modified');
        }
      });
    });
  });

  // Test the 'changed' flag
  describe('changed flag behavior', () => {
    it('should report changed=false for empty arrays', () => {
      expect(shuffleArray([]).changed).toBe(false);
    });

    it('should report changed=false for single-element arrays', () => {
      expect(shuffleArray([42]).changed).toBe(false);
    });

    it('should correctly detect when order has changed', () => {
      // Mock Math.random to ensure a specific shuffle order
      const originalRandom = Math.random;
      try {
        // For Fisher-Yates with array [1, 2], we start with i=1
        // We need j=0 to swap elements 1 and 0
        // So Math.random() needs to return < 0.5 to get Math.floor(Math.random() * 2) = 0
        Math.random = jest.fn().mockReturnValueOnce(0.25); // 0.25 * 2 = 0.5, Math.floor(0.5) = 0

        const result = shuffleArray([1, 2]);
        expect(result.shuffled).toEqual([2, 1]);
        expect(result.changed).toBe(true);
      } finally {
        Math.random = originalRandom;
      }
    });

    it('should correctly detect when order has not changed', () => {
      // Mock Math.random to ensure the same order
      const originalRandom = Math.random;
      try {
        // For Fisher-Yates, to keep [1, 2, 3] unchanged:
        // When i=2, j must be 2, so Math.random() needs to return ≥ 0.67 to get j=2
        // When i=1, j must be 1, so Math.random() needs to return ≥ 0.5 to get j=1
        Math.random = jest
          .fn()
          .mockReturnValueOnce(0.9) // For i=2: 0.9 * 3 = 2.7, Math.floor(2.7) = 2
          .mockReturnValueOnce(0.7); // For i=1: 0.7 * 2 = 1.4, Math.floor(1.4) = 1

        const result = shuffleArray([1, 2, 3]);
        expect(result.changed).toBe(false);
      } finally {
        Math.random = originalRandom;
      }
    });
  });

  // Edge cases
  describe('edge cases', () => {
    it('should handle arrays with duplicate values', () => {
      const duplicates = [1, 1, 2, 2, 3, 3];
      const result = shuffleArray(duplicates);

      expect(result.shuffled).toHaveLength(6);
      expect(result.shuffled.sort()).toEqual([1, 1, 2, 2, 3, 3]);
    });
  });
});

describe('getPlayerLabel', () => {
  // Sample players array for testing
  const testPlayers: IPlayer[] = [
    createMockPlayer(0, { name: 'Alice' }),
    createMockPlayer(1, { name: 'Bob' }),
    createMockPlayer(2, { name: '...Charlie' }),
    createMockPlayer(3, { name: ' Dave' }),
    createMockPlayer(4, { name: '' }),
    createMockPlayer(5, { name: '   ' }),
    createMockPlayer(6, { name: '🎮Player' }),
    createMockPlayer(7, { name: '\u200BErin' }), // Zero-width space followed by Erin
    createMockPlayer(8, { name: null as unknown as string }),
    createMockPlayer(9, { name: undefined }),
    createMockPlayer(10, { name: '…Charlie' }),
  ];

  test('returns first letter of name for normal names', () => {
    expect(getPlayerLabel(testPlayers, 0)).toBe('A');
    expect(getPlayerLabel(testPlayers, 1)).toBe('B');
  });

  test('skips non-printable characters at the beginning of name', () => {
    expect(getPlayerLabel(testPlayers, 2)).toBe('.'); // . is renderable
    expect(getPlayerLabel(testPlayers, 3)).toBe('D'); // Skips space
    expect(getPlayerLabel(testPlayers, 7)).toBe('E'); // Skips zero-width space
    expect(getPlayerLabel(testPlayers, 10)).toBe('C'); // Skips ellipsis
  });

  test('returns player number for names with no printable characters', () => {
    expect(getPlayerLabel(testPlayers, 4)).toBe('5'); // Empty string
    expect(getPlayerLabel(testPlayers, 5)).toBe('6'); // Only spaces
  });

  test('returns player number for invalid player objects', () => {
    expect(getPlayerLabel(testPlayers, 8)).toBe('9'); // name is null
    expect(getPlayerLabel(testPlayers, 9)).toBe('10'); // name is undefined
  });

  test('returns player number for emoji and special character names', () => {
    expect(getPlayerLabel(testPlayers, 6)).toBe('P'); // Skips emoji, returns 'P'
  });

  test('handles edge cases with invalid inputs', () => {
    // Invalid players array
    expect(getPlayerLabel(null as unknown as IPlayer[], 0)).toBe('1');
    expect(getPlayerLabel(undefined as unknown as IPlayer[], 0)).toBe('1');
    expect(getPlayerLabel({} as unknown as IPlayer[], 0)).toBe('1');
    expect(getPlayerLabel('not an array' as unknown as IPlayer[], 0)).toBe('1');

    // Invalid player index
    expect(getPlayerLabel(testPlayers, -1)).toBe('0');
    expect(getPlayerLabel(testPlayers, 999)).toBe('1000');
    expect(getPlayerLabel(testPlayers, null as unknown as number)).toBe('1');
    expect(getPlayerLabel(testPlayers, undefined as unknown as number)).toBe('NaN');
  });

  test('handles special character names', () => {
    const specialCharPlayers: IPlayer[] = [
      createMockPlayer(0, { name: '@User1' }),
      createMockPlayer(1, { name: '#HashTag' }),
      createMockPlayer(2, { name: '$Money' }),
      createMockPlayer(3, { name: '%Percent' }),
    ];

    expect(getPlayerLabel(specialCharPlayers, 0)).toBe('@');
    expect(getPlayerLabel(specialCharPlayers, 1)).toBe('#');
    expect(getPlayerLabel(specialCharPlayers, 2)).toBe('$');
    expect(getPlayerLabel(specialCharPlayers, 3)).toBe('%');
  });
});
