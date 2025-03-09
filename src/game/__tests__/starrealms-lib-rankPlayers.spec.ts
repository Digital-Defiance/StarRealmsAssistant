import { rankPlayers, newPlayer } from '@/game/starrealms-lib';
import { RankedPlayer } from '@/game/interfaces/ranked-player';
import { IPlayer } from '@/game/interfaces/player';
import { DefaultPlayerColors } from '../constants';

describe('rankPlayers', () => {
  it('should rank players correctly with no ties', () => {
    const players: IPlayer[] = [
      newPlayer('Alice', false, DefaultPlayerColors[0]),
      newPlayer('Bob', false, DefaultPlayerColors[1]),
      newPlayer('Charlie', false, DefaultPlayerColors[2]),
    ];
    players[0].authority.authority = 10;
    players[1].authority.authority = 15;
    players[2].authority.authority = 5;

    const expected: RankedPlayer[] = [
      { index: 1, score: 15, rank: 1 },
      { index: 0, score: 10, rank: 2 },
      { index: 2, score: 5, rank: 3 },
    ];

    expect(rankPlayers(players)).toEqual(expected);
  });

  it('should rank players correctly with ties', () => {
    const players: IPlayer[] = [
      newPlayer('Alice', false, DefaultPlayerColors[0]),
      newPlayer('Bob', false, DefaultPlayerColors[1]),
      newPlayer('Charlie', false, DefaultPlayerColors[2]),
      newPlayer('David', false, DefaultPlayerColors[3]),
    ];

    players[0].authority.authority = 10;
    players[1].authority.authority = 15;
    players[2].authority.authority = 10;
    players[3].authority.authority = 5;

    const expected: RankedPlayer[] = [
      { index: 1, score: 15, rank: 1 },
      { index: 0, score: 10, rank: 2 },
      { index: 2, score: 10, rank: 2 },
      { index: 3, score: 5, rank: 4 },
    ];

    expect(rankPlayers(players)).toEqual(expected);
  });

  it('should rank players correctly with ties and name sorting', () => {
    const players: IPlayer[] = [
      newPlayer('Alice', false, DefaultPlayerColors[0]),
      newPlayer('Bob', false, DefaultPlayerColors[1]),
      newPlayer('Charlie', false, DefaultPlayerColors[2]),
      newPlayer('David', false, DefaultPlayerColors[3]),
    ];

    players[0].authority.authority = 10;
    players[1].authority.authority = 10;
    players[2].authority.authority = 10;
    players[3].authority.authority = 5;

    const expected: RankedPlayer[] = [
      { index: 0, score: 10, rank: 1 },
      { index: 1, score: 10, rank: 1 },
      { index: 2, score: 10, rank: 1 },
      { index: 3, score: 5, rank: 4 },
    ];

    expect(rankPlayers(players)).toEqual(expected);
  });

  it('should handle an empty list of players', () => {
    const players: IPlayer[] = [];

    const expected: RankedPlayer[] = [];

    expect(rankPlayers(players)).toEqual(expected);
  });

  it('should handle a single player', () => {
    const players: IPlayer[] = [newPlayer('Alice', false, DefaultPlayerColors[0])];
    players[0].authority.authority = 10;

    const expected: RankedPlayer[] = [{ index: 0, score: 10, rank: 1 }];

    expect(rankPlayers(players)).toEqual(expected);
  });
});
