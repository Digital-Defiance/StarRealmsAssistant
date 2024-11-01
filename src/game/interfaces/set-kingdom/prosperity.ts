import { MIN_PLAYERS, NOT_PRESENT, SupplyForPlayerCount } from '@/game/constants';
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
  const supplyInfo = SupplyForPlayerCount(numPlayers, true);
  return {
    colonies: supplyInfo.supply.colonies,
    platinums: supplyInfo.supply.platinums,
  };
}

export const NullSet: IProsperityKingdom = {
  colonies: NOT_PRESENT,
  platinums: NOT_PRESENT,
};
