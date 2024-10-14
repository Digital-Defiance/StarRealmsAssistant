import { IMatsEnabled } from '@/game/interfaces/mats-enabled';
import { IExpansionsEnabled } from '@/game/interfaces/expansions-enabled';

export interface IGameOptions {
  curses: boolean;
  expansions: IExpansionsEnabled;
  mats: IMatsEnabled;
}
