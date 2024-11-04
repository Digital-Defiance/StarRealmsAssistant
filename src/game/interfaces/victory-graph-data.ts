import { IGameSupply } from '@/game/interfaces/game-supply';

export interface IVictoryGraphData {
  playerScores: Record<number, number>;
  supply: IGameSupply;
}
