import { newPlayer } from '@/game/starrealms-lib';
import { DefaultTurnDetails, EmptyAuthorityDetails, DefaultPlayerColors } from '@/game/constants';

describe('newPlayer', () => {
  it('should create a new player with the given name', () => {
    const playerName = 'Test Player';
    const player = newPlayer(playerName, false, DefaultPlayerColors[0]);
    expect(player.name).toBe(playerName);
  });

  it('should trim the player name', () => {
    const playerName = '  John Doe  ';
    const player = newPlayer(playerName, false, DefaultPlayerColors[0]);
    expect(player.name).toBe('John Doe');
  });

  it('should initialize turn and newTurn with DefaultTurnDetails', () => {
    const player = newPlayer('Test Player', false, DefaultPlayerColors[0]);
    expect(player.turn).toEqual(DefaultTurnDetails());
    expect(player.newTurn).toEqual(DefaultTurnDetails());
  });

  it('should initialize victory with EmptyAuthorityDetails', () => {
    const player = newPlayer('Test Player', false, DefaultPlayerColors[0]);
    expect(player.authority).toEqual(EmptyAuthorityDetails());
  });

  it('should create a new player object with all expected properties', () => {
    const player = newPlayer('Test Player', false, DefaultPlayerColors[0]);
    expect(player).toEqual({
      name: 'Test Player',
      color: DefaultPlayerColors[0],
      turn: DefaultTurnDetails(),
      newTurn: DefaultTurnDetails(),
      authority: EmptyAuthorityDetails(),
      boss: false,
    });
  });
  it('should create a new player with boss true', () => {
    const player = newPlayer('Test Player', true, DefaultPlayerColors[0]);
    expect(player.boss).toBe(true);
  });
});
