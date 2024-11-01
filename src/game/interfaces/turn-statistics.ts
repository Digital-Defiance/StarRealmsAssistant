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
