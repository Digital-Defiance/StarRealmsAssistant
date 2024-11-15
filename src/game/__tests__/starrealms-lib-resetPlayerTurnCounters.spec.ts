import { resetPlayerTurnCounters } from '../starrealms-lib';
import { IPlayer } from '@/game/interfaces/player';
import { DEFAULT_STARTING_AUTHORITY, EmptyAuthorityDetails } from '@/game/constants';
import { createMockGame, createMockPlayer } from '@/__fixtures__/starrealms-lib-fixtures';

describe('resetPlayerTurnCounters', () => {
  it('should reset turn counters for all players', () => {
    const initialGame = createMockGame(2, {
      players: [
        createMockPlayer(0, {
          name: 'Player 1',
          turn: { trade: 0, combat: 0, cards: 5, gains: 0, discard: 0, scrap: 0 },
          newTurn: { trade: 1, combat: 1, cards: 5, gains: 0, discard: 0, scrap: 0 },
        }),
        createMockPlayer(0, {
          name: 'Player 2',
          turn: { trade: 2, combat: 1, cards: 5, gains: 0, discard: 0, scrap: 0 },
          newTurn: { trade: 1, combat: 1, cards: 5, gains: 0, discard: 0, scrap: 0 },
        }),
      ],
    });

    const updatedGame = resetPlayerTurnCounters(initialGame);

    expect(updatedGame.players[0].turn).toEqual({
      trade: 1,
      combat: 1,
      cards: 5,
      gains: 0,
      discard: 0,
      scrap: 0,
    });
    expect(updatedGame.players[1].turn).toEqual({
      trade: 1,
      combat: 1,
      cards: 5,
      gains: 0,
      discard: 0,
      scrap: 0,
    });
  });

  it('should handle an empty player array', () => {
    const initialGame = createMockGame(2, { players: [] });

    const updatedGame = resetPlayerTurnCounters(initialGame);

    expect(updatedGame.players).toEqual([]);
  });

  it('should not modify other player properties', () => {
    const initialGame = createMockGame(2, {
      players: [
        createMockPlayer(0, {
          name: 'Player 1',
          turn: { trade: 0, combat: 0, cards: 5, gains: 0, discard: 0, scrap: 0 },
          newTurn: { trade: 1, combat: 1, cards: 5, gains: 0, discard: 0, scrap: 0 },
          authority: { ...EmptyAuthorityDetails(), authority: 7 },
        }),
        createMockPlayer(1),
      ],
    });

    const updatedGame = resetPlayerTurnCounters(initialGame);

    expect(updatedGame.players[0].name).toBe('Player 1');
    expect(updatedGame.players[0].authority).toEqual({
      ...EmptyAuthorityDetails(),
      authority: DEFAULT_STARTING_AUTHORITY,
    });
  });

  it('should handle players with missing turn or newTurn properties', () => {
    const incompletePlayer: Partial<IPlayer> = {
      name: 'Incomplete Player',
      authority: EmptyAuthorityDetails(),
    };

    const initialGame = createMockGame(2, { players: [incompletePlayer as IPlayer] });

    const updatedGame = resetPlayerTurnCounters(initialGame);

    expect(updatedGame.players[0].turn).toEqual({
      trade: 0,
      combat: 0,
      cards: 5,
      gains: 0,
      discard: 0,
      scrap: 0,
    });
  });

  it('should not modify the original game object', () => {
    const initialGame = createMockGame(2, {
      players: [
        createMockPlayer(0, {
          name: 'Player 1',
          turn: { trade: 0, combat: 0, cards: 5, gains: 0, discard: 0, scrap: 0 },
          newTurn: { trade: 1, combat: 1, cards: 5, gains: 0, discard: 0, scrap: 0 },
        }),
        createMockPlayer(1),
      ],
    });

    const updatedGame = resetPlayerTurnCounters(initialGame);

    expect(updatedGame).not.toBe(initialGame);
    expect(updatedGame.players).not.toBe(initialGame.players);
    expect(updatedGame.players[0]).not.toBe(initialGame.players[0]);
    expect(updatedGame.players[0].turn).not.toBe(initialGame.players[0].turn);
    expect(initialGame.players[0].turn).toEqual({
      trade: 0,
      combat: 0,
      cards: 5,
      gains: 0,
      discard: 0,
      scrap: 0,
    });
  });
});
