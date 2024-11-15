import { IPlayerGameTurnDetails } from '@/game/interfaces/player-game-turn-details';
import { IAuthorityDetails } from '@/game/interfaces/authority-details';

export interface IPlayerGameDetails {
  authority: IAuthorityDetails;
  turn: IPlayerGameTurnDetails;
  newTurn: IPlayerGameTurnDetails;
}
