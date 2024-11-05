import { createMockGame } from '@/__fixtures__/dominion-lib-fixtures';
import { IGame } from '@/game/interfaces/game';
import { getGroupedActionTargetPlayers } from '@/game/dominion-lib-log';
import { GroupedActionDest } from '@/game/enumerations/grouped-action-dest';

describe('getGroupedActionTargetPlayers', () => {
  let mockGame: IGame;

  beforeEach(() => {
    mockGame = createMockGame(3, {
      currentPlayerIndex: 1,
      selectedPlayerIndex: 2,
    });
  });

  it('should return the current player index', () => {
    const result = getGroupedActionTargetPlayers(mockGame, GroupedActionDest.CurrentPlayerIndex);
    expect(result).toEqual([1]);
  });

  it('should return the selected player index', () => {
    const result = getGroupedActionTargetPlayers(mockGame, GroupedActionDest.SelectedPlayerIndex);
    expect(result).toEqual([2]);
  });

  it('should return all player indices', () => {
    const result = getGroupedActionTargetPlayers(mockGame, GroupedActionDest.AllPlayers);
    expect(result).toEqual([0, 1, 2]);
  });

  it('should return all player indices except the current player', () => {
    const result = getGroupedActionTargetPlayers(
      mockGame,
      GroupedActionDest.AllPlayersExceptCurrent
    );
    expect(result).toEqual([0, 2]);
  });

  it('should return all player indices except the selected player', () => {
    const result = getGroupedActionTargetPlayers(
      mockGame,
      GroupedActionDest.AllPlayersExceptSelected
    );
    expect(result).toEqual([0, 1]);
  });

  it('should throw an error for an invalid destination', () => {
    expect(() =>
      getGroupedActionTargetPlayers(mockGame, 'InvalidDest' as GroupedActionDest)
    ).toThrow('Invalid GroupedActionDest: InvalidDest');
  });
});
