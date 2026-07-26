import { FileHelper } from '../support/FileHelper.js';
import { InvalidArgumentError } from '../errors/InvalidArgumentError.js';

export type SignaturePropertiesPayload = Record<string, unknown>;

export class SignatureProperties {
  static readonly TAMPILAN_INVISIBLE = 'INVISIBLE' as const;
  static readonly TAMPILAN_VISIBLE = 'VISIBLE' as const;

  private tampilan: string;
  private imageBase64: string | null = null;
  private page: number | null = null;
  private originX: number | null = null;
  private originY: number | null = null;
  private width: number | null = null;
  private height: number | null = null;
  private tagKoordinat: string | null = null;
  private location: string | null = null;
  private reason: string | null = null;
  private pdfPassword: string | null = null;

  private constructor(tampilan: string) {
    this.tampilan = tampilan.toUpperCase();
  }

  static invisible(
    reason: string | null = null,
    location: string | null = null,
    pdfPassword: string | null = null,
  ): SignatureProperties {
    const props = new SignatureProperties(SignatureProperties.TAMPILAN_INVISIBLE);
    props.reason = reason ?? '';
    props.location = location;
    props.pdfPassword = pdfPassword;
    return props;
  }

  static visible(
    imagePathOrBase64: string,
    page: number,
    originX: number,
    originY: number,
    width: number,
    height: number,
    isFilePath = true,
  ): SignatureProperties {
    const props = new SignatureProperties(SignatureProperties.TAMPILAN_VISIBLE);
    props.imageBase64 = isFilePath
      ? FileHelper.toBase64(imagePathOrBase64)
      : imagePathOrBase64;
    props.page = page;
    props.originX = originX;
    props.originY = originY;
    props.width = width;
    props.height = height;
    return props;
  }

  static visibleWithTag(
    tagKoordinat: string,
    imagePathOrBase64: string | null = null,
    isFilePath = true,
  ): SignatureProperties {
    const props = new SignatureProperties(SignatureProperties.TAMPILAN_VISIBLE);
    props.tagKoordinat = tagKoordinat;
    if (imagePathOrBase64 != null) {
      props.imageBase64 = isFilePath
        ? FileHelper.toBase64(imagePathOrBase64)
        : imagePathOrBase64;
    }
    return props;
  }

  withReason(reason: string | null): SignatureProperties {
    const clone = this.clone();
    clone.reason = reason;
    return clone;
  }

  withLocation(location: string | null): SignatureProperties {
    const clone = this.clone();
    clone.location = location;
    return clone;
  }

  withPdfPassword(password: string | null): SignatureProperties {
    const clone = this.clone();
    clone.pdfPassword = password;
    return clone;
  }

  withTagKoordinat(tag: string | null): SignatureProperties {
    const clone = this.clone();
    clone.tagKoordinat = tag;
    return clone;
  }

  toArray(): SignaturePropertiesPayload {
    const data: SignaturePropertiesPayload = {
      tampilan: this.tampilan,
    };

    if (this.tampilan === SignatureProperties.TAMPILAN_VISIBLE) {
      if (this.imageBase64 != null) {
        data.imageBase64 = this.imageBase64;
      }
      if (this.page != null) {
        data.page = this.page;
      }
      if (this.originX != null) {
        data.originX = this.originX;
      }
      if (this.originY != null) {
        data.originY = this.originY;
      }
      if (this.width != null) {
        data.width = this.width;
      }
      if (this.height != null) {
        data.height = this.height;
      }
    }

    if (this.tagKoordinat != null) {
      data.tag_koordinat = this.tagKoordinat;
    }

    data.location = this.location;
    data.reason = this.reason ?? '';

    if (this.pdfPassword != null && this.pdfPassword !== '') {
      data.pdfPassword = this.pdfPassword;
    }

    return data;
  }

  static normalizeList(
    items: Array<SignatureProperties | SignaturePropertiesPayload>,
  ): SignaturePropertiesPayload[] {
    if (items.length === 0) {
      throw new InvalidArgumentError(
        'At least one signatureProperties entry is required',
      );
    }

    return items.map((item) => {
      if (item instanceof SignatureProperties) {
        return item.toArray();
      }
      if (item && typeof item === 'object') {
        return item;
      }
      throw new InvalidArgumentError(
        'signatureProperties items must be SignatureProperties or object',
      );
    });
  }

  private clone(): SignatureProperties {
    const c = new SignatureProperties(this.tampilan);
    c.imageBase64 = this.imageBase64;
    c.page = this.page;
    c.originX = this.originX;
    c.originY = this.originY;
    c.width = this.width;
    c.height = this.height;
    c.tagKoordinat = this.tagKoordinat;
    c.location = this.location;
    c.reason = this.reason;
    c.pdfPassword = this.pdfPassword;
    return c;
  }
}
