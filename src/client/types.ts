export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface HttpHeaders {
  [name: string]: string | string[] | undefined;
}

export interface HttpResponse {
  status: number;
  headers: HttpHeaders;
  body: Buffer;
  bodyText(): string;
}

export interface JsonRequestOptions {
  json?: unknown;
  headers?: Record<string, string>;
  formData?: FormData;
  timeoutMs?: number;
}

export interface HttpClient {
  request(
    method: HttpMethod,
    url: string,
    options?: JsonRequestOptions,
  ): Promise<HttpResponse>;
}

export interface EsignClientOptions {
  baseUrl: string;
  username: string;
  password: string;
  timeoutMs?: number;
  connectTimeoutMs?: number;
  httpClient?: HttpClient;
  nik?: string | null;
  email?: string | null;
}

export function getHeader(
  headers: HttpHeaders,
  name: string,
): string | null {
  const lower = name.toLowerCase();
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === lower) {
      if (Array.isArray(value)) {
        return value[0] ?? null;
      }
      return value ?? null;
    }
  }
  return null;
}
