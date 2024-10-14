import { PlayerFieldMap } from '@/game/types';

export class NotEnoughSubfieldError<T extends keyof PlayerFieldMap> extends Error {
  constructor(field: T, subfield: PlayerFieldMap[T]) {
    const message = `Not enough ${subfield} in ${field} field`;
    super(message);
    this.name = 'NotEnoughSubfieldError';
    Object.setPrototypeOf(this, NotEnoughSubfieldError.prototype);
  }
}
