import { EsignError } from './EsignError.js';

export class InvalidArgumentError extends EsignError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'InvalidArgumentError';
  }
}
