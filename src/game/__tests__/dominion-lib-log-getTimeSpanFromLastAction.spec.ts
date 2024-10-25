import { getTimeSpanFromLastAction } from '@/game/dominion-lib-log';
import { ILogEntry } from '@/game/interfaces/log-entry';
import { GameLogActionWithCount } from '@/game/enumerations/game-log-action-with-count';
import { createMockLog } from '@/__fixtures__/dominion-lib-fixtures';

describe('getTimeSpanFromLastAction', () => {
  it('should return 0 seconds if log is empty', () => {
    const log: ILogEntry[] = [];
    const eventTime = new Date();
    const result = getTimeSpanFromLastAction(log, eventTime);
    expect(result).toBe(0);
  });

  it('should return correct time span from last action', () => {
    const lastActionTime = new Date('2021-01-01T10:00:00Z');
    const eventTime = new Date('2021-01-01T10:05:00Z');
    const log: ILogEntry[] = [
      createMockLog({
        id: '1',
        timestamp: lastActionTime,
        action: GameLogActionWithCount.NEXT_TURN,
        playerIndex: 0,
        currentPlayerIndex: 0,
        turn: 1,
      }),
    ];
    const result = getTimeSpanFromLastAction(log, eventTime);
    expect(result).toBe(300000);
  });
});
