import { IGameSupply } from '@/game/interfaces/game-supply';

export interface ITurnStatistics {
  /**
   * The turn number
   */
  turn: number;
  /**
   * The score of each player at the end of the turn
   */
  playerScores: { [playerIndex: number]: number };
  /**
   * The amount of trade accumulated by each player during the turn
   */
  playerTrade: { [playerIndex: number]: number };
  /**
   * The amount of combat accumulated by each player during the turn
   */
  playerCombat: { [playerIndex: number]: number };
  /**
   * The number of cards drawn by each player during the turn
   */
  playerCardsDrawn: { [playerIndex: number]: number };
  /**
   * The number of cards gained by each player during the turn
   */
  playerGains: { [playerIndex: number]: number };
  /**
   * The number of cards discarded by each player during the turn
   */
  playerDiscards: { [playerIndex: number]: number };
  /**
   * The assimilation value of the boss at the end of the turn
   */
  bossAssimilation?: number;
  /**
   * The supply at the end of the turn
   */
  supply: IGameSupply;
  /**
   * The index of the player whose turn it was
   */
  playerIndex: number;
  /**
   * The start time of the turn
   */
  start: Date;
  /**
   * The end time of the turn
   */
  end: Date;
  /**
   * The duration of the turn in milliseconds
   */
  turnDuration: number;
}
