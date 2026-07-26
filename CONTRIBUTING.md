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

Maintainers only:

```bash
# 1. Update version in package.json
npm version patch|minor|major

# 2. Update CHANGELOG.md with release notes

# 3. Commit and tag
git add package.json CHANGELOG.md
git commit -m "Release vX.Y.Z"
git tag vX.Y.Z
git push origin main --tags

# 4. Publish to npm
npm publish --access public
```

## Code of Conduct

Be respectful. Follow standard open source etiquette.

## Questions?

Open an issue for discussion.