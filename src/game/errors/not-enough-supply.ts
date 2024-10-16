export class NotEnoughSupplyError extends Error {
  constructor(card: string) {
    super(`Not enough ${card} in supply`);
    this.name = 'NotEnoughSupplyError';
    Object.setPrototypeOf(this, NotEnoughSupplyError.prototype);
  }
}
