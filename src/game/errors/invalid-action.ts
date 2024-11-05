import { GameLogAction } from '@/game/enumerations/game-log-action';

export class InvalidActionError extends Error {
  constructor(action: GameLogAction) {
    super(`Invalid action: ${action}`);
    this.name = 'InvalidActionError';
    Object.setPrototypeOf(this, InvalidActionError.prototype);
  }
}
