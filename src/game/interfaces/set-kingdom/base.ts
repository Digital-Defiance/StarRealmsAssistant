import { MAX_PLAYERS, MIN_PLAYERS, NOT_PRESENT, SupplyForPlayerCount } from '@/game/constants';
import { MaxPlayersError } from '@/game/errors/max-players';
import { MinPlayersError } from '@/game/errors/min-players';
import { IBaseKingdomSet } from '@/game/interfaces/set-kingdom/_base_set';

export interface IBaseKingdom extends IBaseKingdomSet {
  estates: number;
  duchies: number;
  provinces: number;
  coppers: number;
  silvers: number;
  golds: number;
  curses: number;
}

export function computeStartingSupply(numPlayers: number, curses: boolean): IBaseKingdom {
  if (numPlayers < MIN_PLAYERS) {
    throw new MinPlayersError();
  }
  if (numPlayers > MAX_PLAYERS) {
    throw new MaxPlayersError();
  }
  const supplyInfo = SupplyForPlayerCount(numPlayers, false);
  return {
    estates: supplyInfo.supply.estates,
    duchies: supplyInfo.supply.duchies,
    provinces: supplyInfo.supply.provinces,
    coppers: supplyInfo.supply.coppers,
    silvers: supplyInfo.supply.silvers,
    golds: supplyInfo.supply.golds,
    curses: curses ? supplyInfo.supply.curses : NOT_PRESENT,
  };
}
