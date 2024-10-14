import { MAX_PLAYERS, MIN_PLAYERS, NOT_PRESENT } from '@/game/constants';
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
  return {
    estates: numPlayers <= 2 ? 8 : 12,
    duchies: numPlayers <= 2 ? 8 : 12,
    provinces: numPlayers <= 2 ? 8 : numPlayers <= 4 ? 12 : 15,
    coppers: 60 - 7 * numPlayers,
    silvers: 40,
    golds: 30,
    curses: curses ? 10 * (numPlayers - 1) : NOT_PRESENT,
  };
}
