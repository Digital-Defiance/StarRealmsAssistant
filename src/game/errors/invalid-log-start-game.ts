export class InvalidLogStartGameError extends Error {
  constructor() {
    super('The first log entry is not a START_GAME event.');
    this.name = 'InvalidLogStartGameError';
    Object.setPrototypeOf(this, InvalidLogStartGameError.prototype);
  }
}
