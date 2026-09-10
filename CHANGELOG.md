# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Published to the public npm registry as `@kiiskominfokepri/esign` (`publishConfig.access: "public"`)
- `repository`, `homepage`, and `bugs` metadata in `package.json`
- GitHub Actions publish workflow (`.github/workflows/publish.yml`) triggered by `v*` tags, with tag/version consistency check

### Changed
- Installation documentation now recommends the npm registry; GitHub dependency documented as a non-registry alternative
- Release process documented for both automated (tag push) and manual publishing

## [1.0.0] - 2024-07-26

### Added
- Initial TypeScript/Node.js implementation of BSrE eSign API v1 & v2
- Full V1 support: signInvisible, signVisible, sign, downloadDocument, downloadDocumentBinary, signVerification, checkUserStatus
- Full V2 support: sign, signInvisible, signVisible, signInvisibleMultiple, requestSignTotp, checkUserStatus, registerUser, seal (activation, revoke, TOTP, sealPdf), signVerification
- Factory pattern (EsignFactory) and options-based client creation (createEsignClient)
- DTO builders: VisibleSignOptions, SignatureProperties
- Comprehensive error hierarchy: EsignError, ApiError, FileNotFoundError, InvalidArgumentError
- Response property access: ok, status, errors, data, rawBodyText
- 16 unit tests with mocked HTTP client
- Examples for all endpoints
- Dual ESM + CJS output with TypeScript declarations
- MIT License

### Deprecated
- Legacy response getters: `isSuccess()`, `getErrors()`, `getStatus()`, `getData()`, `getRawBodyText()` — prefer property access (`ok`, `errors`, `status`, `data`, `rawBodyText`)