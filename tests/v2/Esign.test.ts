import { mkdtempSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SignatureProperties } from '../../src/dto/SignatureProperties.js';
import { EsignClientV2 } from '../../src/v2/EsignClient.js';
import { createMockHttp, jsonBody } from '../helpers/mockHttp.js';

describe('EsignClientV2', () => {
  let samplePdf: string;
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'esign-v2-'));
    samplePdf = join(tempDir, 'doc.pdf');
    writeFileSync(samplePdf, '%PDF-1.4 test');
  });

  afterEach(() => {
    try {
      unlinkSync(samplePdf);
    } catch {
    }
  });

  function client(
    responses: Parameters<typeof createMockHttp>[0],
  ): {
    esign: EsignClientV2;
    history: ReturnType<typeof createMockHttp>['history'];
  } {
    const { client: http, history } = createMockHttp(responses);
    const esign = new EsignClientV2({
      baseUrl: 'https://esign.test',
      username: 'user',
      password: 'pass',
      httpClient: http,
      nik: '3200123456789012',
      email: 'user@example.go.id',
    });
    return { esign, history };
  }

  it('signInvisible sends JSON payload', async () => {
    const { esign, history } = client([
      jsonBody({
        time: '2024-01-01T00:00:00Z',
        file: [Buffer.from('%PDF-1.4 signed').toString('base64')],
      }),
    ]);

    const response = await esign.signInvisible('secret', samplePdf);

    expect(response.ok).toBe(true);
    expect(response.getTimestamp()).toBe('2024-01-01T00:00:00Z');
    expect(response.getDecodedFile()?.toString()).toBe('%PDF-1.4 signed');

    const req = history[0]!;
    expect(req.url).toContain('/api/v2/sign/pdf');
    const payload = req.options.json as Record<string, unknown>;
    expect(payload.nik).toBe('3200123456789012');
    expect(payload.email).toBe('user@example.go.id');
    expect(payload.passphrase).toBe('secret');
    const props = payload.signatureProperties as Array<Record<string, unknown>>;
    expect(props[0]?.tampilan).toBe('INVISIBLE');
    expect(Array.isArray(payload.file)).toBe(true);
    expect((payload.file as string[]).length).toBe(1);
  });

  it('signVisible includes imageBase64 and coordinates', async () => {
    const image = join(tempDir, 'ttd.png');
    writeFileSync(image, 'PNGDATA');

    const { esign, history } = client([
      jsonBody({ file: [Buffer.from('%PDF').toString('base64')] }),
    ]);

    const props = SignatureProperties.visible(image, 2, 11, 22, 100, 50).withReason(
      'Approve',
    );
    const response = await esign.signVisible('secret', samplePdf, props);
    expect(response.ok).toBe(true);

    const payload = history[0]!.options.json as Record<string, unknown>;
    const sp = (payload.signatureProperties as Array<Record<string, unknown>>)[0]!;
    expect(sp.tampilan).toBe('VISIBLE');
    expect(sp.imageBase64).toBe(Buffer.from('PNGDATA').toString('base64'));
    expect(sp.page).toBe(2);
    expect(sp.originX).toBe(11);
    expect(sp.reason).toBe('Approve');
  });

  it('bulk sign maps outputs', async () => {
    const second = join(tempDir, 'b.pdf');
    writeFileSync(second, '%PDF-1.4 b');
    const out1 = join(tempDir, 'out1.pdf');
    const out2 = join(tempDir, 'out2.pdf');

    const { esign } = client([
      jsonBody({
        file: [
          Buffer.from('%PDF A').toString('base64'),
          Buffer.from('%PDF B').toString('base64'),
        ],
      }),
    ]);

    const response = await esign.signInvisibleMultiple('secret', {
      [samplePdf]: out1,
      [second]: out2,
    });

    const saved = response.saveAll();
    expect(saved).toEqual([out1, out2]);
    expect(readFileSync(out1, 'utf8')).toBe('%PDF A');
    expect(readFileSync(out2, 'utf8')).toBe('%PDF B');
  });

  it('requestSignTotp', async () => {
    const { esign, history } = client([jsonBody({ message: 'OTP sent' })]);
    const response = await esign.requestSignTotp(null, null, 2);
    expect(response.ok).toBe(true);
    const payload = history[0]!.options.json as Record<string, unknown>;
    expect(payload.data).toBe(2);
    expect(history[0]!.url).toContain('/api/v2/sign/get/totp');
  });

  it('checkUserStatus canSign', async () => {
    const { esign } = client([jsonBody({ status: 'ISSUE' })]);
    const response = await esign.checkUserStatus();
    expect(response.ok).toBe(true);
    expect(response.userStatus).toBe('ISSUE');
    expect(response.canSign()).toBe(true);
  });

  it('sealPdf', async () => {
    const { esign, history } = client([
      jsonBody({ file: [Buffer.from('%PDF seal').toString('base64')] }),
    ]);

    const response = await esign.sealPdf('SUB-1', '123456', [samplePdf], [
      SignatureProperties.invisible(),
    ]);
    expect(response.ok).toBe(true);
    const payload = history[0]!.options.json as Record<string, unknown>;
    expect(payload.idSubscriber).toBe('SUB-1');
    expect(payload.totp).toBe('123456');
    expect(history[0]!.url).toContain('/api/v2/seal/pdf');
  });

  it('verify camelCase fields', async () => {
    const { esign } = client([
      jsonBody({
        documentName: 'a.pdf',
        signatureCount: 1,
        conclusion: 'VALID',
        description: 'ok',
        signatureInformations: [
          {
            signerName: 'Ani',
            fieldName: 'Sig1',
            integrityValid: true,
            timestampInfomation: {
              signerName: 'TSA',
              timestampDate: '2024-01-01',
            },
          },
        ],
      }),
    ]);

    const verify = await esign.signVerification(samplePdf);
    expect(verify.ok).toBe(true);
    expect(verify.getConclusion()).toBe('VALID');
    expect(verify.getDescription()).toBe('ok');
    expect(verify.getSignatureCounts()).toBe(1);
    expect(verify.getDetails()[0]?.getSignerName()).toBe('Ani');
    expect(verify.getDetails()[0]?.getTimestampAuthority()).toBe('TSA');
    expect(verify.getDetails()[0]?.isIntegrityValid()).toBe(true);
  });
});
