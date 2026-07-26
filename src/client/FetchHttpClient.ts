import { ApiError } from '../errors/ApiError.js';
import type {
  HttpClient,
  HttpMethod,
  HttpResponse,
  JsonRequestOptions,
} from './types.js';

export class FetchHttpClient implements HttpClient {
  private readonly authHeader: string;
  private readonly timeoutMs: number;

  constructor(
    username: string,
    password: string,
    timeoutMs = 120_000,
  ) {
    this.authHeader =
      'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');
    this.timeoutMs = timeoutMs;
  }

  async request(
    method: HttpMethod,
    url: string,
    options: JsonRequestOptions = {},
  ): Promise<HttpResponse> {
    const headers: Record<string, string> = {
      Authorization: this.authHeader,
      ...(options.headers ?? {}),
    };

    let body: string | FormData | undefined;
    if (options.formData) {
      body = options.formData;
    } else if (options.json !== undefined) {
      body = JSON.stringify(options.json);
      if (!headers['Content-Type'] && !headers['content-type']) {
        headers['Content-Type'] = 'application/json';
      }
    }

    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      options.timeoutMs ?? this.timeoutMs,
    );

    try {
      const res = await fetch(url, {
        method,
        headers,
        body,
        signal: controller.signal,
      });

      const ab = await res.arrayBuffer();
      const buf = Buffer.from(ab);
      const responseHeaders: Record<string, string> = {};
      res.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      return {
        status: res.status,
        headers: responseHeaders,
        body: buf,
        bodyText() {
          return buf.toString('utf8');
        },
      };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unknown network error';
      throw new ApiError(`HTTP request failed: ${message}`, 0, null, {
        cause: err,
      });
    } finally {
      clearTimeout(timeout);
    }
  }
}
