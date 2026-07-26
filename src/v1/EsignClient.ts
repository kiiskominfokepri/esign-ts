import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { BaseClient } from '../client/BaseClient.js';
import type { EsignClientOptions } from '../client/types.js';
import { VisibleSignOptions } from '../dto/VisibleSignOptions.js';
import { InvalidArgumentError } from '../errors/InvalidArgumentError.js';
import { JsonResponse } from '../response/JsonResponse.js';
import { FileHelper } from '../support/FileHelper.js';
import { SignResponse } from './SignResponse.js';
import { VerifyResponse } from './VerifyResponse.js';

export class EsignClientV1 extends BaseClient {
  constructor(options: EsignClientOptions) {
    super(options);
  }

  async signInvisible(
    passphrase: string,
    filePath: string,
    fileName?: string | null,
    nik?: string | null,
  ): Promise<SignResponse> {
    return this.signPdf(passphrase, filePath, fileName, 'invisible', null, nik);
  }

  async signVisible(
    passphrase: string,
    filePath: string,
    options: VisibleSignOptions,
    fileName?: string | null,
    nik?: string | null,
  ): Promise<SignResponse> {
    return this.signPdf(
      passphrase,
      filePath,
      fileName,
      'visible',
      options,
      nik,
    );
  }

  async sign(
    passphrase: string,
    filePath: string,
    tampilan: 'invisible' | 'visible' = 'invisible',
    options: VisibleSignOptions | null = null,
    fileName?: string | null,
    nik?: string | null,
  ): Promise<SignResponse> {
    const t = tampilan.toLowerCase() as 'invisible' | 'visible';
    if (t !== 'invisible' && t !== 'visible') {
      throw new InvalidArgumentError('tampilan must be "invisible" or "visible"');
    }
    if (t === 'visible' && options == null) {
      throw new InvalidArgumentError(
        'VisibleSignOptions is required when tampilan=visible',
      );
    }
    return this.signPdf(passphrase, filePath, fileName, t, options, nik);
  }

  private async signPdf(
    passphrase: string,
    filePath: string,
    fileName: string | null | undefined,
    tampilan: string,
    options: VisibleSignOptions | null,
    nik: string | null | undefined,
  ): Promise<SignResponse> {
    const resolvedNik = nik ?? this.nik;
    if (!resolvedNik) {
      throw new InvalidArgumentError(
        'NIK is required. Set client.nik or pass nik.',
      );
    }

    FileHelper.assertReadable(filePath);
    const name = FileHelper.basename(filePath, fileName);

    const form = new FormData();
    form.append('nik', resolvedNik);
    form.append('passphrase', passphrase);
    form.append('tampilan', tampilan);
    form.append('file', FileHelper.toBlob(filePath, 'application/pdf'), name);

    if (tampilan === 'visible' && options) {
      options.appendToFormData(form);
    }

    const response = await this.post('/api/sign/pdf', { formData: form });
    return new SignResponse(response);
  }

  async downloadDocument(idDokumen: string, savePath: string): Promise<boolean> {
    const response = await this.get(
      `/api/sign/download/${encodeURIComponent(idDokumen)}`,
    );

    if (response.status !== 200) {
      return false;
    }

    try {
      mkdirSync(dirname(savePath), { recursive: true });
      writeFileSync(savePath, response.body);
      return true;
    } catch {
      return false;
    }
  }

  async downloadDocumentBinary(idDokumen: string): Promise<SignResponse> {
    const response = await this.get(
      `/api/sign/download/${encodeURIComponent(idDokumen)}`,
    );
    return new SignResponse(response);
  }

  async signVerification(
    filePath: string,
    fileName?: string | null,
  ): Promise<VerifyResponse> {
    FileHelper.assertReadable(filePath);
    const name = FileHelper.basename(filePath, fileName);

    const form = new FormData();
    form.append(
      'signed_file',
      FileHelper.toBlob(filePath, 'application/pdf'),
      name,
    );

    const response = await this.post('/api/sign/verify', { formData: form });
    return new VerifyResponse(response);
  }

  async checkUserStatus(nik: string): Promise<JsonResponse> {
    const response = await this.get(
      `/api/user/status/${encodeURIComponent(nik)}`,
    );
    return new JsonResponse(response);
  }
}

export { EsignClientV1 as Esign };
