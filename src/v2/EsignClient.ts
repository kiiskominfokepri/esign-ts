import { BaseClient } from '../client/BaseClient.js';
import type { EsignClientOptions } from '../client/types.js';
import {
  SignatureProperties,
  type SignaturePropertiesPayload,
} from '../dto/SignatureProperties.js';
import { InvalidArgumentError } from '../errors/InvalidArgumentError.js';
import { JsonResponse } from '../response/JsonResponse.js';
import { FileHelper } from '../support/FileHelper.js';
import { SignResponse } from './SignResponse.js';
import { UserStatusResponse } from './UserStatusResponse.js';
import { VerifyResponse } from './VerifyResponse.js';

export type SignExtra = {
  reason?: string | null;
  location?: string | null;
  pdfPassword?: string | null;
  totp?: string | null;
  nik?: string | null;
  email?: string | null;
};

export class EsignClientV2 extends BaseClient {
  constructor(options: EsignClientOptions) {
    super(options);
  }

  async signInvisible(
    passphrase: string,
    filePath: string,
    extra: SignExtra = {},
  ): Promise<SignResponse> {
    const props = SignatureProperties.invisible(
      extra.reason ?? null,
      extra.location ?? null,
      extra.pdfPassword ?? null,
    );
    return this.signPdf(
      [filePath],
      [props],
      passphrase,
      extra.totp ?? null,
      extra.nik ?? null,
      extra.email ?? null,
    );
  }

  async signVisible(
    passphrase: string,
    filePath: string,
    properties: SignatureProperties,
    extra: SignExtra = {},
  ): Promise<SignResponse> {
    return this.signPdf(
      [filePath],
      [properties],
      passphrase,
      extra.totp ?? null,
      extra.nik ?? null,
      extra.email ?? null,
    );
  }

  async signInvisibleMultiple(
    passphrase: string,
    fileMap: Record<string, string>,
    extra: SignExtra = {},
  ): Promise<SignResponse> {
    const inputs = Object.keys(fileMap);
    const outputs = Object.values(fileMap);
    if (inputs.length === 0) {
      throw new InvalidArgumentError('fileMap must not be empty');
    }

    const props = SignatureProperties.invisible(
      extra.reason ?? null,
      extra.location ?? null,
      extra.pdfPassword ?? null,
    );

    const response = await this.signPdf(
      inputs,
      [props],
      passphrase,
      extra.totp ?? null,
      extra.nik ?? null,
      extra.email ?? null,
    );

    return response.setOutputMap(outputs);
  }

  async sign(
    filePaths: string[],
    signatureProperties: Array<SignatureProperties | SignaturePropertiesPayload>,
    passphrase: string | null = null,
    totp: string | null = null,
    nik: string | null = null,
    email: string | null = null,
  ): Promise<SignResponse> {
    return this.signPdf(
      filePaths,
      signatureProperties,
      passphrase,
      totp,
      nik,
      email,
    );
  }

  private async signPdf(
    filePaths: string[],
    signatureProperties: Array<SignatureProperties | SignaturePropertiesPayload>,
    passphrase: string | null,
    totp: string | null,
    nik: string | null,
    email: string | null,
  ): Promise<SignResponse> {
    if (filePaths.length === 0) {
      throw new InvalidArgumentError('At least one PDF file is required');
    }

    const resolvedNik = nik ?? this.nik;
    const resolvedEmail = email ?? this.email;

    if (!resolvedNik && !resolvedEmail) {
      throw new InvalidArgumentError(
        'Either NIK or email is required for V2 signing',
      );
    }

    if (!passphrase && !totp) {
      throw new InvalidArgumentError(
        'Either passphrase or totp is required for V2 signing',
      );
    }

    const files = filePaths.map((path) => FileHelper.toBase64(path));
    const payload: Record<string, unknown> = {
      signatureProperties: SignatureProperties.normalizeList(signatureProperties),
      file: files,
    };

    if (resolvedNik) {
      payload.nik = resolvedNik;
    }
    if (resolvedEmail) {
      payload.email = resolvedEmail;
    }
    if (passphrase) {
      payload.passphrase = passphrase;
    }
    if (totp) {
      payload.totp = totp;
    }

    const response = await this.post('/api/v2/sign/pdf', {
      json: payload,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    return new SignResponse(response);
  }

  async requestSignTotp(
    nik: string | null = null,
    email: string | null = null,
    fileCount = 1,
  ): Promise<JsonResponse> {
    const resolvedNik = nik ?? this.nik;
    const resolvedEmail = email ?? this.email;

    if (!resolvedNik && !resolvedEmail) {
      throw new InvalidArgumentError(
        'Either NIK or email is required to request sign TOTP',
      );
    }

    const payload: Record<string, unknown> = { data: fileCount };
    if (resolvedNik) {
      payload.nik = resolvedNik;
    }
    if (resolvedEmail) {
      payload.email = resolvedEmail;
    }

    const response = await this.post('/api/v2/sign/get/totp', {
      json: payload,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    return new JsonResponse(response);
  }

  async checkUserStatus(
    nik: string | null = null,
    email: string | null = null,
  ): Promise<UserStatusResponse> {
    const resolvedNik = nik ?? this.nik;
    const resolvedEmail = email ?? this.email;

    if (!resolvedNik && !resolvedEmail) {
      throw new InvalidArgumentError(
        'Either NIK or email is required to check user status',
      );
    }

    const payload: Record<string, unknown> = {};
    if (resolvedNik) {
      payload.nik = resolvedNik;
    }
    if (resolvedEmail) {
      payload.email = resolvedEmail;
    }

    const response = await this.post('/api/v2/user/check/status', {
      json: payload,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    return new UserStatusResponse(response);
  }

  async registerUser(nama: string, email: string): Promise<JsonResponse> {
    const response = await this.post('/api/v2/user/register', {
      json: { nama, email },
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
    return new JsonResponse(response);
  }

  async requestSealActivation(
    idSubscriber: string,
    totp: string | null = null,
  ): Promise<JsonResponse> {
    const payload: Record<string, unknown> = { idSubscriber };
    if (totp) {
      payload.totp = totp;
    }

    const response = await this.post('/api/v2/seal/get/activation', {
      json: payload,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
    return new JsonResponse(response);
  }

  async revokeSealActivation(
    idSubscriber: string,
    totp: string,
  ): Promise<JsonResponse> {
    const response = await this.post('/api/v2/seal/revoke/activation', {
      json: { idSubscriber, totp },
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
    return new JsonResponse(response);
  }

  async requestSealTotp(
    idSubscriber: string,
    fileCount: number,
    totp: string,
  ): Promise<JsonResponse> {
    const response = await this.post('/api/v2/seal/get/totp', {
      json: {
        idSubscriber,
        data: fileCount,
        totp,
      },
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
    return new JsonResponse(response);
  }

  async sealPdf(
    idSubscriber: string,
    totp: string,
    filePaths: string[],
    signatureProperties: Array<SignatureProperties | SignaturePropertiesPayload>,
  ): Promise<SignResponse> {
    if (filePaths.length === 0) {
      throw new InvalidArgumentError('At least one PDF file is required for seal');
    }

    const files = filePaths.map((path) => FileHelper.toBase64(path));
    const payload = {
      idSubscriber,
      totp,
      signatureProperties: SignatureProperties.normalizeList(signatureProperties),
      file: files,
    };

    const response = await this.post('/api/v2/seal/pdf', {
      json: payload,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    return new SignResponse(response);
  }

  async signVerification(
    filePath: string,
    pdfPassword: string | null = null,
  ): Promise<VerifyResponse> {
    const payload: Record<string, unknown> = {
      file: FileHelper.toBase64(filePath),
    };
    if (pdfPassword) {
      payload.password = pdfPassword;
    }

    const response = await this.post('/api/v2/verify/pdf', {
      json: payload,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    return new VerifyResponse(response);
  }
}

export { EsignClientV2 as Esign };
