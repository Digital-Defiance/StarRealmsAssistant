import { resetPlayerTurnCounters } from '../dominion-lib';
import { IGame } from '@/game/interfaces/game';
import { IPlayer } from '@/game/interfaces/player';
import {
  DefaultMatsEnabled,
  DefaultTurnDetails,
  EmptyGameSupply,
  EmptyMatDetails,
  EmptyVictoryDetails,
} from '@/game/constants';

describe('resetPlayerTurnCounters', () => {
  const createMockPlayer = (name: string, turn: any, newTurn: any): IPlayer => ({
    name,
    mats: { ...EmptyMatDetails },
    turn: { ...DefaultTurnDetails, ...turn },
    newTurn: { ...DefaultTurnDetails, ...newTurn },
    victory: {
      ...EmptyVictoryDetails,
    },
  });

  const createMockGame = (players: IPlayer[]): IGame => ({
    currentStep: 1,
    players,
    setsRequired: 1,
    supply: { ...EmptyGameSupply },
    options: {
      curses: true,
      expansions: {
        prosperity: false,
        renaissance: false,
        risingSun: false,
      },
      mats: {
        ...DefaultMatsEnabled,
      },
    },
    currentTurn: 1,
    risingSun: {
      prophecy: { suns: -1 },
      greatLeaderProphecy: false,
    },
    currentPlayerIndex: 0,
    firstPlayerIndex: 0,
    selectedPlayerIndex: 0,
    log: [],
  });

  it('should reset turn counters for all players', () => {
    const initialGame = createMockGame([
      createMockPlayer(
        'Player 1',
        { actions: 0, buys: 0, coins: 0 },
        { actions: 1, buys: 1, coins: 0 }
      ),
      createMockPlayer(
        'Player 2',
        { actions: 2, buys: 1, coins: 3 },
        { actions: 1, buys: 1, coins: 0 }
      ),
    ]);

    const updatedGame = resetPlayerTurnCounters(initialGame);

    expect(updatedGame.players[0].turn).toEqual({ actions: 1, buys: 1, coins: 0 });
    expect(updatedGame.players[1].turn).toEqual({ actions: 1, buys: 1, coins: 0 });
  });

  it('should handle an empty player array', () => {
    const initialGame = createMockGame([]);

    const updatedGame = resetPlayerTurnCounters(initialGame);

    expect(updatedGame.players).toEqual([]);
  });

  it('should not modify other player properties', () => {
    const initialGame = createMockGame([
      createMockPlayer(
        'Player 1',
        { actions: 0, buys: 0, coins: 0 },
        { actions: 1, buys: 1, coins: 0 }
      ),
    ]);
    initialGame.players[0].victory = { ...EmptyVictoryDetails, estates: 3 };

    const updatedGame = resetPlayerTurnCounters(initialGame);

    expect(updatedGame.players[0].name).toBe('Player 1');
    expect(updatedGame.players[0].victory).toEqual({ ...EmptyVictoryDetails, estates: 3 });
  });

  it('should handle players with missing turn or newTurn properties', () => {
    const incompletePlayer: any = {
      name: 'Incomplete Player',
      mats: {},
      victory: {},
    };

    const initialGame = createMockGame([incompletePlayer]);

    const updatedGame = resetPlayerTurnCounters(initialGame);

    expect(updatedGame.players[0].turn).toEqual({});
  });

  it('should handle newTurn with additional properties', () => {
    const initialGame = createMockGame([
      createMockPlayer(
        'Player 1',
        { actions: 0, buys: 0, coins: 0 },
        { actions: 1, buys: 1, coins: 0, extraProp: 'value' }
      ),
    ]);

    const updatedGame = resetPlayerTurnCounters(initialGame);

    expect(updatedGame.players[0].turn).toEqual({
      actions: 1,
      buys: 1,
      coins: 0,
      extraProp: 'value',
    });
  });

  it('should not modify the original game object', () => {
    const initialGame = createMockGame([
      createMockPlayer(
        'Player 1',
        { actions: 0, buys: 0, coins: 0 },
        { actions: 1, buys: 1, coins: 0 }
      ),
    ]);

    const updatedGame = resetPlayerTurnCounters(initialGame);

    expect(updatedGame).not.toBe(initialGame);
    expect(updatedGame.players).not.toBe(initialGame.players);
    expect(updatedGame.players[0]).not.toBe(initialGame.players[0]);
    expect(updatedGame.players[0].turn).not.toBe(initialGame.players[0].turn);
    expect(initialGame.players[0].turn).toEqual({ actions: 0, buys: 0, coins: 0 });
  });
});
