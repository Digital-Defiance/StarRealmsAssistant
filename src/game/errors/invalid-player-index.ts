export class InvalidPlayerIndexError extends Error {
  constructor(index: number, message?: string) {
    super(message ?? `Invalid player index: ${index}`);
    this.name = 'InvalidPlayerIndexError';
    Object.setPrototypeOf(this, InvalidPlayerIndexError.prototype);
  }
}
