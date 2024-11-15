export interface IGameOptions {
  trackCardCounts: boolean;
  trackCardGains: boolean;
  trackDiscard: boolean;
  startingAuthorityByPlayerIndex: Record<number, number>;
  startingCardsByPlayerIndex: Record<number, number>;
}
