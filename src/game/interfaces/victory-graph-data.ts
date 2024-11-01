import { IGameSupply } from '@/game/interfaces/game-supply';

export interface IVictoryGraphData {
  playerScores: { [playerIndex: number]: number };
  supply: IGameSupply;
}
