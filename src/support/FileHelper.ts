import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { basename as pathBasename } from 'node:path';
import type { ReadStream } from 'node:fs';
import { FileNotFoundError } from '../errors/FileNotFoundError.js';
import { InvalidArgumentError } from '../errors/InvalidArgumentError.js';

const MIME_BY_EXT: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.bmp': 'image/bmp',
};

function extOf(path: string): string {
  const idx = path.lastIndexOf('.');
  return idx >= 0 ? path.slice(idx).toLowerCase() : '';
}

export class FileHelper {
  static assertReadable(path: string): void {
    try {
      if (!existsSync(path) || !statSync(path).isFile()) {
        throw FileNotFoundError.forPath(path);
      }
      readFileSync(path, { flag: 'r' });
    } catch (err) {
      if (err instanceof FileNotFoundError) {
        throw err;
      }
      throw FileNotFoundError.forPath(path);
    }
  }

  static readBinary(path: string): Buffer {
    this.assertReadable(path);
    try {
      return readFileSync(path);
    } catch {
      throw new InvalidArgumentError(`Unable to read file: ${path}`);
    }
  }

  static toBase64(path: string): string {
    return this.readBinary(path).toString('base64');
  }

  static basename(path: string, override?: string | null): string {
    return override ?? pathBasename(path);
  }

  static mimeType(path: string): string {
    this.assertReadable(path);
    return MIME_BY_EXT[extOf(path)] ?? 'application/octet-stream';
  }

  static openReadStream(path: string): ReadStream {
    this.assertReadable(path);
    try {
      return createReadStream(path);
    } catch {
      throw new InvalidArgumentError(`Unable to open file: ${path}`);
    }
  }

  static toBlob(path: string, mime?: string): Blob {
    const buf = this.readBinary(path);
    return new Blob([buf], { type: mime ?? this.mimeType(path) });
  }
}
