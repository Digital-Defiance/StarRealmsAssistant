import { MIN_PLAYERS } from '@/game/constants';

export class MinPlayersError extends Error {
  constructor() {
    super(`At least ${MIN_PLAYERS} players are required`);
    this.name = 'MinPlayersError';
    Object.setPrototypeOf(this, MinPlayersError.prototype);
  }
}
