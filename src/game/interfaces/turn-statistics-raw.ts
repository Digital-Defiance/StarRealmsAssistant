import { IGameSupply } from '@/game/interfaces/game-supply';

export interface ITurnStatisticsRaw {
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
  start: string;
  /**
   * The end time of the turn
   */
  end: string;
  /**
   * The duration of the turn in milliseconds
   */
  turnDuration: number;
}
