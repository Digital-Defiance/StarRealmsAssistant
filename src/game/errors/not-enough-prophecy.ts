export class NotEnoughProphecyError extends Error {
  constructor() {
    super('Not enough prophecy suns to remove');
    this.name = 'NotEnoughProphecyError';
    Object.setPrototypeOf(this, NotEnoughProphecyError.prototype);
  }
}
