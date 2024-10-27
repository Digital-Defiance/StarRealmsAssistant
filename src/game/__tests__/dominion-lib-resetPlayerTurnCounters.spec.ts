import { resetPlayerTurnCounters } from '../dominion-lib';
import { IGame } from '@/game/interfaces/game';
import { IPlayer } from '@/game/interfaces/player';
import {
  DefaultMatsEnabled,
  DefaultPlayerColors,
  DefaultTurnDetails,
  EmptyGameSupply,
  EmptyMatDetails,
  EmptyVictoryDetails,
} from '@/game/constants';
import { IPlayerGameTurnDetails } from '../interfaces/player-game-turn-details';
import { deepClone } from '@/game/utils';

describe('resetPlayerTurnCounters', () => {
  const createMockPlayer = (
    name: string,
    turn: IPlayerGameTurnDetails,
    newTurn: IPlayerGameTurnDetails
  ): IPlayer => ({
    name,
    color: DefaultPlayerColors[0],
    mats: EmptyMatDetails(),
    turn: { ...DefaultTurnDetails(), ...deepClone<IPlayerGameTurnDetails>(turn) },
    newTurn: { ...DefaultTurnDetails(), ...deepClone<IPlayerGameTurnDetails>(newTurn) },
    victory: EmptyVictoryDetails(),
  });

  const createMockGame = (players: IPlayer[]): IGame => ({
    currentStep: 1,
    players,
    setsRequired: 1,
    supply: EmptyGameSupply(),
    options: {
      curses: true,
      expansions: {
        prosperity: false,
        renaissance: false,
        risingSun: false,
      },
      mats: DefaultMatsEnabled(),
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
        { actions: 0, buys: 0, coins: 0, cards: 5 },
        { actions: 1, buys: 1, coins: 0, cards: 5 }
      ),
      createMockPlayer(
        'Player 2',
        { actions: 2, buys: 1, coins: 3, cards: 5 },
        { actions: 1, buys: 1, coins: 0, cards: 5 }
      ),
    ]);

    const updatedGame = resetPlayerTurnCounters(initialGame);

    expect(updatedGame.players[0].turn).toEqual({ actions: 1, buys: 1, coins: 0, cards: 5 });
    expect(updatedGame.players[1].turn).toEqual({ actions: 1, buys: 1, coins: 0, cards: 5 });
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
        { actions: 0, buys: 0, coins: 0, cards: 5 },
        { actions: 1, buys: 1, coins: 0, cards: 5 }
      ),
    ]);
    initialGame.players[0].victory = { ...EmptyVictoryDetails(), estates: 3 };

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

    const initialGame = createMockGame([incompletePlayer as IPlayer]);

    const updatedGame = resetPlayerTurnCounters(initialGame);

    expect(updatedGame.players[0].turn).toEqual({
      actions: 1,
      buys: 1,
      coins: 0,
      cards: 5,
    });
  });

  it('should not modify the original game object', () => {
    const initialGame = createMockGame([
      createMockPlayer(
        'Player 1',
        { actions: 0, buys: 0, coins: 0, cards: 5 },
        { actions: 1, buys: 1, coins: 0, cards: 5 }
      ),
    ]);

    const updatedGame = resetPlayerTurnCounters(initialGame);

    expect(updatedGame).not.toBe(initialGame);
    expect(updatedGame.players).not.toBe(initialGame.players);
    expect(updatedGame.players[0]).not.toBe(initialGame.players[0]);
    expect(updatedGame.players[0].turn).not.toBe(initialGame.players[0].turn);
    expect(initialGame.players[0].turn).toEqual({ actions: 0, buys: 0, coins: 0, cards: 5 });
  });
});
