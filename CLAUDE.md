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

- `packages/sdk` — `@openpolicy/sdk`: public API — `defineConfig()` and related types
- `packages/core` — `@openpolicy/core`: compilation engine; published to npm as a dependency of sdk and vite
- `packages/vite` — `@openpolicy/vite`: Vite plugin (`openPolicy()`) that compiles policies at build time
- `packages/cli` — `@openpolicy/cli`: CLI tool that installs OpenPolicy into a project and prints a setup prompt for coding agents

## Domain Concepts

- **Policy types**: `"privacy"` (PrivacyPolicyConfig) and `"cookie"` (CookiePolicyConfig) — `PolicyInput` is a discriminated union
- **Policy definition**: TypeScript object passed to `defineConfig()` describing the policy content
- **Compilation**: Policy definitions are compiled to HTML, Markdown, or PDF via `@openpolicy/core` + `@openpolicy/renderers` (e.g. from React/Vue components at runtime, or inline in Astro frontmatter). The Vite plugin scans source at build time to auto-populate `dataCollected` / `thirdParties`. The CLI (`@openpolicy/cli`) handles first-run setup — it installs packages and prints a setup prompt for coding agents; it no longer generates policy files.
- **Section builders**: Each section is a `(config) => PolicySection | null` function; `null` means the section is not applicable and is omitted
- **Output filenames**: `privacy-policy.{ext}` for privacy, `cookie-policy.{ext}` for cookie
- **Formats**: `markdown` | `html` | `pdf` (implemented); `jsx` throws "not yet implemented"
- **Compliance targets**: GDPR, CCPA, and multi-jurisdiction templates
- **`llms.txt`**: AI-readable reference for auto-generating policy configs from existing codebases

## Git Hooks

This project uses [lefthook](https://github.com/evilmartians/lefthook) for git hooks. After cloning, run:

```sh
bun lefthook install
```

Two hooks are active:
- **pre-commit** — runs Biome format/lint on staged files
- **pre-push** — runs `bun run check-types` across all packages

## Versioning & Release

This repo uses [Changesets](https://github.com/changesets/changesets) for versioning and publishing. Publishable packages are `@openpolicy/sdk`, `@openpolicy/cli`, `@openpolicy/vite`, and `@openpolicy/core`.

### Pre-1.0 bump policy

While we are at `0.0.x`, **use `patch` in changesets for every change — including breaking ones**. We explicitly accept breaking changes during this phase and don't differentiate them with `minor`/`major` bumps yet. Describe the breaking nature in the changeset body so consumers can see it in the CHANGELOG; only switch to semver-correct `major`/`minor` bumps after the first `1.0.0` release.

### Automated release flow

Releases are fully automated via `.github/workflows/release.yml` using `changesets/action`:

1. **Add a changeset** as part of your feature/fix PR:
   ```sh
   bun run changeset
   ```
   Commit the generated `.changeset/*.md` file alongside your changes.

2. **Merge to `main`** → CI runs and opens (or updates) a **"Version Packages" PR** that bumps `package.json` versions and updates `CHANGELOG.md` files.

3. **Merge the "Version Packages" PR** → CI publishes all changed packages to NPM and creates GitHub releases.

### Required secret

`NPM_TOKEN` (an npm Automation token) must be set in **GitHub repo → Settings → Secrets and variables → Actions**. `GITHUB_TOKEN` is provided automatically by GitHub Actions.

### Manual commands (local use only)

```sh
# Bump versions and generate CHANGELOGs
bun run version-packages

# Build all packages and publish to NPM
bun run publish-packages
```

### publishConfig pattern
`exports` in each package.json points to `./src/index.ts` during development (Bun resolves TypeScript directly). `publishConfig.exports` overrides this to `./dist/` on `npm publish`, so consumers get compiled JS + `.d.ts` files without any extra setup for local development.

### Build output
`bun run build` produces both `dist/*.js` (via `bun build`) and `dist/*.d.ts` (via `tsc --emitDeclarationOnly`). `@openpolicy/core` is a regular `dependency` of `sdk` and `vite` — it is published to npm and installed alongside them. `cli` no longer depends on `core` or `renderers` — it only shells out to the user's package manager and prints a prompt.

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
- Prefer `type` over `interface` for all type declarations
