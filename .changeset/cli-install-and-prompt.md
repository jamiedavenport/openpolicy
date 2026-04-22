---
"@openpolicy/cli": patch
---

**Breaking:** the CLI is now an install + prompt tool only.

- `openpolicy generate` and `openpolicy validate` are removed. Use `@openpolicy/vite` to collect data at build time and `@openpolicy/react` / `@openpolicy/vue` to render policies at runtime.
- `openpolicy init` now detects your package manager (bun/pnpm/yarn/npm) and the frameworks in your `package.json` (vite / react / vue), installs `@openpolicy/sdk` plus the matching integrations, writes a minimal `openpolicy.ts` stub (preferring `src/openpolicy.ts` when a `src/` directory exists), and prints a prompt you can paste into a coding agent (Claude Code, Cursor, etc.) to complete setup.
- New flags: `--cwd`, `--pm`, `--skip-install`, `--dry-run`, `--yes`, `--out`, `--force`.
- `@openpolicy/core` and `@openpolicy/renderers` are no longer devDependencies of the CLI.
