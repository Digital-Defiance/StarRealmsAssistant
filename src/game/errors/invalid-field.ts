export class InvalidFieldError extends Error {
  constructor(fieldName: string, subfield?: string) {
    const message = subfield
      ? `Invalid ${fieldName} field: ${subfield}`
      : `Invalid field: ${fieldName}`;
    super(message);
    this.name = 'InvalidFieldError';
    Object.setPrototypeOf(this, InvalidFieldError.prototype);
  }
}
