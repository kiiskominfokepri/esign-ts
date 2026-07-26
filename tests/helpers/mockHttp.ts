import type {
  HttpClient,
  HttpMethod,
  HttpResponse,
  JsonRequestOptions,
} from '../../src/client/types.js';

export type RecordedRequest = {
  method: HttpMethod;
  url: string;
  options: JsonRequestOptions;
};

export function createMockHttp(
  responses: Array<Partial<HttpResponse> & { status: number; body: Buffer | string }>,
): { client: HttpClient; history: RecordedRequest[] } {
  const history: RecordedRequest[] = [];
  const queue = [...responses];

  const client: HttpClient = {
    async request(method, url, options = {}) {
      history.push({ method, url, options });
      const next = queue.shift();
      if (!next) {
        throw new Error('Mock HTTP queue empty');
      }
      const body =
        typeof next.body === 'string' ? Buffer.from(next.body) : next.body;
      return {
        status: next.status,
        headers: next.headers ?? { 'content-type': 'application/json' },
        body,
        bodyText() {
          return body.toString('utf8');
        },
      };
    },
  };

  return { client, history };
}

export function jsonBody(data: unknown, status = 200): {
  status: number;
  body: Buffer;
  headers: Record<string, string>;
} {
  return {
    status,
    body: Buffer.from(JSON.stringify(data)),
    headers: { 'content-type': 'application/json' },
  };
}
