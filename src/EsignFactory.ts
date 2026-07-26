import type { EsignClientOptions, HttpClient } from './client/types.js';
import { InvalidArgumentError } from './errors/InvalidArgumentError.js';
import { EsignClientV1 } from './v1/EsignClient.js';
import { EsignClientV2 } from './v2/EsignClient.js';

export type ApiVersion = 'v1' | 'v2' | '1' | '2';

export type FactoryOptions = {
  timeoutMs?: number;
  connectTimeoutMs?: number;
  httpClient?: HttpClient;
  nik?: string | null;
  email?: string | null;
};

export type CreateEsignClientOptions = {
  version: ApiVersion;
  baseUrl: string;
  username: string;
  password: string;
  timeoutMs?: number;
  connectTimeoutMs?: number;
  httpClient?: HttpClient;
  nik?: string | null;
  email?: string | null;
};

function buildOptions(
  url: string,
  username: string,
  password: string,
  options: FactoryOptions = {},
): EsignClientOptions {
  return {
    baseUrl: url,
    username,
    password,
    timeoutMs: options.timeoutMs,
    connectTimeoutMs: options.connectTimeoutMs,
    httpClient: options.httpClient,
    nik: options.nik,
    email: options.email,
  };
}

export function createEsignClient(
  options: CreateEsignClientOptions & { version: 'v1' | '1' },
): EsignClientV1;
export function createEsignClient(
  options: CreateEsignClientOptions & { version: 'v2' | '2' },
): EsignClientV2;
export function createEsignClient(
  options: CreateEsignClientOptions,
): EsignClientV1 | EsignClientV2 {
  const { version, baseUrl, username, password, ...rest } = options;
  return EsignFactory.create(version, baseUrl, username, password, rest);
}

export class EsignFactory {
  static readonly VERSION_1 = 'v1' as const;
  static readonly VERSION_2 = 'v2' as const;

  static create(
    version: string,
    url: string,
    username: string,
    password: string,
    options: FactoryOptions = {},
  ): EsignClientV1 | EsignClientV2 {
    const v = version.toLowerCase();
    if (v === EsignFactory.VERSION_1 || v === '1') {
      return EsignFactory.v1(url, username, password, options);
    }
    if (v === EsignFactory.VERSION_2 || v === '2') {
      return EsignFactory.v2(url, username, password, options);
    }
    throw new InvalidArgumentError(
      `Unsupported API version "${version}". Use v1 or v2.`,
    );
  }

  static v1(
    url: string,
    username: string,
    password: string,
    options: FactoryOptions = {},
  ): EsignClientV1 {
    return new EsignClientV1(buildOptions(url, username, password, options));
  }

  static v2(
    url: string,
    username: string,
    password: string,
    options: FactoryOptions = {},
  ): EsignClientV2 {
    return new EsignClientV2(buildOptions(url, username, password, options));
  }
}
