# @kiiskominfokepri/esign - Documentation Guide

TypeScript/Node.js client library for **BSrE (Balai Sertifikasi Elektronik / BSSN) Esign Client Service API** v1 and v2.

Based on *Petunjuk Teknis Penggunaan API Esign Client Service v2.2.1*.

---

## Table of Contents

1. [Installation](#installation)
2. [Quick Start](#quick-start)
3. [Authentication](#authentication)
4. [V1 API Reference](#v1-api-reference)
5. [V2 API Reference](#v2-api-reference)
6. [DTOs & Builders](#dtos--builders)
7. [Error Handling](#error-handling)
8. [Testing](#testing)
9. [Custom HTTP Client](#custom-http-client)
10. [Examples](#examples)

---

## Installation

```bash
npm install @kiiskominfokepri/esign
```

Requirements: Node.js 18+

---

## Quick Start

### Options-based constructor (recommended)

```typescript
import { createEsignClient } from '@kiiskominfokepri/esign';

const v1 = createEsignClient({
  version: 'v1',
  baseUrl: 'https://esign.bssn.go.id',
  username: 'your-username',
  password: 'your-password',
  nik: '3200xxxxxxxxxxxx',
});

const v2 = createEsignClient({
  version: 'v2',
  baseUrl: 'https://esign.bssn.go.id',
  username: 'your-username',
  password: 'your-password',
  nik: '3200xxxxxxxxxxxx',
  email: 'user@example.go.id',
});
```

### Direct class construction

```typescript
import { EsignClientV1, EsignClientV2 } from '@kiiskominfokepri/esign';

const v1 = new EsignClientV1({
  baseUrl: 'https://esign.bssn.go.id',
  username: 'your-username',
  password: 'your-password',
  nik: '3200xxxxxxxxxxxx',
});

const v2 = new EsignClientV2({
  baseUrl: 'https://esign.bssn.go.id',
  username: 'your-username',
  password: 'your-password',
  nik: '3200xxxxxxxxxxxx',
  email: 'user@example.go.id',
});
```

### Factory (legacy, still supported)

```typescript
import { EsignFactory } from '@kiiskominfokepri/esign';

const v1 = EsignFactory.v1(baseUrl, username, password, { nik: '3200...' });
const v2 = EsignFactory.v2(baseUrl, username, password, {
  nik: '3200...',
  email: 'user@example.go.id',
});
```

---

## Authentication

Both V1 and V2 use **HTTP Basic Auth** with `username` / `password` provided by BSrE admin portal.

### Signer Identity

| Version | Required | Optional |
|---------|----------|----------|
| V1      | NIK      | — |
| V2      | NIK **or** email | NIK + email |

### Authentication Methods

| Version | Method | Parameter |
|---------|--------|-----------|
| V1      | Passphrase | `passphrase` |
| V2      | Passphrase **or** TOTP | `passphrase` \| `totp` |

---

## V1 API Reference

**Endpoint base**: `/api`

### Sign Invisible

```typescript
const response = await v1.signInvisible(passphrase, '/path/to/document.pdf');
// or with explicit filename and NIK override
const response = await v1.signInvisible(passphrase, '/path/to/document.pdf', 'custom-name.pdf', '3200yyyyyyyyyyyy');
```

### Sign Visible

```typescript
import { VisibleSignOptions } from '@kiiskominfokepri/esign';

const options = VisibleSignOptions.withImage('/path/ttd.png', 1, 100, 100, 150, 50)
  .withReason('Persetujuan')
  .withLocation('Tanjungpinang');

const response = await v1.signVisible(passphrase, '/path/document.pdf', options);
```

### Unified Sign

```typescript
const response = await v1.sign(passphrase, '/path/document.pdf', 'visible', options);
const response = await v1.sign(passphrase, '/path/document.pdf', 'invisible');
```

### Download Document

```typescript
// Save to file
const success = await v1.downloadDocument('DOC-ID-123', '/path/to/save.pdf');

// Get binary response
const response = await v1.downloadDocumentBinary('DOC-ID-123');
response.saveToFile('/path/to/save.pdf');
```

### Verify Document

```typescript
const response = await v1.signVerification('/path/to/signed.pdf');

if (response.ok) {
  console.log('Document:', response.getDocumentName());
  console.log('Signatures:', response.getSignatureCounts());
  console.log('Summary:', response.getSummary());
  console.log('Signers:', response.getSigners().join(', '));
  console.log('Notes:', response.getNotes());
}
```

### Check User Status

```typescript
const response = await v1.checkUserStatus('3200xxxxxxxxxxxx');
console.log(response.data);
```

---

## V2 API Reference

**Endpoint base**: `/api/v2`

### Sign Invisible (Single)

```typescript
const response = await v2.signInvisible(passphrase, '/path/to/document.pdf');

// With TOTP instead of passphrase
const response = await v2.signInvisible(null, '/path/to/document.pdf', { totp: '123456' });

// With extra options
const response = await v2.signInvisible(passphrase, '/path/to/document.pdf', {
  reason: 'Persetujuan',
  location: 'Jakarta',
  pdfPassword: 'optional-pdf-password',
  nik: '3200yyyyyyyyyyyy',      // override client NIK
  email: 'other@example.go.id', // override client email
});
```

### Sign Visible

```typescript
import { SignatureProperties } from '@kiiskominfokepri/esign';

const props = SignatureProperties.visible('/path/ttd.png', 1, 100, 100, 150, 50)
  .withReason('Persetujuan')
  .withLocation('Tanjungpinang');

const response = await v2.signVisible(passphrase, '/path/document.pdf', props);

// With TOTP
const response = await v2.signVisible(null, '/path/document.pdf', props, { totp: '123456' });
```

### Bulk Sign (Multiple Documents)

```typescript
const fileMap = {
  '/path/doc1.pdf': '/output/signed1.pdf',
  '/path/doc2.pdf': '/output/signed2.pdf',
};

const response = await v2.signInvisibleMultiple(passphrase, fileMap);
const saved = response.saveAll(); // saves all to output paths
```

### Unified Sign (Multi-document, Custom Properties)

```typescript
const response = await v2.sign(
  ['/path/a.pdf', '/path/b.pdf'],
  [SignatureProperties.invisible(), SignatureProperties.visible(img, 1, 10, 10, 50, 30)],
  passphrase,
  totp // optional
);
```

### TOTP

```typescript
// Request TOTP for signing
await v2.requestSignTotp(null, null, 1); // fileCount = 1
```

### User Status

```typescript
const response = await v2.checkUserStatus();

if (response.ok) {
  console.log('Status:', response.userStatus); // 'ISSUE', 'UNVERIFIED', etc.
  console.log('Can sign:', response.canSign());
}
```

### Register User

```typescript
await v2.registerUser('Nama Lengkap', 'user@example.go.id');
```

### Seal Operations

```typescript
// 1. Request activation
await v2.requestSealActivation('ID-SUBSCRIBER');

// 2. Request seal TOTP
await v2.requestSealTotp('ID-SUBSCRIBER', 1, 'activation-totp');

// 3. Seal PDF
const response = await v2.sealPdf('ID-SUBSCRIBER', 'seal-totp', ['/path/doc.pdf'], [
  SignatureProperties.invisible(),
]);

// 4. Revoke activation
await v2.revokeSealActivation('ID-SUBSCRIBER', 'totp');
```

### Verify Document (V2)

```typescript
const response = await v2.signVerification('/path/signed.pdf', 'pdf-password-if-any');

if (response.ok) {
  console.log('Conclusion:', response.getConclusion());      // 'VALID', 'INVALID', etc.
  console.log('Description:', response.getDescription());
  console.log('Signatures:', response.getSignatureCounts());
  console.log('Signers:', response.getSigners().join(', '));
}
```

---

## DTOs & Builders

### VisibleSignOptions (V1)

```typescript
import { VisibleSignOptions, VisibleSignMode } from '@kiiskominfokepri/esign';

// With image
const options = VisibleSignOptions.withImage(
  '/path/ttd.png',  // imagePath
  1,                // page
  100,              // originX
  100,              // originY
  150,              // width
  50                // height
)
  .withReason('Persetujuan')
  .withLocation('Tanjungpinang')
  .withMode(VisibleSignMode.IMAGE); // or TEXT

// Text-only
const options = VisibleSignOptions.withText('John Doe', 1, 50, 50, 200, 40)
  .withReason('Disetujui');
```

### SignatureProperties (V2)

```typescript
import { SignatureProperties } from '@kiiskominfokepri/esign';

// Invisible
const props = SignatureProperties.invisible()
  .withReason('Persetujuan')
  .withLocation('Jakarta')
  .withPdfPassword('optional');

// Visible
const props = SignatureProperties.visible('/path/ttd.png', 1, 100, 100, 150, 50)
  .withReason('Persetujuan')
  .withLocation('Jakarta');

// Convert to payload for direct API call
const payload = props.toPayload();
```

---

## Error Handling

All API errors are returned as response objects (`response.ok === false`). Transport errors throw.

```typescript
import { EsignError, ApiError, FileNotFoundError, InvalidArgumentError } from '@kiiskominfokepri/esign';

try {
  const response = await v2.signInvisible(passphrase, '/path/doc.pdf');

  if (!response.ok) {
    // API error (HTTP 200 but business logic failure)
    console.error('Status:', response.status);           // number
    console.error('Errors:', response.errors);           // unknown
    console.error('Raw body:', response.rawBodyText);    // string
    return;
  }

  response.saveToFile('/output/signed.pdf');
  
} catch (err) {
  // Transport/network errors
  if (err instanceof ApiError) {
    console.error('API transport error:', err.message);
  } else if (err instanceof FileNotFoundError) {
    console.error('File not found:', err.message);
  } else if (err instanceof InvalidArgumentError) {
    console.error('Invalid argument:', err.message);
  } else if (err instanceof EsignError) {
    console.error('Esign error:', err.message);
  } else {
    throw err;
  }
}
```

### Response Properties (Preferred)

```typescript
response.ok           // boolean - true if HTTP 2xx and no error in body
response.status       // number - HTTP status code
response.errors       // unknown - parsed error from response body
response.data         // unknown - parsed response data (varies by endpoint)
response.rawBodyText  // string - raw response body
```

### Legacy Getters (Deprecated)

```typescript
response.isSuccess()     // → response.ok
response.getErrors()     // → response.errors
response.getStatus()     // → response.status
response.getData()       // → response.data
response.getRawBodyText()// → response.rawBodyText
```

---

## Testing

```bash
npm test           # run tests once
npm run test:watch # watch mode
```

### Unit Test Structure

```
tests/
├── EsignFactory.test.ts    # Factory & createEsignClient
├── v1/Esign.test.ts        # V1 client methods
└── v2/Esign.test.ts        # V2 client methods
```

### Custom HTTP Client for Testing

```typescript
import { EsignClientV2, type HttpClient } from '@kiiskominfokepri/esign';

const mockHttp: HttpClient = {
  async request(method, url, options) {
    return {
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: Buffer.from(JSON.stringify({ status: 'ISSUE' })),
      bodyText() { return this.body.toString('utf8'); },
    };
  },
};

const esign = new EsignClientV2({
  baseUrl: 'https://test',
  username: 'u',
  password: 'p',
  httpClient: mockHttp,
  nik: '3200...',
});
```

---

## Examples

All examples in `examples/` directory:

```bash
# V1
npm run example:v1:sign-invisible
npm run example:v1:sign-visible
npm run example:v1:verify
npm run example:v1:download <id_dokumen>

# V2
npm run example:v2:sign-invisible
npm run example:v2:sign-visible
npm run example:v2:bulk-sign
npm run example:v2:check-status
npm run example:v2:verify
```

### Configuration

```bash
cp examples/.env.example examples/.env
# Edit examples/.env with your credentials
```

---

## API Coverage Summary

| Area | Endpoint | V1 Method | V2 Method |
|------|----------|-----------|-----------|
| Sign | `/api/sign/pdf` | `signInvisible`, `signVisible`, `sign` | — |
| Sign | `/api/v2/sign/pdf` | — | `sign`, `signInvisible`, `signVisible`, `signInvisibleMultiple` |
| Download | `/api/sign/download/{id}` | `downloadDocument`, `downloadDocumentBinary` | — |
| Verify | `/api/sign/verify` | `signVerification` | — |
| Verify | `/api/v2/verify/pdf` | — | `signVerification` |
| TOTP | `/api/v2/sign/get/totp` | — | `requestSignTotp` |
| User Status | `/api/user/status/{nik}` | `checkUserStatus` | — |
| User Status | `/api/v2/user/check/status` | — | `checkUserStatus` |
| Register | `/api/v2/user/register` | — | `registerUser` |
| Seal Activation | `/api/v2/seal/get/activation` | — | `requestSealActivation` |
| Seal Revoke | `/api/v2/seal/revoke/activation` | — | `revokeSealActivation` |
| Seal TOTP | `/api/v2/seal/get/totp` | — | `requestSealTotp` |
| Seal PDF | `/api/v2/seal/pdf` | — | `sealPdf` |

---

## License

MIT License - Copyright (c) 2024 KIIS Kominfo Kepri

---

## Support

- Issues: https://github.com/kiiskominfokepri/esign-ts/issues
- BSrE Documentation: Petunjuk Teknis API Esign Client Service v2.2.1