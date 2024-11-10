import { resetPlayerTurnCounters } from '../dominion-lib';
import { IPlayer } from '@/game/interfaces/player';
import { EmptyMatDetails, EmptyVictoryDetails } from '@/game/constants';
import { createMockGame, createMockPlayer } from '@/__fixtures__/dominion-lib-fixtures';

describe('resetPlayerTurnCounters', () => {
  it('should reset turn counters for all players', () => {
    const initialGame = createMockGame(2, {
      players: [
        createMockPlayer(0, {
          name: 'Player 1',
          turn: { actions: 0, buys: 0, coins: 0, cards: 5, gains: 0, discard: 0 },
          newTurn: { actions: 1, buys: 1, coins: 0, cards: 5, gains: 0, discard: 0 },
        }),
        createMockPlayer(0, {
          name: 'Player 2',
          turn: { actions: 2, buys: 1, coins: 3, cards: 5, gains: 0, discard: 0 },
          newTurn: { actions: 1, buys: 1, coins: 0, cards: 5, gains: 0, discard: 0 },
        }),
      ],
    });

    const updatedGame = resetPlayerTurnCounters(initialGame);

    expect(updatedGame.players[0].turn).toEqual({
      actions: 1,
      buys: 1,
      coins: 0,
      cards: 5,
      gains: 0,
      discard: 0,
    });
    expect(updatedGame.players[1].turn).toEqual({
      actions: 1,
      buys: 1,
      coins: 0,
      cards: 5,
      gains: 0,
      discard: 0,
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
          turn: { actions: 0, buys: 0, coins: 0, cards: 5, gains: 0, discard: 0 },
          newTurn: { actions: 1, buys: 1, coins: 0, cards: 5, gains: 0, discard: 0 },
          victory: { ...EmptyVictoryDetails(), estates: 3 },
        }),
        createMockPlayer(1),
      ],
    });

    const updatedGame = resetPlayerTurnCounters(initialGame);

    expect(updatedGame.players[0].name).toBe('Player 1');
    expect(updatedGame.players[0].victory).toEqual({ ...EmptyVictoryDetails(), estates: 3 });
  });

  it('should handle players with missing turn or newTurn properties', () => {
    const incompletePlayer: Partial<IPlayer> = {
      name: 'Incomplete Player',
      mats: EmptyMatDetails(),
      victory: EmptyVictoryDetails(),
    };

    const initialGame = createMockGame(2, { players: [incompletePlayer as IPlayer] });

    const updatedGame = resetPlayerTurnCounters(initialGame);

    expect(updatedGame.players[0].turn).toEqual({
      actions: 1,
      buys: 1,
      coins: 0,
      cards: 5,
      gains: 0,
      discard: 0,
    });
  });

  it('should not modify the original game object', () => {
    const initialGame = createMockGame(2, {
      players: [
        createMockPlayer(0, {
          name: 'Player 1',
          turn: { actions: 0, buys: 0, coins: 0, cards: 5, gains: 0, discard: 0 },
          newTurn: { actions: 1, buys: 1, coins: 0, cards: 5, gains: 0, discard: 0 },
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
      actions: 0,
      buys: 0,
      coins: 0,
      cards: 5,
      gains: 0,
      discard: 0,
    });
  });
});
