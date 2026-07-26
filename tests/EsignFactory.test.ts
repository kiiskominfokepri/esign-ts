import { describe, expect, it } from 'vitest';
import {
  createEsignClient,
  EsignFactory,
} from '../src/EsignFactory.js';
import { InvalidArgumentError } from '../src/errors/InvalidArgumentError.js';
import { EsignClientV1 } from '../src/v1/EsignClient.js';
import { EsignClientV2 } from '../src/v2/EsignClient.js';

describe('EsignFactory / createEsignClient', () => {
  it('creates v1 and v2 clients via factory', () => {
    expect(EsignFactory.v1('https://x', 'u', 'p')).toBeInstanceOf(EsignClientV1);
    expect(EsignFactory.v2('https://x', 'u', 'p')).toBeInstanceOf(EsignClientV2);
    expect(EsignFactory.create('v1', 'https://x', 'u', 'p')).toBeInstanceOf(
      EsignClientV1,
    );
    expect(EsignFactory.create('2', 'https://x', 'u', 'p')).toBeInstanceOf(
      EsignClientV2,
    );
  });

  it('creates clients via createEsignClient options object', () => {
    const v1 = createEsignClient({
      version: 'v1',
      baseUrl: 'https://x',
      username: 'u',
      password: 'p',
      nik: '3200',
    });
    const v2 = createEsignClient({
      version: 'v2',
      baseUrl: 'https://x',
      username: 'u',
      password: 'p',
      email: 'a@b.c',
    });
    expect(v1).toBeInstanceOf(EsignClientV1);
    expect(v1.nik).toBe('3200');
    expect(v2).toBeInstanceOf(EsignClientV2);
    expect(v2.email).toBe('a@b.c');
  });

  it('supports direct constructor', () => {
    const client = new EsignClientV2({
      baseUrl: 'https://x',
      username: 'u',
      password: 'p',
      nik: '1',
      email: 'e@x.id',
    });
    expect(client.nik).toBe('1');
    expect(client.email).toBe('e@x.id');
    client.nik = '2';
    expect(client.nik).toBe('2');
  });

  it('rejects unsupported version', () => {
    expect(() => EsignFactory.create('v3', 'https://x', 'u', 'p')).toThrow(
      InvalidArgumentError,
    );
  });
});
