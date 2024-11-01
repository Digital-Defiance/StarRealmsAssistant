/**
 * Interface for the event time cache, as it is stored
 * Each entry correlates 1:1 with an event in the log
 */
export interface IEventTimeCacheRaw {
  /**
   * The ID of the event
   */
  eventId: string;
  /**
   * The total time paused leading up to this event
   */
  totalPauseTime: number;
  /**
   * The total time paused during this turn
   */
  turnPauseTime: number;
  /**
   * Whether the game is in a save state at this point
   */
  inSaveState: boolean;
  /**
   * Whether the game is in a pause state at this point
   */
  inPauseState: boolean;
  /**
   * The timestamp of the last save event
   */
  saveStartTime: string | null;
  /**
   * The timestamp of the last pause event
   */
  pauseStartTime: string | null;
  /**
   * Game time in milliseconds at the time of this event after taking into account pauses, etc
   */
  adjustedDuration: number;
}
