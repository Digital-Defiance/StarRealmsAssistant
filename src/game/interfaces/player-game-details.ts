import { IMatDetails } from '@/game/interfaces/mat-details';
import { IPlayerGameTurnDetails } from '@/game/interfaces/player-game-turn-details';
import { IVictoryDetails } from '@/game/interfaces/victory-details';

export interface IPlayerGameDetails {
  victory: IVictoryDetails;
  mats: IMatDetails;
  turn: IPlayerGameTurnDetails;
  newTurn: IPlayerGameTurnDetails;
}
