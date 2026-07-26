import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { BaseResponse } from '../response/BaseResponse.js';
import type { HttpResponse } from '../client/types.js';

export class SignResponse extends BaseResponse {
  private documentId: string | null = null;
  private binaryBody: Buffer = Buffer.alloc(0);

  constructor(response: HttpResponse) {
    super(response);
    this.decodeBody();
    this.setErrors();
    this.setData();
  }

  protected decodeBody(): void {
    this.binaryBody = this.response.body;
    this.rawBody = this.response.bodyText();

    const contentType = (this.getHeader('Content-Type') ?? '').toLowerCase();
    const text = this.rawBody;
    const looksLikePdf = text.startsWith('%PDF');
    const trimmed = text.trimStart();
    const looksLikeJson = trimmed.startsWith('{') || trimmed.startsWith('[');

    if (looksLikeJson || (contentType.includes('json') && !looksLikePdf)) {
      try {
        this.decodedBody = JSON.parse(this.rawBody);
      } catch {
        this.decodedBody = null;
      }
      return;
    }

    this.decodedBody = null;
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
      } else {
        this._errors = null;
      }
      return;
    }

    if (
      this.decodedBody !== null &&
      typeof this.decodedBody === 'object' &&
      !Array.isArray(this.decodedBody)
    ) {
      const body = this.decodedBody as Record<string, unknown>;
      this._errors = body.error ?? body.message ?? 'Unknown error';
      return;
    }

    this._errors = this.rawBody !== '' ? this.rawBody : 'Unknown error';
  }

  protected setData(): void {
    if (!this.ok) {
      this._data = null;
      this.documentId = null;
      return;
    }
    this._data = this.binaryBody;
    this.documentId = this.extractDocumentId();
  }

  private extractDocumentId(): string | null {
    for (const header of [
      'id_dokumen',
      'id-dokumen',
      'Id_Dokumen',
      'ID_DOKUMEN',
    ]) {
      const value = this.getHeader(header);
      if (value) {
        return value;
      }
    }
    return null;
  }

  getDocumentId(): string | null {
    return this.documentId;
  }

  getBinary(): Buffer {
    return this.ok ? this.binaryBody : Buffer.alloc(0);
  }

  saveToFile(savePath: string): boolean {
    if (!this.ok) {
      return false;
    }
    try {
      mkdirSync(dirname(savePath), { recursive: true });
      writeFileSync(savePath, this.binaryBody);
      return true;
    } catch {
      return false;
    }
  }
}
