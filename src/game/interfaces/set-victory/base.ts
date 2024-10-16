import { IBaseVictorySet } from '@/game/interfaces/set-victory/_base_set';

export interface IBaseVictory extends IBaseVictorySet {
  curses: number;
  estates: number;
  duchies: number;
  provinces: number;
}
