import { IGameSupply } from '@/game/interfaces/game-supply';
import { IPlayer } from '@/game/interfaces/player';
import { IRenaissanceFeatures } from '@/game/interfaces/set-features/renaissance';
import { IRisingSunFeatures } from '@/game/interfaces/set-features/rising-sun';
import { ILogEntry } from '@/game/interfaces/log-entry';
import { IGameOptions } from '@/game/interfaces/game-options';
import { CurrentStep } from '@/game/enumerations/current-step';
import { IEventTimeCache } from '@/game/interfaces/event-time-cache';

export interface IGame {
  players: IPlayer[];
  options: IGameOptions;
  supply: IGameSupply;
  renaissance?: IRenaissanceFeatures;
  risingSun: IRisingSunFeatures;
  currentTurn: number;
  currentPlayerIndex: number;
  firstPlayerIndex: number;
  selectedPlayerIndex: number;
  log: ILogEntry[];
  timeCache: Array<IEventTimeCache>;
  currentStep: CurrentStep;
  setsRequired: number;
}
