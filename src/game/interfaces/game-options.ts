export interface IGameOptions {
  /**
   * Whether to track card counts
   */
  trackCardCounts: boolean;
  /**
   * Whether to track card gains
   */
  trackCardGains: boolean;
  /**
   * Whether to track discards
   */
  trackDiscard: boolean;
  /**
   * Whether to track Assimilation for the Boss
   */
  trackAssimilation: boolean;
  /**
   * Starting authority for the given player
   * Some people play with command decks that change the starting authority from 50.
   */
  startingAuthorityByPlayerIndex: number[];
  /**
   * How many cards per turn (excluding beginning turn(s)) a given player has by default.
   */
  startingCardsByPlayerIndex: number[];
  /**
   * Turns before the boss plays.
   */
  bossStartTurn?: number;
}
