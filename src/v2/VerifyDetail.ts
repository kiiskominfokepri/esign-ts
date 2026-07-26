export class VerifyDetail {
  private readonly detail: Record<string, unknown>;

  constructor(detail: Record<string, unknown>) {
    this.detail = detail;
  }

  getSignerName(): string | null {
    return (this.detail.signerName as string | undefined) ?? null;
  }

  getSignatureField(): string | null {
    return (this.detail.fieldName as string | undefined) ?? null;
  }

  getSignatureFormat(): string | null {
    return (this.detail.signatureFormat as string | undefined) ?? null;
  }

  getTimestampAuthority(): string | null {
    const info = this.detail.timestampInfomation as
      | Record<string, unknown>
      | undefined;
    return (info?.signerName as string | undefined) ?? null;
  }

  getTimestampDate(): string | null {
    const info = this.detail.timestampInfomation as
      | Record<string, unknown>
      | undefined;
    return (info?.timestampDate as string | undefined) ?? null;
  }

  isDocumentModified(): boolean {
    return Boolean(this.detail.modified ?? false);
  }

  isCertificateTrusted(): boolean {
    return Boolean(this.detail.certificateTrusted ?? false);
  }

  getCertLevelCode(): number | null {
    const v = this.detail.certLevelCode;
    return v !== undefined && v !== null ? Number(v) : null;
  }

  getSignatureDate(): string | null {
    return (this.detail.signatureDate as string | undefined) ?? null;
  }

  isIntegrityValid(): boolean {
    return Boolean(this.detail.integrityValid ?? false);
  }

  getRaw(): Record<string, unknown> {
    return this.detail;
  }
}
