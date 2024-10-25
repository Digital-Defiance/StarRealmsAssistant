import { calculateAverageTurnDuration } from '@/game/dominion-lib-log';
import { ITurnDuration } from '@/game/interfaces/turn-duration';

describe('calculateAverageTurnDuration', () => {
  it('should return 0 if turnDurations array is empty', () => {
    const turnDurations: ITurnDuration[] = [];
    const result = calculateAverageTurnDuration(turnDurations);
    expect(result).toBe(0);
  });

  it('should calculate the average duration correctly', () => {
    const turnDurations: ITurnDuration[] = [
      {
        turn: 1,
        playerIndex: 0,
        start: new Date(),
        end: new Date(),
        duration: 300000, // 5 mins
      },
      {
        turn: 2,
        playerIndex: 1,
        start: new Date(),
        end: new Date(),
        duration: 600000, // 10 mins
      },
      {
        turn: 3,
        playerIndex: 0,
        start: new Date(),
        end: new Date(),
        duration: 900000, // 15 mins
      },
    ];
    const result = calculateAverageTurnDuration(turnDurations);
    expect(result).toBe(600000); // Average of 5, 10, and 15 mins
  });
});
