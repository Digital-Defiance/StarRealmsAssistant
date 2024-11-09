import { RecipeKey } from '@/components/Recipes';
import { GameLogAction } from '@/game/enumerations/game-log-action';
import { IPlayerGameTurnDetails } from '@/game/interfaces/player-game-turn-details';
import { IGame } from '@/game/interfaces/game';

export interface IRecipeAction {
  /**
   * Action that was taken
   */
  action: GameLogAction;
  /**
   * Index of the player that took the action
   */
  playerIndex: number;
  /**
   * Index of the player whose turn it is
   */
  currentPlayerIndex: number;
  /**
   * Turn number at the time of this log entry
   */
  turn: number;
  /**
   * Count of value added/removed
   */
  count?: number | ((game: IGame, playerIndex: number) => number);
  /**
   * Whether the removal action was to the trash
   */
  trash?: boolean;
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
  /**
   * Name of the grouped action taken, for grouped actions
   */
  actionName?: string;
  /** Key for the grouped action */
  actionKey?: RecipeKey;
}
