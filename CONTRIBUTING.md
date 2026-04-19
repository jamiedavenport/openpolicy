# Contributing to OpenPolicy

## Setup

```bash
git clone https://github.com/jamiedavenport/openpolicy
cd openpolicy
bun install
bun lefthook install
```

`bun lefthook install` activates two git hooks:
- **pre-commit** — runs Biome format/lint on staged files (auto-fixes in place)
- **pre-push** — runs `bun run check-types` across all packages

## Project Structure

This is a Bun monorepo under `packages/`:

| Package | Description |
|---|---|
| `packages/sdk` | `@openpolicy/sdk` — public API (`defineConfig`) |
| `packages/core` | `@openpolicy/core` — compilation engine |
| `packages/vite` | `@openpolicy/vite` — Vite plugin |
| `packages/cli` | `@openpolicy/cli` — CLI tool |
| `apps/docs` | Documentation site (Next.js + Fumadocs) |
| `tooling/tsconfig` | Shared TypeScript base config |

## Development Workflow

```bash
# Run all tests
bun test

# Type-check all packages
bun run check-types

# Build all packages (produces dist/*.js + dist/*.d.ts)
bun run build
```

### Working on `@openpolicy/core`

`core`'s `package.json` exports point to `./dist/` (not `./src/`). After changing source files in `packages/core`, rebuild it before other packages will pick up the changes:

```bash
cd packages/core && bun run build
```

### Running the CLI locally

```bash
cd packages/cli && bun run src/cli.ts --help
```

## Architecture

### Core compilation pipeline

```
PolicyInput → compilePolicy() → section builders → PolicySection[] → renderer → string
```

- **Section builders** are functions `(config) => PolicySection | null`. Returning `null` omits the section.
- **`PolicyInput`** is a discriminated union: `{ type: "privacy" } & PrivacyPolicyConfig | { type: "cookie" } & CookiePolicyConfig`.
- **Renderers** in `packages/core/src/renderers/` produce Markdown or HTML output.

### Adding a new section

1. Add a builder function in `packages/core/src/documents/privacy.ts` or `documents/cookie.ts`.
2. Register it in the relevant `compile*Document()` function.
3. Add fields to `PrivacyPolicyConfig` or `CookiePolicyConfig` in `types.ts`.
4. Write tests in `packages/core/src/*.test.ts`.

## Testing

```bash
# All packages
bun test

# Single package
cd packages/core && bun test
```

Tests use `bun:test` (Jest-compatible API). Keep tests co-located or in the same package as the code they cover.

## Code Style

Biome handles formatting and linting. The pre-commit hook auto-fixes staged files — you generally don't need to run it manually. To check manually:

```bash
bun biome check --write .
```

TypeScript strict mode is on (`verbatimModuleSyntax`, `moduleResolution: bundler`). Use `import type` for type-only imports.

## Releases

This repo uses [Changesets](https://github.com/changesets/changesets) for versioning.

1. After making your changes, run:
   ```bash
   bun run changeset
   ```
   Follow the prompts to describe what changed and which packages are affected.

2. Commit the generated `.changeset/*.md` file alongside your code changes.

3. Open a pull request against `main`. CI will validate your changes.

4. Once merged, the GitHub Actions workflow automatically opens a "Version Packages" PR. Merging that PR publishes the updated packages to NPM.

Publishable packages: `@openpolicy/sdk`, `@openpolicy/core`, `@openpolicy/vite`, `@openpolicy/cli`.

## Pull Requests

- Keep changes focused — one concern per PR.
- Include a changeset for any user-facing change to a published package.
- Ensure `bun test` and `bun run check-types` pass before opening a PR.
- For significant changes to the compilation pipeline or public API, open an issue first to discuss the approach.
