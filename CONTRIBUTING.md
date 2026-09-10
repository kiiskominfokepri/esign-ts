# Contributing to @kiiskominfokepri/esign

Thank you for considering a contribution!

## Development Setup

```bash
git clone https://github.com/kiiskominfokepri/esign-ts.git
cd esign-ts
npm install
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run build` | Compile TypeScript → CJS + ESM + DTS |
| `npm run typecheck` | Type-check without emitting |
| `npm test` | Run unit tests |
| `npm run test:watch` | Watch mode for tests |

## Code Style

- TypeScript strict mode enabled
- ESLint not configured (uses TypeScript compiler checks)
- Run `npm run typecheck` before committing

## Testing

- All new features require unit tests
- Tests use mocked HTTP (no real API calls)
- Run `npm test` to verify

## Pull Request Process

1. Create a feature branch from `main`
2. Add tests for new functionality
3. Ensure all tests pass: `npm test`
4. Ensure typecheck passes: `npm run typecheck`
5. Ensure build passes: `npm run build`
6. Update CHANGELOG.md with your changes
7. Open PR with clear description

## Release Process

The package is published to the public npm registry as `@kiiskominfokepri/esign` (`publishConfig.access: "public"`). Publishing can be done manually or automatically via GitHub Actions on tag push.

### Automatic (recommended)

Requires an `NPM_TOKEN` repository secret (npm automation token with publish rights for the `@kiiskominfokepri` scope).

```bash
# 1. Update version + CHANGELOG
npm version patch|minor|major --no-git-tag-version
# edit CHANGELOG.md
git add package.json CHANGELOG.md
git commit -m "Release vX.Y.Z"

# 2. Tag and push — .github/workflows/publish.yml builds and publishes
git tag vX.Y.Z
git push origin main --tags
```

### Manual

```bash
npm login            # must have publish access to @kiiskominfokepri
npm run typecheck
npm test
npm publish          # prepublishOnly runs the build
```

### Pre-release

```bash
npm publish --tag next
```

## Code of Conduct

Be respectful. Follow standard open source etiquette.

## Questions?

Open an issue for discussion.