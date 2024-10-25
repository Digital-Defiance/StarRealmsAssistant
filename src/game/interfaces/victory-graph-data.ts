import { IGameSupply } from '@/game/interfaces/game-supply';

export interface IVictoryGraphData {
  scoreByPlayer: { [playerIndex: number]: number };
  supply: IGameSupply;
}
