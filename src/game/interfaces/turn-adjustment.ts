import { PlayerField, PlayerSubFields } from '@/game/types';

export interface ITurnAdjustment {
  field: PlayerField | null;
  subfield: PlayerSubFields | null;
  increment: number;
}
