import { rankPlayers, newPlayer } from '@/game/dominion-lib';
import { RankedPlayer } from '@/game/interfaces/ranked-player';
import { IPlayer } from '@/game/interfaces/player';

describe('rankPlayers', () => {
  it('should rank players correctly with no ties', () => {
    const players: IPlayer[] = [
      newPlayer('Alice', 0),
      newPlayer('Bob', 1),
      newPlayer('Charlie', 2),
    ];

    const calculateVictoryPoints = jest.fn().mockImplementation((player) => {
      switch (player.name) {
        case 'Alice':
          return 10;
        case 'Bob':
          return 15;
        case 'Charlie':
          return 5;
        default:
          return 0;
      }
    });

    const expected: RankedPlayer[] = [
      { index: 1, score: 15, rank: 1 },
      { index: 0, score: 10, rank: 2 },
      { index: 2, score: 5, rank: 3 },
    ];

    expect(rankPlayers(players, calculateVictoryPoints)).toEqual(expected);
  });

  it('should rank players correctly with ties', () => {
    const players: IPlayer[] = [
      newPlayer('Alice', 0),
      newPlayer('Bob', 1),
      newPlayer('Charlie', 2),
      newPlayer('David', 3),
    ];

    const calculateVictoryPoints = jest.fn().mockImplementation((player) => {
      switch (player.name) {
        case 'Alice':
          return 10;
        case 'Bob':
          return 15;
        case 'Charlie':
          return 10;
        case 'David':
          return 5;
        default:
          return 0;
      }
    });

    const expected: RankedPlayer[] = [
      { index: 1, score: 15, rank: 1 },
      { index: 0, score: 10, rank: 2 },
      { index: 2, score: 10, rank: 2 },
      { index: 3, score: 5, rank: 4 },
    ];

    expect(rankPlayers(players, calculateVictoryPoints)).toEqual(expected);
  });

  it('should rank players correctly with ties and name sorting', () => {
    const players: IPlayer[] = [
      newPlayer('Alice', 0),
      newPlayer('Bob', 1),
      newPlayer('Charlie', 2),
      newPlayer('David', 3),
    ];

    const calculateVictoryPoints = jest.fn().mockImplementation((player) => {
      switch (player.name) {
        case 'Alice':
          return 10;
        case 'Bob':
          return 10;
        case 'Charlie':
          return 10;
        case 'David':
          return 5;
        default:
          return 0;
      }
    });

    const expected: RankedPlayer[] = [
      { index: 0, score: 10, rank: 1 },
      { index: 1, score: 10, rank: 1 },
      { index: 2, score: 10, rank: 1 },
      { index: 3, score: 5, rank: 4 },
    ];

    expect(rankPlayers(players, calculateVictoryPoints)).toEqual(expected);
  });

  it('should handle an empty list of players', () => {
    const players: IPlayer[] = [];

    const expected: RankedPlayer[] = [];

    const calculateVictoryPoints = jest.fn();

    expect(rankPlayers(players, calculateVictoryPoints)).toEqual(expected);
  });

  it('should handle a single player', () => {
    const players: IPlayer[] = [newPlayer('Alice', 0)];

    const calculateVictoryPoints = jest.fn().mockReturnValue(10);

    const expected: RankedPlayer[] = [{ index: 0, score: 10, rank: 1 }];

    expect(rankPlayers(players, calculateVictoryPoints)).toEqual(expected);
  });
});
