import { FileHelper } from '../support/FileHelper.js';
import { InvalidArgumentError } from '../errors/InvalidArgumentError.js';

export type VisibleSignMode = 'image' | 'qr' | 'tag';

export class VisibleSignOptions {
  static readonly MODE_IMAGE = 'image' as const;
  static readonly MODE_QR = 'qr' as const;
  static readonly MODE_TAG = 'tag' as const;

  private mode: VisibleSignMode;
  private imagePath: string | null = null;
  private linkQr: string | null = null;
  private tagKoordinat: string | null = null;
  private page: number | null = null;
  private xAxis: number | null = null;
  private yAxis: number | null = null;
  private width: number | null = null;
  private height: number | null = null;
  private reason: string | null = null;
  private location: string | null = null;
  private text: string | null = null;

  private constructor(mode: VisibleSignMode) {
    this.mode = mode;
  }

  static withImage(
    imagePath: string,
    page: number,
    xAxis: number,
    yAxis: number,
    width: number,
    height: number,
  ): VisibleSignOptions {
    FileHelper.assertReadable(imagePath);
    const opts = new VisibleSignOptions(VisibleSignOptions.MODE_IMAGE);
    opts.imagePath = imagePath;
    opts.page = page;
    opts.xAxis = xAxis;
    opts.yAxis = yAxis;
    opts.width = width;
    opts.height = height;
    return opts;
  }

  static withQr(
    linkQr: string,
    page: number,
    xAxis: number,
    yAxis: number,
    width: number,
    height: number,
  ): VisibleSignOptions {
    const opts = new VisibleSignOptions(VisibleSignOptions.MODE_QR);
    opts.linkQr = linkQr;
    opts.page = page;
    opts.xAxis = xAxis;
    opts.yAxis = yAxis;
    opts.width = width;
    opts.height = height;
    return opts;
  }

  static withTag(tagKoordinat: string): VisibleSignOptions {
    const opts = new VisibleSignOptions(VisibleSignOptions.MODE_TAG);
    opts.tagKoordinat = tagKoordinat;
    return opts;
  }

  withTagKoordinat(tag: string): VisibleSignOptions {
    const clone = this.clone();
    clone.tagKoordinat = tag;
    return clone;
  }

  withReason(reason: string | null): VisibleSignOptions {
    const clone = this.clone();
    clone.reason = reason;
    return clone;
  }

  withLocation(location: string | null): VisibleSignOptions {
    const clone = this.clone();
    clone.location = location;
    return clone;
  }

  withText(text: string | null): VisibleSignOptions {
    const clone = this.clone();
    clone.text = text;
    return clone;
  }

  getMode(): VisibleSignMode {
    return this.mode;
  }

  appendToFormData(form: FormData): void {
    switch (this.mode) {
      case VisibleSignOptions.MODE_IMAGE: {
        if (!this.imagePath) {
          throw new InvalidArgumentError('imagePath is required for image mode');
        }
        form.append('image', 'true');
        form.append(
          'imageTTD',
          FileHelper.toBlob(this.imagePath),
          FileHelper.basename(this.imagePath),
        );
        this.appendCoordinates(form);
        break;
      }
      case VisibleSignOptions.MODE_QR: {
        form.append('image', 'false');
        form.append('linkQR', String(this.linkQr ?? ''));
        this.appendCoordinates(form);
        break;
      }
      case VisibleSignOptions.MODE_TAG: {
        if (!this.tagKoordinat) {
          throw new InvalidArgumentError('tag_koordinat is required for tag mode');
        }
        break;
      }
      default:
        throw new InvalidArgumentError(`Unknown visible sign mode: ${this.mode}`);
    }

    if (this.tagKoordinat) {
      form.append('tag_koordinat', this.tagKoordinat);
    }
    if (this.reason != null) {
      form.append('reason', this.reason);
    }
    if (this.location != null) {
      form.append('location', this.location);
    }
    if (this.text != null) {
      form.append('text', this.text);
    }
  }

  private appendCoordinates(form: FormData): void {
    form.append('page', String(this.page));
    form.append('xAxis', String(this.xAxis));
    form.append('yAxis', String(this.yAxis));
    form.append('width', String(this.width));
    form.append('height', String(this.height));
  }

  private clone(): VisibleSignOptions {
    const c = new VisibleSignOptions(this.mode);
    c.imagePath = this.imagePath;
    c.linkQr = this.linkQr;
    c.tagKoordinat = this.tagKoordinat;
    c.page = this.page;
    c.xAxis = this.xAxis;
    c.yAxis = this.yAxis;
    c.width = this.width;
    c.height = this.height;
    c.reason = this.reason;
    c.location = this.location;
    c.text = this.text;
    return c;
  }
}
