# @kiiskominfokepri/esign

TypeScript/Node.js client library for **BSrE (Balai Sertifikasi Elektronik / BSSN) Esign Client Service API** v1 and v2.

Port of [`kiiskominfokepri/esign-php`](../esign-php), based on *Petunjuk Teknis Penggunaan API Esign Client Service v2.2.1*.

## Requirements

- Node.js 18+
- ESM or CJS consumers supported

## Installation

```bash
npm install @kiiskominfokepri/esign
```

## Authentication

Both V1 and V2 use **HTTP Basic Auth** (`username` / `password`).

Signer identity uses **NIK** and/or **email**, plus **passphrase** or **TOTP** (V2).

## Quick start

### Options-object (preferred)

```ts
import { createEsignClient, EsignClientV1, EsignClientV2 } from '@kiiskominfokepri/esign';

const v1 = createEsignClient({
  version: 'v1',
  baseUrl,
  username,
  password,
  nik: '3200xxxxxxxxxxxx',
});

const v2 = createEsignClient({
  version: 'v2',
  baseUrl,
  username,
  password,
  nik: '3200xxxxxxxxxxxx',
  email: 'user@example.go.id',
});

// or construct directly
const client = new EsignClientV2({
  baseUrl,
  username,
  password,
  nik: '3200xxxxxxxxxxxx',
  email: 'user@example.go.id',
});

// property access
client.nik = '3200yyyyyyyyyyyy';
client.email = 'other@example.go.id';
```

### Factory (still supported)

```ts
import { EsignFactory } from '@kiiskominfokepri/esign';

const v1 = EsignFactory.v1(baseUrl, username, password, { nik: '3200...' });
const v2 = EsignFactory.v2(baseUrl, username, password, {
  nik: '3200...',
  email: 'user@example.go.id',
});
```

### V1 — invisible sign

```ts
import { createEsignClient } from '@kiiskominfokepri/esign';

const esign = createEsignClient({
  version: 'v1',
  baseUrl,
  username,
  password,
  nik: '3200xxxxxxxxxxxx',
});

const response = await esign.signInvisible(passphrase, '/path/to/document.pdf');

if (response.ok) {
  response.saveToFile('/path/to/signed.pdf');
  const idDokumen = response.getDocumentId();
} else {
  console.error(response.errors);
}
```

### V1 — visible sign

```ts
import { createEsignClient, VisibleSignOptions } from '@kiiskominfokepri/esign';

const esign = createEsignClient({
  version: 'v1',
  baseUrl,
  username,
  password,
  nik,
});

const options = VisibleSignOptions.withImage('/path/ttd.png', 1, 100, 100, 150, 50)
  .withReason('Persetujuan')
  .withLocation('Tanjungpinang');

const response = await esign.signVisible(passphrase, '/path/doc.pdf', options);
```

### V2 — invisible / bulk / visible

```ts
import { createEsignClient, SignatureProperties } from '@kiiskominfokepri/esign';

const esign = createEsignClient({
  version: 'v2',
  baseUrl,
  username,
  password,
  nik,
  email,
});

const response = await esign.signInvisible(passphrase, '/path/doc.pdf');
response.saveToFile('/path/signed.pdf');

const bulk = await esign.signInvisibleMultiple(passphrase, {
  '/path/a.pdf': '/path/out-a.pdf',
  '/path/b.pdf': '/path/out-b.pdf',
});
bulk.saveAll();

const props = SignatureProperties.visible('/path/ttd.png', 1, 100, 100, 150, 50);
await esign.signVisible(passphrase, '/path/doc.pdf', props);

await esign.sign(
  ['/path/a.pdf', '/path/b.pdf'],
  [SignatureProperties.invisible()],
  passphrase,
  totp, // optional instead of passphrase
);
```

### V2 — TOTP, user status, seal

```ts
await esign.requestSignTotp(null, null, 1);

const status = await esign.checkUserStatus();
if (status.canSign()) {
  // status.userStatus === 'ISSUE'
}

await esign.registerUser('Nama Lengkap', 'user@example.go.id');

await esign.requestSealActivation(idSubscriber);
await esign.requestSealTotp(idSubscriber, 1, activationTotp);
await esign.sealPdf(idSubscriber, sealTotp, ['/path/doc.pdf'], [
  SignatureProperties.invisible(),
]);
await esign.revokeSealActivation(idSubscriber, totp);
```

### V2 — verify

```ts
const verify = await esign.signVerification('/path/signed.pdf', pdfPassword);
console.log(verify.getSummary());
console.log(verify.getDocumentName());
```

## API coverage

| Area | Endpoint | Client method |
|------|----------|---------------|
| V1 sign | `POST /api/sign/pdf` | `signInvisible`, `signVisible`, `sign` |
| V1 download | `GET /api/sign/download/{id}` | `downloadDocument`, `downloadDocumentBinary` |
| V1 verify | `POST /api/sign/verify` | `signVerification` |
| V1 user status | `GET /api/user/status/{nik}` | `checkUserStatus` |
| V2 sign | `POST /api/v2/sign/pdf` | `sign`, `signInvisible`, `signVisible`, `signInvisibleMultiple` |
| V2 TOTP | `POST /api/v2/sign/get/totp` | `requestSignTotp` |
| V2 verify | `POST /api/v2/verify/pdf` | `signVerification` |
| V2 user status | `POST /api/v2/user/check/status` | `checkUserStatus` |
| V2 register | `POST /api/v2/user/register` | `registerUser` |
| V2 seal | `/api/v2/seal/*` | `requestSealActivation`, `revokeSealActivation`, `requestSealTotp`, `sealPdf` |

## Error handling

- HTTP API errors are returned as response objects (`response.ok === false`).
- Transport failures throw `ApiError`.
- Missing files throw `FileNotFoundError`.
- Invalid arguments throw `InvalidArgumentError`.

```ts
if (!response.ok) {
  response.status;
  response.errors;
  response.rawBodyText;
}
```

Legacy getters (`isSuccess()`, `getErrors()`, `getStatus()`, …) remain available but prefer property access.

## Custom HTTP client (tests)

```ts
import { EsignClientV2, type HttpClient } from '@kiiskominfokepri/esign';

const mock: HttpClient = {
  async request(method, url, options) {
    return {
      status: 200,
      headers: { 'content-type': 'application/json' },
      body: Buffer.from(JSON.stringify({ status: 'ISSUE' })),
      bodyText() {
        return this.body.toString('utf8');
      },
    };
  },
};

const esign = new EsignClientV2({
  baseUrl,
  username,
  password,
  httpClient: mock,
  nik,
});
```

## Testing

```bash
npm install
npm test
npm run build
```

## License

Proprietary — KIIS Kominfo Kepri.
