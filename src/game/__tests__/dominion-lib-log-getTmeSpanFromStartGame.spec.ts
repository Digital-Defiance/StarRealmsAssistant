import { getTimeSpanFromStartGame } from '@/game/dominion-lib-log';

describe('getTimeSpanFromStartGame', () => {
  it('should return zero for the same start date and event time', () => {
    const startDate = new Date('2023-01-01T00:00:00Z');
    const eventTime = new Date('2023-01-01T00:00:00Z');
    const result = getTimeSpanFromStartGame(startDate, eventTime);
    expect(result).toBe('0d 0h 0m 0s');
  });

  it('should return the correct time span for event time after start date', () => {
    const startDate = new Date('2023-01-01T00:00:00Z');
    const eventTime = new Date('2023-01-01T01:00:00Z');
    const result = getTimeSpanFromStartGame(startDate, eventTime);
    expect(result).toBe('0d 1h 0m 0s');
  });

  it('should return the correct time span for event time before start date', () => {
    const startDate = new Date('2023-01-01T01:00:00Z');
    const eventTime = new Date('2023-01-01T00:00:00Z');
    const result = getTimeSpanFromStartGame(startDate, eventTime);
    expect(result).toBe('-0d 1h 0m 0s');
  });

  it('should return the correct time span for event time exactly one day after start date', () => {
    const startDate = new Date('2023-01-01T00:00:00Z');
    const eventTime = new Date('2023-01-02T00:00:00Z');
    const result = getTimeSpanFromStartGame(startDate, eventTime);
    expect(result).toBe('1d 0h 0m 0s');
  });

  it('should return the correct time span for event time exactly one hour after start date', () => {
    const startDate = new Date('2023-01-01T00:00:00Z');
    const eventTime = new Date('2023-01-01T01:00:00Z');
    const result = getTimeSpanFromStartGame(startDate, eventTime);
    expect(result).toBe('0d 1h 0m 0s');
  });

  it('should return the correct time span for event time exactly one minute after start date', () => {
    const startDate = new Date('2023-01-01T00:00:00Z');
    const eventTime = new Date('2023-01-01T00:01:00Z');
    const result = getTimeSpanFromStartGame(startDate, eventTime);
    expect(result).toBe('0d 0h 1m 0s');
  });

  it('should return the correct time span for event time exactly one second after start date', () => {
    const startDate = new Date('2023-01-01T00:00:00Z');
    const eventTime = new Date('2023-01-01T00:00:01Z');
    const result = getTimeSpanFromStartGame(startDate, eventTime);
    expect(result).toBe('0d 0h 0m 1s');
  });
});
