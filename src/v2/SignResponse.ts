import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { BaseResponse } from '../response/BaseResponse.js';

export class SignResponse extends BaseResponse {
  private outputMap: string[] = [];

  constructor(response: ConstructorParameters<typeof BaseResponse>[0]) {
    super(response);
  }

  setOutputMap(map: string[]): this {
    this.outputMap = [...map];
    return this;
  }

  private asRecord(): Record<string, unknown> {
    return (this.data as Record<string, unknown> | null) ?? {};
  }

  getTimestamp(): string | null {
    return (this.asRecord().time as string | undefined) ?? null;
  }

  getFilesBase64(): string[] {
    const files = this.asRecord().file;
    return Array.isArray(files) ? files.map((f) => String(f)) : [];
  }

  getDecodedFiles(): Buffer[] {
    return this.getFilesBase64().map((b64) => {
      try {
        return Buffer.from(b64, 'base64');
      } catch {
        return Buffer.alloc(0);
      }
    });
  }

  getFileBase64(): string | null {
    const files = this.getFilesBase64();
    return files[0] ?? null;
  }

  getDecodedFile(): Buffer | null {
    const b64 = this.getFileBase64();
    if (b64 == null) {
      return null;
    }
    try {
      return Buffer.from(b64, 'base64');
    } catch {
      return null;
    }
  }

  saveToFile(savePath: string, index = 0): boolean {
    if (!this.ok) {
      return false;
    }
    const files = this.getDecodedFiles();
    const file = files[index];
    if (!file) {
      return false;
    }
    try {
      mkdirSync(dirname(savePath), { recursive: true });
      writeFileSync(savePath, file);
      return true;
    } catch {
      return false;
    }
  }

  saveAll(): string[] {
    if (!this.ok) {
      return [];
    }
    const files = this.getDecodedFiles();
    const saved: string[] = [];

    this.outputMap.forEach((targetPath, idx) => {
      const file = files[idx];
      if (!file) {
        return;
      }
      try {
        mkdirSync(dirname(targetPath), { recursive: true });
        writeFileSync(targetPath, file);
        saved.push(targetPath);
      } catch {
      }
    });

    return saved;
  }
}
