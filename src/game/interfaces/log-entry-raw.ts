import { IPlayerGameTurnDetails } from '@/game/interfaces/player-game-turn-details';

export interface ILogEntryRaw {
  id: string;
  timestamp: string;
  action: string;
  playerIndex: number;
  playerName?: string;
  count?: number;
  correction?: boolean;
  linkedAction?: string;
  /**
   * Details of all player's turn counters at the time of this log entry
   * Used when undoing a "next turn" action
   */
  playerTurnDetails?: IPlayerGameTurnDetails[];
}
