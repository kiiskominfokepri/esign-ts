export { EsignFactory, createEsignClient } from './EsignFactory.js';
export type {
  ApiVersion,
  CreateEsignClientOptions,
  FactoryOptions,
} from './EsignFactory.js';

export { FetchHttpClient } from './client/FetchHttpClient.js';
export type {
  EsignClientOptions,
  HttpClient,
  HttpHeaders,
  HttpMethod,
  HttpResponse,
  JsonRequestOptions,
} from './client/types.js';

export { VisibleSignOptions } from './dto/VisibleSignOptions.js';
export type { VisibleSignMode } from './dto/VisibleSignOptions.js';
export { SignatureProperties } from './dto/SignatureProperties.js';
export type { SignaturePropertiesPayload } from './dto/SignatureProperties.js';

export {
  EsignError,
  ApiError,
  FileNotFoundError,
  InvalidArgumentError,
} from './errors/index.js';

export { BaseResponse } from './response/BaseResponse.js';
export { JsonResponse } from './response/JsonResponse.js';

export { FileHelper } from './support/FileHelper.js';

export { EsignClientV1, Esign as EsignV1 } from './v1/EsignClient.js';
export { SignResponse as V1SignResponse } from './v1/SignResponse.js';
export { VerifyResponse as V1VerifyResponse } from './v1/VerifyResponse.js';
export { VerifyDetail as V1VerifyDetail } from './v1/VerifyDetail.js';

export { EsignClientV2, Esign as EsignV2 } from './v2/EsignClient.js';
export type { SignExtra } from './v2/EsignClient.js';
export { SignResponse as V2SignResponse } from './v2/SignResponse.js';
export { VerifyResponse as V2VerifyResponse } from './v2/VerifyResponse.js';
export { VerifyDetail as V2VerifyDetail } from './v2/VerifyDetail.js';
export { UserStatusResponse } from './v2/UserStatusResponse.js';
