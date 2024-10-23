import { GameLogActionWithCount } from '@/game/enumerations/game-log-action-with-count';
import { IPlayerGameTurnDetails } from '@/game/interfaces/player-game-turn-details';

export interface ILogEntry {
  /**
   * Unique identifier for this log entry
   */
  id: string;
  /**
   * Timestamp of the log entry
   */
  timestamp: Date;
  /**
   * Action that was taken
   */
  action: GameLogActionWithCount;
  /**
   * Index of the player that took the action
   */
  playerIndex: number;
  /**
   * Index of the player whose turn it is
   */
  currentPlayerIndex: number;
  /**
   * Count of value added/removed
   */
  count?: number;
  /**
   * Whether the action was a correction
   */
  correction?: boolean;
  /**
   * Id of the main action this was linked to, if any
   */
  linkedActionId?: string;
  /**
   * Index of the previously selected player
   * Applicable to 'next turn' and 'select player' actions
   */
  prevPlayerIndex?: number;
  /**
   * Details of all player's turn counters at the time of this log entry
   * Used when undoing a "next turn" action
   */
  playerTurnDetails?: IPlayerGameTurnDetails[];
}
