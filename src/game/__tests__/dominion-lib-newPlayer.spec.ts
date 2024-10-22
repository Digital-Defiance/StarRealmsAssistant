import { newPlayer } from '@/game/dominion-lib';
import {
  EmptyMatDetails,
  DefaultTurnDetails,
  EmptyVictoryDetails,
  DefaultPlayerColors,
} from '@/game/constants';

describe('newPlayer', () => {
  it('should create a new player with the given name', () => {
    const playerName = 'Test Player';
    const player = newPlayer(playerName, 0);
    expect(player.name).toBe(playerName);
  });

  it('should trim the player name', () => {
    const playerName = '  John Doe  ';
    const player = newPlayer(playerName, 0);
    expect(player.name).toBe('John Doe');
  });

  it('should initialize mats with EmptyMatDetails', () => {
    const player = newPlayer('Test Player', 0);
    expect(player.mats).toEqual(EmptyMatDetails);
  });

  it('should initialize turn and newTurn with DefaultTurnDetails', () => {
    const player = newPlayer('Test Player', 0);
    expect(player.turn).toEqual(DefaultTurnDetails);
    expect(player.newTurn).toEqual(DefaultTurnDetails);
  });

  it('should initialize victory with EmptyVictoryDetails', () => {
    const player = newPlayer('Test Player', 0);
    expect(player.victory).toEqual(EmptyVictoryDetails);
  });

  it('should create a new player object with all expected properties', () => {
    const player = newPlayer('Test Player', 0);
    expect(player).toEqual({
      name: 'Test Player',
      color: DefaultPlayerColors[0],
      mats: EmptyMatDetails,
      turn: DefaultTurnDetails,
      newTurn: DefaultTurnDetails,
      victory: EmptyVictoryDetails,
    });
  });
});
