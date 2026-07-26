import { BaseResponse } from '../response/BaseResponse.js';

export class UserStatusResponse extends BaseResponse {
  static readonly STATUS_ISSUE = 'ISSUE';
  static readonly STATUS_EXPIRED = 'EXPIRED';
  static readonly STATUS_RENEW = 'RENEW';
  static readonly STATUS_WAITING_FOR_VERIFICATION = 'WAITING_FOR_VERIFICATION';
  static readonly STATUS_NEW = 'NEW';
  static readonly STATUS_NO_CERTIFICATE = 'NO_CERTIFICATE';
  static readonly STATUS_NOT_REGISTERED = 'NOT_REGISTERED';
  static readonly STATUS_SUSPEND = 'SUSPEND';
  static readonly STATUS_REVOKE = 'REVOKE';

  get userStatus(): string | null {
    if (this.data == null || typeof this.data !== 'object' || Array.isArray(this.data)) {
      return null;
    }
    const body = this.data as Record<string, unknown>;
    if (typeof body.status === 'string') {
      return body.status;
    }
    if (typeof body.userStatus === 'string') {
      return body.userStatus;
    }
    const nested = body.data;
    if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
      const s = (nested as Record<string, unknown>).status;
      if (typeof s === 'string') {
        return s;
      }
    }
    return null;
  }

  /** @deprecated Prefer `response.userStatus` */
  getUserStatus(): string | null {
    return this.userStatus;
  }

  canSign(): boolean {
    return (
      String(this.userStatus ?? '').toUpperCase() ===
      UserStatusResponse.STATUS_ISSUE
    );
  }
}
