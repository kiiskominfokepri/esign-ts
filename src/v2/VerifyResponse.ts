import { BaseResponse } from '../response/BaseResponse.js';
import { VerifyDetail } from './VerifyDetail.js';

export class VerifyResponse extends BaseResponse {
  private asRecord(): Record<string, unknown> {
    return (this.data as Record<string, unknown> | null) ?? {};
  }

  getConclusion(): string | null {
    return (this.asRecord().conclusion as string | undefined) ?? null;
  }

  getDescription(): string | null {
    return (this.asRecord().description as string | undefined) ?? null;
  }

  getSignatureCounts(): number | null {
    const infos = this.asRecord().signatureInformations;
    if (!Array.isArray(infos)) {
      return null;
    }
    return infos.length;
  }

  getDetails(): VerifyDetail[] {
    const details = this.asRecord().signatureInformations;
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

  getSigners(): Array<string | null> {
    return this.getDetails().map((d) => d.getSignerName());
  }

  getRaw(): Record<string, unknown> {
    return this.asRecord();
  }
}
