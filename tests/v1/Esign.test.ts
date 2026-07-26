import { mkdtempSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { VisibleSignOptions } from '../../src/dto/VisibleSignOptions.js';
import { InvalidArgumentError } from '../../src/errors/InvalidArgumentError.js';
import { EsignClientV1 } from '../../src/v1/EsignClient.js';
import { createMockHttp, jsonBody } from '../helpers/mockHttp.js';

describe('EsignClientV1', () => {
  let samplePdf: string;
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'esign-v1-'));
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
    esign: EsignClientV1;
    history: ReturnType<typeof createMockHttp>['history'];
  } {
    const { client: http, history } = createMockHttp(responses);
    const esign = new EsignClientV1({
      baseUrl: 'https://esign.test',
      username: 'user',
      password: 'pass',
      httpClient: http,
      nik: '3200123456789012',
    });
    return { esign, history };
  }

  it('signInvisible returns binary PDF and document id header', async () => {
    const pdf = '%PDF-1.4 signed-v1';
    const { esign, history } = client([
      {
        status: 200,
        body: Buffer.from(pdf),
        headers: {
          'content-type': 'application/pdf',
          id_dokumen: 'DOC-123',
        },
      },
    ]);

    const response = await esign.signInvisible('secret', samplePdf);
    expect(response.ok).toBe(true);
    expect(response.getBinary().toString()).toBe(pdf);
    expect(response.getDocumentId()).toBe('DOC-123');
    expect(history[0]!.url).toContain('/api/sign/pdf');
    expect(history[0]!.options.formData).toBeInstanceOf(FormData);
  });

  it('signVisible with image options', async () => {
    const image = join(tempDir, 'ttd.png');
    writeFileSync(image, 'PNGDATA');

    const { esign, history } = client([
      {
        status: 200,
        body: Buffer.from('%PDF'),
        headers: { 'content-type': 'application/pdf' },
      },
    ]);

    const options = VisibleSignOptions.withImage(image, 1, 10, 20, 100, 50)
      .withReason('OK')
      .withLocation('TPI');

    const response = await esign.signVisible('secret', samplePdf, options);
    expect(response.ok).toBe(true);
    expect(history[0]!.options.formData).toBeInstanceOf(FormData);
  });

  it('requires NIK', async () => {
    const { client: http } = createMockHttp([]);
    const esign = new EsignClientV1({
      baseUrl: 'https://esign.test',
      username: 'u',
      password: 'p',
      httpClient: http,
    });

    await expect(esign.signInvisible('x', samplePdf)).rejects.toBeInstanceOf(
      InvalidArgumentError,
    );
  });

  it('signVerification parses details', async () => {
    const { esign } = client([
      jsonBody({
        nama_dokumen: 'doc.pdf',
        jumlah_signature: 1,
        summary: 'OK',
        notes: 'fine',
        details: [
          {
            info_tsa: { name: 'TSA', tsa_cert_validity: '2025' },
            info_signer: {
              signer_name: 'Budi',
              signer_cert_validity: '2026',
            },
            signature_document: {
              document_integrity: true,
              signed_in: '2024-01-01 10:00:00.000000',
            },
            signature_field: 'Sig1',
          },
        ],
      }),
    ]);

    const verify = await esign.signVerification(samplePdf);
    expect(verify.ok).toBe(true);
    expect(verify.getDocumentName()).toBe('doc.pdf');
    expect(verify.getSignatureCounts()).toBe(1);
    expect(verify.getDetails()[0]?.getSignerName()).toBe('Budi');
    expect(verify.getDetails()[0]?.getDocumentIntegrity()).toBe(true);
  });

  it('checkUserStatus hits path with nik', async () => {
    const { esign, history } = client([jsonBody({ status: 'ISSUE' })]);
    const res = await esign.checkUserStatus('3200123456789012');
    expect(res.ok).toBe(true);
    expect(history[0]!.url).toContain('/api/user/status/3200123456789012');
  });
});
