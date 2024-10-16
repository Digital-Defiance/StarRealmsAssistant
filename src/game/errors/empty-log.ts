export class EmptyLogError extends Error {
  constructor() {
    super('Log is empty');
    this.name = 'EmptyLogError';
    Object.setPrototypeOf(this, EmptyLogError.prototype);
  }
}
