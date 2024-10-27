import { updatePlayerField } from '@/game/dominion-lib';
import { IGame } from '@/game/interfaces/game';
import { IPlayer } from '@/game/interfaces/player';
import { EmptyGameState } from '@/game/dominion-lib';
import { InvalidFieldError } from '@/game/errors/invalid-field';
import { NotEnoughSupplyError } from '@/game/errors/not-enough-supply';
import { NotEnoughSubfieldError } from '@/game/errors/not-enough-subfield';
import { PlayerFieldMap } from '@/game/types';
import { DefaultPlayerColors } from '@/game/constants';

describe('updatePlayerField', () => {
  let mockGame: IGame;
  let mockPlayer: IPlayer;

  beforeEach(() => {
    mockPlayer = {
      name: 'Test Player',
      color: DefaultPlayerColors[0],
      mats: { coffers: 0, villagers: 0, debt: 0, favors: 0 },
      turn: { actions: 1, buys: 1, coins: 0, cards: 5 },
      newTurn: { actions: 1, buys: 1, coins: 0, cards: 5 },
      victory: {
        estates: 3,
        duchies: 0,
        provinces: 0,
        colonies: 0,
        curses: 0,
        tokens: 0,
        other: 0,
      },
    };
    mockGame = {
      ...EmptyGameState(),
      players: [mockPlayer],
      supply: {
        ...EmptyGameState().supply,
        estates: 8,
        duchies: 8,
        provinces: 8,
        colonies: 8,
        curses: 10,
      },
    };
  });

  it('should update turn field correctly', () => {
    const updatedGame = updatePlayerField(mockGame, 0, 'turn', 'actions', 2);
    expect(updatedGame.players[0].turn.actions).toBe(3);
  });

  it('should update victory field correctly', () => {
    const updatedGame = updatePlayerField(mockGame, 0, 'victory', 'duchies', 1);
    expect(updatedGame.players[0].victory.duchies).toBe(1);
    expect(updatedGame.supply.duchies).toBe(7);
  });

  it('should update mats field correctly', () => {
    const updatedGame = updatePlayerField(mockGame, 0, 'mats', 'coffers', 3);
    expect(updatedGame.players[0].mats.coffers).toBe(3);
  });

  it('should update newTurn field correctly', () => {
    const updatedGame = updatePlayerField(mockGame, 0, 'newTurn', 'buys', 1);
    expect(updatedGame.players[0].newTurn.buys).toBe(2);
  });

  it('should not allow negative values for player fields', () => {
    expect(() => updatePlayerField(mockGame, 0, 'turn', 'coins', -5)).toThrow(
      NotEnoughSubfieldError
    );
  });

  it('should throw InvalidFieldError for non-existent fields', () => {
    expect(() => {
      updatePlayerField(
        mockGame,
        0,
        'nonexistentField' as keyof PlayerFieldMap,
        'subfield' as unknown as keyof IPlayer['turn'],
        1
      );
    }).toThrow(InvalidFieldError);
  });

  it('should throw NotEnoughSupplyError when trying to take more cards than available', () => {
    mockGame.supply.duchies = 2;
    expect(() => {
      updatePlayerField(mockGame, 0, 'victory', 'duchies', 3);
    }).toThrow(NotEnoughSupplyError);
  });

  it('should correctly handle zero increments', () => {
    const updatedGame = updatePlayerField(mockGame, 0, 'turn', 'actions', 0);
    expect(updatedGame.players[0].turn.actions).toBe(1);
  });

  it('should correctly decrement supply for victory cards', () => {
    const updatedGame = updatePlayerField(mockGame, 0, 'victory', 'provinces', 2);
    expect(updatedGame.players[0].victory.provinces).toBe(2);
    expect(updatedGame.supply.provinces).toBe(6);
  });

  it('should not update supply for non-victory fields', () => {
    const initialSupply = { ...mockGame.supply };
    const updatedGame = updatePlayerField(mockGame, 0, 'turn', 'actions', 2);
    expect(updatedGame.supply).toEqual(initialSupply);
  });

  it('should handle multiple players correctly', () => {
    mockGame = {
      ...mockGame,
      players: [
        { ...mockPlayer, victory: { ...mockPlayer.victory, estates: 3 } },
        { ...mockPlayer, victory: { ...mockPlayer.victory, estates: 3 } },
      ],
      supply: { ...mockGame.supply, estates: 8 },
    };

    const updatedGame = updatePlayerField(mockGame, 1, 'victory', 'estates', 1);
    expect(updatedGame.players[1].victory.estates).toBe(4);
    expect(updatedGame.players[0].victory.estates).toBe(3);
    expect(updatedGame.supply.estates).toBe(7);
  });

  it('should handle victory trash correctly', () => {
    const updatedGame = updatePlayerField(mockGame, 0, 'victory', 'estates', -1, true);
    expect(updatedGame.players[0].victory.estates).toBe(2);
    expect(updatedGame.supply.estates).toBe(8);
  });

  it('should handle victory trash correctly', () => {
    const updatedGame = updatePlayerField(mockGame, 0, 'victory', 'estates', -1, false);
    expect(updatedGame.players[0].victory.estates).toBe(2);
    expect(updatedGame.supply.estates).toBe(9);
  });
});
