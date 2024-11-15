import { formatTimeSpan } from '@/game/starrealms-lib-log';

describe('formatTimeSpan', () => {
  it('should format zero time correctly', () => {
    expect(formatTimeSpan(0)).toBe('0d 0h 0m 0s');
  });

  it('should format positive time spans correctly', () => {
    expect(formatTimeSpan(1000)).toBe('0d 0h 0m 1s');
    expect(formatTimeSpan(60000)).toBe('0d 0h 1m 0s');
    expect(formatTimeSpan(3600000)).toBe('0d 1h 0m 0s');
    expect(formatTimeSpan(86400000)).toBe('1d 0h 0m 0s');
  });

  it('should format negative time spans correctly', () => {
    expect(formatTimeSpan(-1000)).toBe('0d 0h 0m 0s');
  });

  it('should handle complex time spans', () => {
    expect(formatTimeSpan(90061000)).toBe('1d 1h 1m 1s');
  });

  it('should handle very large time spans', () => {
    expect(formatTimeSpan(31536000000)).toBe('365d 0h 0m 0s');
  });

  it('should handle fractional seconds', () => {
    expect(formatTimeSpan(1500)).toBe('0d 0h 0m 1s');
  });

  it('should handle time spans with only some units', () => {
    expect(formatTimeSpan(3661000)).toBe('0d 1h 1m 1s');
    expect(formatTimeSpan(86401000)).toBe('1d 0h 0m 1s');
  });
});
