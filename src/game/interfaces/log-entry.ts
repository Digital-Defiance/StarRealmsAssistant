import { GameLogActionWithCount } from '@/game/enumerations/game-log-action-with-count';
import { IPlayerGameTurnDetails } from '@/game/interfaces/player-game-turn-details';

export interface ILogEntry {
  id: string;
  timestamp: Date;
  action: GameLogActionWithCount;
  playerIndex: number;
  count?: number;
  correction?: boolean;
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
