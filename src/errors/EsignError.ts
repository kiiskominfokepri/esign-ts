export class EsignError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'EsignError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
