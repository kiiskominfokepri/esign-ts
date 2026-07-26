import { parseDate, toAtomUtc } from '../support/dates.js';

export class VerifyDetail {
  private readonly detail: Record<string, unknown>;

  constructor(detail: Record<string, unknown>) {
    this.detail = detail;
  }

  getTimestampAuthority(): string | null {
    const info = this.detail.info_tsa as Record<string, unknown> | undefined;
    return (info?.name as string | undefined) ?? null;
  }

  getTsaCertValidity(): string | null {
    const info = this.detail.info_tsa as Record<string, unknown> | undefined;
    return (info?.tsa_cert_validity as string | undefined) ?? null;
  }

  getSignerName(): string | null {
    const info = this.detail.info_signer as Record<string, unknown> | undefined;
    return (info?.signer_name as string | undefined) ?? null;
  }

  getSignerCertValidity(): string | null {
    const info = this.detail.info_signer as Record<string, unknown> | undefined;
    return (info?.signer_cert_validity as string | undefined) ?? null;
  }

  getDocumentIntegrity(): boolean {
    const sig = this.detail.signature_document as
      | Record<string, unknown>
      | undefined;
    return Boolean(sig?.document_integrity ?? false);
  }

  getSignedIn(): string | null {
    const sig = this.detail.signature_document as
      | Record<string, unknown>
      | undefined;
    const raw = sig?.signed_in as string | undefined;
    return toAtomUtc(parseDate(raw, 'Y-m-d H:i:s.u'));
  }

  getSignatureField(): string | null {
    return (this.detail.signature_field as string | undefined) ?? null;
  }

  getRaw(): Record<string, unknown> {
    return this.detail;
  }
}
