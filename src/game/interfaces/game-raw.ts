import { IGameSupply } from '@/game/interfaces/game-supply';
import { IPlayer } from '@/game/interfaces/player';
import { IRenaissanceFeatures } from '@/game/interfaces/set-features/renaissance';
import { IRisingSunFeatures } from '@/game/interfaces/set-features/rising-sun';
import { ILogEntryRaw } from '@/game/interfaces/log-entry-raw';
import { IGameOptions } from '@/game/interfaces/game-options';
import { CurrentStep } from '@/game/enumerations/current-step';
import { IEventTimeCacheRaw } from '@/game/interfaces/event-time-cache-raw';
import { ITurnStatisticsRaw } from '@/game/interfaces/turn-statistics-raw';

export interface IGameRaw {
  players: IPlayer[];
  options: IGameOptions;
  supply: IGameSupply;
  renaissance?: IRenaissanceFeatures;
  risingSun: IRisingSunFeatures;
  currentTurn: number;
  currentPlayerIndex: number;
  firstPlayerIndex: number;
  selectedPlayerIndex: number;
  log: ILogEntryRaw[];
  currentStep: CurrentStep;
  setsRequired: number;
  timeCache: Array<IEventTimeCacheRaw>;
  turnStatisticsCache: Array<ITurnStatisticsRaw>;
  gameVersion: string;
}
