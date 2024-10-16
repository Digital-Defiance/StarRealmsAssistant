export class InvalidLogSaveGameError extends Error {
  constructor() {
    super('The last log entry is not a SAVE_GAME event.');
    this.name = 'InvalidLogSaveGameError';
    Object.setPrototypeOf(this, InvalidLogSaveGameError.prototype);
  }
}
