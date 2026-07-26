import { FetchHttpClient } from './FetchHttpClient.js';
import type {
  EsignClientOptions,
  HttpClient,
  HttpMethod,
  HttpResponse,
  JsonRequestOptions,
} from './types.js';

export abstract class BaseClient {
  protected readonly httpClient: HttpClient;
  protected readonly baseUrl: string;
  private _nik: string | null = null;
  private _email: string | null = null;

  constructor(options: EsignClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, '');
    this._nik = options.nik ?? null;
    this._email = options.email ?? null;

    if (options.httpClient) {
      this.httpClient = options.httpClient;
    } else {
      this.httpClient = new FetchHttpClient(
        options.username,
        options.password,
        options.timeoutMs ?? 120_000,
      );
    }
  }

  get nik(): string | null {
    return this._nik;
  }

  set nik(value: string | null) {
    this._nik = value;
  }

  get email(): string | null {
    return this._email;
  }

  set email(value: string | null) {
    this._email = value;
  }

  /** @deprecated Prefer `client.nik = value` */
  setNIK(nik: string | null): this {
    this._nik = nik;
    return this;
  }

  /** @deprecated Prefer `client.nik` */
  getNIK(): string | null {
    return this._nik;
  }

  /** @deprecated Prefer `client.email = value` */
  setEmail(email: string | null): this {
    this._email = email;
    return this;
  }

  /** @deprecated Prefer `client.email` */
  getEmail(): string | null {
    return this._email;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  getHttpClient(): HttpClient {
    return this.httpClient;
  }

  protected async request(
    method: HttpMethod,
    uri: string,
    options: JsonRequestOptions = {},
  ): Promise<HttpResponse> {
    const url = uri.startsWith('http')
      ? uri
      : `${this.baseUrl}/${uri.replace(/^\/+/, '')}`;
    return this.httpClient.request(method, url, options);
  }

  protected post(
    uri: string,
    options: JsonRequestOptions = {},
  ): Promise<HttpResponse> {
    return this.request('POST', uri, options);
  }

  protected get(
    uri: string,
    options: JsonRequestOptions = {},
  ): Promise<HttpResponse> {
    return this.request('GET', uri, options);
  }
}
