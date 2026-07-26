import { BaseResponse } from '../response/BaseResponse.js';
import { VerifyDetail } from './VerifyDetail.js';

export class VerifyResponse extends BaseResponse {
  private asRecord(): Record<string, unknown> {
    return (this.data as Record<string, unknown> | null) ?? {};
  }

  getDocumentName(): string | null {
    return (this.asRecord().nama_dokumen as string | undefined) ?? null;
  }

  getSignatureCounts(): number | null {
    const v = this.asRecord().jumlah_signature;
    return v !== undefined && v !== null ? Number(v) : null;
  }

  getNotes(): unknown {
    return this.asRecord().notes ?? null;
  }

  getDetails(): VerifyDetail[] {
    const details = this.asRecord().details;
    if (!Array.isArray(details)) {
      return [];
    }
    return details.map(
      (d) =>
        new VerifyDetail(
          d && typeof d === 'object' && !Array.isArray(d)
            ? (d as Record<string, unknown>)
            : {},
        ),
    );
  }

  getSummary(): string | null {
    return (this.asRecord().summary as string | undefined) ?? null;
  }

  getSigners(): Array<string | null> {
    return this.getDetails().map((d) => d.getSignerName());
  }
}
