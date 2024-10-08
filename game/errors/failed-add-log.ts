export class FailedAddLogEntryError extends Error {
  constructor() {
    super('Failed to add log entry');
    this.name = 'FailedAddLogEntryError';
    Object.setPrototypeOf(this, FailedAddLogEntryError.prototype);
  }
}
