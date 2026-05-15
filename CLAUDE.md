# OpenPolicy

## Toolchain — Vite+ (`vp`)

This project uses [Vite+](https://viteplus.dev), a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, and Oxfmt. Vite+ wraps dev-server, build, test, lint, format, type-check, and package-manager operations behind a single global CLI called `vp`.

The package manager is pnpm (managed via Corepack); `vp` detects it via `packageManager` in `package.json` and delegates accordingly. Do not invoke `pnpm`/`npm`/`yarn` directly when a `vp` equivalent exists.

### Common commands

- `vp install` (`vp i`) — install dependencies
- `vp dev` — run the dev server
- `vp build` — production build
- `vp pack` — build libraries (wraps tsdown)
- `vp test` — run tests (Vitest-backed)
- `vp check` — run format, lint, and type-checks in one pass
- `vp fmt` / `vp lint` — format or lint individually
- `vp run <script>` — execute a `package.json` script
- `vp run -r <script>` — run a script across all workspaces in dep order
- `vp add` / `vp remove` / `vp update` — dependency management
- `vp dlx <pkg>` — one-shot binary execution (replacement for `npx`)
- `vp exec <bin>` — run a binary from local `node_modules/.bin`

Run `vp help` for the full list and `vp <command> --help` for specifics.

## Branch Strategy

All PolicyStack 1.0 work happens on the long-lived **`v1`** branch, cut from `main` (Locked: decision 11). `main` stays the current released `0.0.x` line and is **not touched again until Phase 6** — the single rename/freeze merge that brings `v1` back, so consumers see exactly one breaking event. Phases 0–5 all land on `v1`.

- **Default working branch is `v1`.** Cut feature branches from `v1` and merge them back into `v1`, not `main`.
- **Red tests are acceptable on `v1`** during Phases 0–5. The gate is green at the Phase-6 merge, not continuously — the one canonical example is the only thing that must stay buildable/green as the Phase-1 scanner regression net (see Phase 0 · Cleanup).
- **No branch protection** on `main`: critical `0.0.x` bug fixes may still need to ship from `main`. When that happens, fix on `main` (or a branch off it), release, then forward-port the fix into `v1` so it isn't lost in the Phase-6 merge.
- **Phase 6 is the only merge from `v1` → `main`**: rename to `@policystack/*`, tag `v1.0.0`, single combined policy + consent API freeze.