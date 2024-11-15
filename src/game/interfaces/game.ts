import { IGameSupply } from '@/game/interfaces/game-supply';
import { IPlayer } from '@/game/interfaces/player';
import { ILogEntry } from '@/game/interfaces/log-entry';
import { IGameOptions } from '@/game/interfaces/game-options';
import { CurrentStep } from '@/game/enumerations/current-step';
import { ITurnStatistics } from '@/game/interfaces/turn-statistics';

export interface IGame {
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
   * The log of actions taken in the game.
   */
  log: ILogEntry[];
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
  turnStatisticsCache: Array<ITurnStatistics>;
  /**
   * The version of the game.
   */
  gameVersion: string;
}
