import { convertGameToGameRaw } from '@/game/dominion-lib-load-save';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import {
  createMockGame,
  createMockLog,
  createMockPlayer,
} from '@/__fixtures__/dominion-lib-fixtures';
import { EmptyVictoryDetails } from '@/game/constants';

const mockGame = createMockGame(2, {
  log: [
    createMockLog({
      id: '1',
      action: GameLogAction.START_GAME,
      timestamp: new Date('2023-01-01T00:00:00Z'),
      turn: 1,
      count: 2,
      currentPlayerIndex: 2,
      playerIndex: 3,
      prevPlayerIndex: -1,
    }),
    createMockLog({
      id: '2',
      action: GameLogAction.NEXT_TURN,
      timestamp: new Date('2023-01-01T01:00:00Z'),
      turn: 2,
      count: 3,
      currentPlayerIndex: 1,
      playerIndex: 0,
      prevPlayerIndex: 2,
    }),
  ],
  timeCache: [
    {
      eventId: '1',
      totalPauseTime: 0,
      inSaveState: false,
      inPauseState: false,
      saveStartTime: null,
      pauseStartTime: null,
      adjustedDuration: 0,
      turnPauseTime: 0,
    },
    {
      eventId: '2',
      totalPauseTime: 0,
      inSaveState: false,
      inPauseState: false,
      saveStartTime: null,
      pauseStartTime: null,
      adjustedDuration: 0,
      turnPauseTime: 0,
    },
  ],
  players: [
    createMockPlayer(0, { name: 'Karina' }),
    createMockPlayer(1, {
      name: 'Jerel',
    }),
  ],
});

describe('convertGameToGameRaw', () => {
  it('should convert a valid IGame object to IGameRaw', () => {
    const result = convertGameToGameRaw(mockGame);
    const expectedGameRaw = {
      ...mockGame,
      log: [
        {
          ...createMockLog({
            id: '1',
            action: GameLogAction.START_GAME,
            turn: 1,
            count: 2,
            currentPlayerIndex: 2,
            playerIndex: 3,
            prevPlayerIndex: -1,
          }),
          timestamp: '2023-01-01T00:00:00.000Z',
        },
        {
          ...createMockLog({
            id: '2',
            action: GameLogAction.NEXT_TURN,
            count: 3,
            currentPlayerIndex: 1,
            playerIndex: 0,
            prevPlayerIndex: 2,
            turn: 2,
          }),
          timestamp: '2023-01-01T01:00:00.000Z',
        },
      ],
      timeCache: [
        {
          eventId: '1',
          totalPauseTime: 0,
          inSaveState: false,
          inPauseState: false,
          saveStartTime: null,
          pauseStartTime: null,
          adjustedDuration: 0,
          turnPauseTime: 0,
        },
        {
          eventId: '2',
          totalPauseTime: 0,
          inSaveState: false,
          inPauseState: false,
          saveStartTime: null,
          pauseStartTime: null,
          adjustedDuration: 0,
          turnPauseTime: 0,
        },
      ],
      players: [
        createMockPlayer(0, {
          name: 'Karina',
          victory: {
            ...EmptyVictoryDetails(),
            estates: 3,
          },
        }),
        createMockPlayer(1, {
          name: 'Jerel',
          victory: {
            ...EmptyVictoryDetails(),
            estates: 3,
          },
        }),
      ],
    };
    expect(result).toEqual(expectedGameRaw);
  });
});
