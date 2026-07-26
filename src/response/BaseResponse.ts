import type { HttpHeaders, HttpResponse } from '../client/types.js';
import { getHeader } from '../client/types.js';

export abstract class BaseResponse {
  protected static readonly STATUS_OK = 200;

  protected _status: number;
  protected _errors: unknown = null;
  protected _data: unknown = null;
  protected decodedBody: unknown = null;
  protected rawBody = '';
  protected readonly response: HttpResponse;

  constructor(response: HttpResponse) {
    this.response = response;
    this._status = response.status;
    this.decodeBody();
    this.setErrors();
    this.setData();
  }

  protected decodeBody(): void {
    this.rawBody = this.response.bodyText();
    try {
      this.decodedBody = JSON.parse(this.rawBody);
    } catch {
      this.decodedBody = null;
    }
  }

  get status(): number {
    return this._status;
  }

  get ok(): boolean {
    return this._status === BaseResponse.STATUS_OK && this._errors === null;
  }

  get errors(): unknown {
    return this._errors;
  }

  get data(): unknown {
    return this._data;
  }

  get raw(): unknown {
    return this.decodedBody;
  }

  get rawBodyText(): string {
    return this.rawBody;
  }

  get httpResponse(): HttpResponse {
    return this.response;
  }

  /** @deprecated Prefer `response.status` */
  getStatus(): number {
    return this._status;
  }

  /** @deprecated Prefer `response.ok` */
  isSuccess(): boolean {
    return this.ok;
  }

  protected setErrors(): void {
    if (this._status === BaseResponse.STATUS_OK) {
      if (
        this.decodedBody !== null &&
        typeof this.decodedBody === 'object' &&
        !Array.isArray(this.decodedBody) &&
        'error' in (this.decodedBody as Record<string, unknown>)
      ) {
        this._errors = (this.decodedBody as Record<string, unknown>).error;
      }
      return;
    }

    if (
      this.decodedBody !== null &&
      typeof this.decodedBody === 'object' &&
      !Array.isArray(this.decodedBody)
    ) {
      const body = this.decodedBody as Record<string, unknown>;
      this._errors =
        body.error ??
        body.message ??
        body.status ??
        (this.rawBody || 'Unknown error');
      return;
    }

    this._errors = this.rawBody !== '' ? this.rawBody : 'Unknown error';
  }

  /** @deprecated Prefer `response.errors` */
  getErrors(): unknown {
    return this._errors;
  }

  protected setData(): void {
    if (this.ok) {
      this._data = this.decodedBody;
    }
  }

  /** @deprecated Prefer `response.data` */
  getData(): unknown {
    return this._data;
  }

  /** @deprecated Prefer `response.raw` */
  getRaw(): unknown {
    return this.decodedBody;
  }

  /** @deprecated Prefer `response.rawBodyText` */
  getRawBody(): string {
    return this.rawBody;
  }

  /** @deprecated Prefer `response.httpResponse` */
  getResponse(): HttpResponse {
    return this.response;
  }

  getHeader(name: string): string | null {
    return getHeader(this.response.headers as HttpHeaders, name);
  }
}
