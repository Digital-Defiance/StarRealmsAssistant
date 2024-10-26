export class CountRequiredError extends Error {
  constructor() {
    super('count is required for this action');
    this.name = 'CountRequiredError';
    Object.setPrototypeOf(this, CountRequiredError.prototype);
  }
}
