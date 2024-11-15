import { IPlayer } from '@/game/interfaces/player';

export type TurnField = 'trade' | 'combat' | 'cards' | 'gains' | 'discard' | 'scrap';
export type AuthorityField = 'authority';

export interface PlayerFieldMap {
  turn: TurnField;
  authority: AuthorityField;
  newTurn: TurnField;
}

export type PlayerField = 'turn' | 'authority' | 'newTurn';
export type PlayerSubField<T extends PlayerField> = keyof IPlayer[T];
export type PlayerSubFields =
  | PlayerSubField<'turn'>
  | PlayerSubField<'authority'>
  | PlayerSubField<'newTurn'>;

export type NumericKeys<T> = {
  [K in keyof T]: T[K] extends number ? K : never;
}[keyof T];
