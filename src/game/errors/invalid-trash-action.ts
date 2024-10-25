export class InvalidTrashActionError extends Error {
  constructor() {
    super('Trashing only applies to victory card removal actions');
    this.name = 'InvalidTrashActionError';
    Object.setPrototypeOf(this, InvalidTrashActionError.prototype);
  }
}
