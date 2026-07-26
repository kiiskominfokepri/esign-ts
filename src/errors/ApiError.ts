import { EsignError } from './EsignError.js';

export class ApiError extends EsignError {
  readonly httpStatus: number;
  readonly responseBody: unknown;

  constructor(
    message: string,
    httpStatus = 0,
    responseBody: unknown = null,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'ApiError';
    this.httpStatus = httpStatus;
    this.responseBody = responseBody;
  }

  getHttpStatus(): number {
    return this.httpStatus;
  }

  getResponseBody(): unknown {
    return this.responseBody;
  }
}
