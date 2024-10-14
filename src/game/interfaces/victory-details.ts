import { IBaseVictory } from '@/game/interfaces/set-victory/base';
import { IProsperityVictory } from '@/game/interfaces/set-victory/prosperity';

export interface IVictoryDetails extends IBaseVictory, IProsperityVictory {
  tokens: number;
  other: number;
}
