import { MAX_PLAYERS } from '@/game/constants';

export class MaxPlayersError extends Error {
  constructor() {
    super(`Only up to ${MAX_PLAYERS} players are required`);
    this.name = 'MaxPlayersError';
    Object.setPrototypeOf(this, MaxPlayersError.prototype);
  }
}
