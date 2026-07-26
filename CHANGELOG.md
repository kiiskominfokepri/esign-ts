# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

### Changed
- N/A (initial release)

### Deprecated
- Legacy response getters: `isSuccess()`, `getErrors()`, `getStatus()`, `getData()`, `getRawBodyText()` — prefer property access (`ok`, `errors`, `status`, `data`, `rawBodyText`)

### Removed
- N/A (initial release)

## [1.0.0] - 2024-07-26

### Added
- First public release