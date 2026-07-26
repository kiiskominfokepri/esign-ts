import { EsignError } from './EsignError.js';

export class FileNotFoundError extends EsignError {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'FileNotFoundError';
  }

  static forPath(path: string): FileNotFoundError {
    return new FileNotFoundError(`File not found: ${path}`);
  }
}
