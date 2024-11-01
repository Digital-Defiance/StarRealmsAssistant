export class IncompatibleSaveError extends Error {
  constructor(saveVersion: string, gameVersion: string) {
    super(`Save version ${saveVersion} is incompatible with game version ${gameVersion}`);
    this.name = 'IncompatibleSaveError';
    Object.setPrototypeOf(this, IncompatibleSaveError.prototype);
  }
}
