import {
  COLONY_TOTAL_COUNT,
  COLONY_TOTAL_COUNT_2P,
  MIN_PLAYERS,
  NOT_PRESENT,
  PLATINUM_TOTAL_COUNT,
} from '@/game/constants';
import { MinPlayersError } from '@/game/errors/min-players';
import { IBaseKingdomSet } from '@/game/interfaces/set-kingdom/_base_set';

export interface IProsperityKingdom extends IBaseKingdomSet {
  colonies: number;
  platinums: number;
}

export function computeStartingSupply(numPlayers: number): IProsperityKingdom {
  if (numPlayers < MIN_PLAYERS) {
    throw new MinPlayersError();
  }
  return {
    colonies: numPlayers === 2 ? COLONY_TOTAL_COUNT_2P : COLONY_TOTAL_COUNT,
    platinums: PLATINUM_TOTAL_COUNT,
  };
}

export const NullSet: IProsperityKingdom = {
  colonies: NOT_PRESENT,
  platinums: NOT_PRESENT,
};
