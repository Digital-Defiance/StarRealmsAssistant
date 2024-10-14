export class InvalidNumberPlayersError extends Error {
  constructor() {
    super('Invalid number of players');
    this.name = 'InvalidNumberPlayersError';
    Object.setPrototypeOf(this, InvalidNumberPlayersError.prototype);
  }
}
