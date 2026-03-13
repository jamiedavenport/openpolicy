Default to using Bun instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun build <file.html|file.ts|file.css>` instead of `webpack` or `esbuild`
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Use `bun run <script>` instead of `npm run <script>` or `yarn run <script>` or `pnpm run <script>`
- Bun automatically loads .env, so don't use dotenv.

## APIs

- Prefer Node APIs over Bun APIs.

## Project Structure

This is a monorepo under `packages/`. Key packages:

- `packages/sdk` — `@openpolicy/sdk`: public API — `defineConfig()`, `defineCookiePolicy()`, and related types
- `packages/core` — `@openpolicy/core`: compilation engine; published to npm as a dependency of sdk and vite
- `packages/vite` — `@openpolicy/vite`: Vite plugin (`openPolicy()`) that compiles policies at build time
- `packages/cli` — `@openpolicy/cli`: CLI tool for generating policy documents outside of a Vite build

## Domain Concepts

- **Policy types**: `"privacy"` (PrivacyPolicyConfig) and `"terms"` (TermsOfServiceConfig) — `PolicyInput` is a discriminated union
- **Policy definition**: TypeScript object passed to `defineConfig()` describing the policy content
- **Compilation**: Policy definitions are compiled to HTML or Markdown — triggered either by the Vite plugin at build time or by `openpolicy generate` via the CLI
- **Section builders**: Each section is a `(config) => PolicySection | null` function; `null` means the section is not applicable and is omitted
- **Output filenames**: `privacy-policy.{ext}` for privacy, `terms-of-service.{ext}` for terms
- **Type auto-detection**: config filenames containing `"terms"` are treated as `TermsOfServiceConfig`; all others default to `PrivacyPolicyConfig`. Used by both the CLI (`--type` overrides) and the Vite plugin (`configs` array; per-entry `type` overrides)
- **Formats**: `markdown` | `html` (implemented); `pdf` | `jsx` throw "not yet implemented"
- **Compliance targets**: GDPR, CCPA, and multi-jurisdiction templates (privacy only)
- **`llms.txt`**: AI-readable reference for auto-generating policy configs from existing codebases

## Git Hooks

This project uses [lefthook](https://github.com/evilmartians/lefthook) for git hooks. After cloning, run:

```sh
bun lefthook install
```

Two hooks are active:
- **pre-commit** — runs Biome format/lint on staged files
- **pre-push** — runs `bun run check-types` across all packages

## Versioning

This repo uses [Changesets](https://github.com/changesets/changesets) for versioning and publishing. Publishable packages are `@openpolicy/sdk`, `@openpolicy/cli`, `@openpolicy/vite`, and `@openpolicy/core`.

```sh
# Create a changeset describing your change
bun run changeset

# Bump versions and generate CHANGELOGs (done by CI, but can run locally)
bun run version-packages

# Build all packages and publish to NPM
bun run publish-packages
```

The GitHub Actions workflow (`.github/workflows/release.yml`) automates this: when changesets are merged to `main`, it opens a "Version Packages" PR; merging that PR publishes to NPM. Requires `NPM_TOKEN` secret in GitHub repo settings.

### publishConfig pattern
`exports` in each package.json points to `./src/index.ts` during development (Bun resolves TypeScript directly). `publishConfig.exports` overrides this to `./dist/` on `npm publish`, so consumers get compiled JS + `.d.ts` files without any extra setup for local development.

### Build output
`bun run build` produces both `dist/*.js` (via `bun build`) and `dist/*.d.ts` (via `tsc --emitDeclarationOnly`). `@openpolicy/core` is a regular `dependency` of `sdk` and `vite` — it is published to npm and installed alongside them. `cli` bundles `core` at build time (it remains a `devDependency` there since CLI ships a binary, not importable types).

## Testing

Use `bun test` to run tests.

```ts
import { test, expect } from "bun:test";

test("policy compiles to markdown", () => {
  // ...
});
```

## TypeScript

- Strict mode is enabled (`tsconfig.json`)
- `moduleResolution: "bundler"` — use Bun/Vite-style imports
- JSX is configured as `react-jsx`
- `verbatimModuleSyntax` is on — use `import type` for type-only imports
