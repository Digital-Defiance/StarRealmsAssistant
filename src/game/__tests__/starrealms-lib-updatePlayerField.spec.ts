import { updatePlayerField } from '@/game/starrealms-lib';
import { IGame } from '@/game/interfaces/game';
import { IPlayer } from '@/game/interfaces/player';
import { InvalidFieldError } from '@/game/errors/invalid-field';
import { NotEnoughSubfieldError } from '@/game/errors/not-enough-subfield';
import { PlayerFieldMap } from '@/game/types';
import {
  DEFAULT_STARTING_AUTHORITY,
  DefaultPlayerColors,
  EmptyGameState,
  STARTING_EXPLORERS,
  STARTING_SCOUTS,
  STARTING_VIPERS,
} from '@/game/constants';

describe('updatePlayerField', () => {
  let mockGame: IGame;
  let mockPlayer: IPlayer;

  beforeEach(() => {
    mockPlayer = {
      name: 'Test Player',
      color: DefaultPlayerColors[0],
      turn: { trade: 1, combat: 0, cards: 5, gains: 0, discard: 0, scrap: 0 },
      newTurn: { trade: 1, combat: 0, cards: 5, gains: 0, discard: 0, scrap: 0 },
      authority: {
        authority: 3,
        assimilation: 0,
      },
      boss: false,
    };
    mockGame = {
      ...EmptyGameState(),
      players: [mockPlayer],
      supply: {
        ...EmptyGameState().supply,
        explorers: STARTING_EXPLORERS,
        vipers: STARTING_VIPERS,
        scouts: STARTING_SCOUTS,
      },
    };
  });

  it('should update turn field correctly', () => {
    const updatedGame = updatePlayerField(mockGame, 0, 'turn', 'trade', 2);
    expect(updatedGame.players[0].turn.trade).toBe(3);
  });

  it('should update victory field correctly', () => {
    const updatedGame = updatePlayerField(mockGame, 0, 'turn', 'combat', 1);
    expect(updatedGame.players[0].turn.combat).toBe(1);
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

  it('should correctly handle zero increments', () => {
    const updatedGame = updatePlayerField(mockGame, 0, 'turn', 'trade', 0);
    expect(updatedGame.players[0].turn.trade).toBe(1);
  });

  it('should not update supply for non-victory fields', () => {
    const initialSupply = { ...mockGame.supply };
    const updatedGame = updatePlayerField(mockGame, 0, 'turn', 'trade', 2);
    expect(updatedGame.supply).toEqual(initialSupply);
  });

  it('should handle multiple players correctly', () => {
    mockGame = {
      ...mockGame,
      players: [
        { ...mockPlayer, authority: { ...mockPlayer.authority, authority: 3 } },
        { ...mockPlayer, authority: { ...mockPlayer.authority, authority: 3 } },
      ],
      supply: { ...mockGame.supply, explorers: 10, scouts: 8, vipers: 2 },
    };

    const updatedGame = updatePlayerField(mockGame, 1, 'authority', 'authority', 1);
    expect(updatedGame.players[1].authority.authority).toBe(4);
    expect(updatedGame.players[0].authority.authority).toBe(3);
  });
});
