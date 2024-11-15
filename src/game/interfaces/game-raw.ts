import { IGameSupply } from '@/game/interfaces/game-supply';
import { IPlayer } from '@/game/interfaces/player';
import { ILogEntryRaw } from '@/game/interfaces/log-entry-raw';
import { IGameOptions } from '@/game/interfaces/game-options';
import { CurrentStep } from '@/game/enumerations/current-step';
import { ITurnStatisticsRaw } from '@/game/interfaces/turn-statistics-raw';

export interface IGameRaw {
  /**
   * The players in the game.
   */
  players: IPlayer[];
  /**
   * The options for the game.
   */
  options: IGameOptions;
  /**
   * The supply counts of cards for the game.
   */
  supply: IGameSupply;
  /**
   * The current turn number.
   */
  currentTurn: number;
  /**
   * The index of the current player.
   */
  currentPlayerIndex: number;
  /**
   * The index of the first player that started the game.
   */
  firstPlayerIndex: number;
  /**
   * The index of the selected player.
   */
  selectedPlayerIndex: number;
  /**
   * The log of actions taken in the game. With string dates.
   */
  log: ILogEntryRaw[];
  /**
   * The state machine state of the game.
   */
  currentStep: CurrentStep;
  /**
   * The number of sets required to play the game for the number of players.
   */
  setsRequired: number;
  /**
   * A cache of turn statistics for the game.
   */
  turnStatisticsCache: ITurnStatisticsRaw[];
  /**
   * The version of the game.
   */
  gameVersion: string;
}
