# `@openpolicy/cli`

> Install [OpenPolicy](https://openpolicy.sh) into your project and print a setup prompt for your coding agent.

One command installs `@openpolicy/sdk` plus the right framework integration for your stack (Vite / React / Vue), writes an `openpolicy.ts` stub, and prints a prompt you can paste into Claude Code, Cursor, or any other coding agent to finish setup by reading your codebase.

## Usage

From the root of your project:

```sh
bunx @openpolicy/cli init
# or: npx @openpolicy/cli init
# or: pnpm dlx @openpolicy/cli init
```

That's it — the CLI detects your package manager from lockfiles, installs the right packages, scaffolds `src/openpolicy.ts` (or `openpolicy.ts` if you don't have a `src/` directory), and prints the agent prompt.

### Flags

| Flag | Default | Description |
|---|---|---|
| `--cwd <path>` | `.` | Working directory |
| `--pm <bun\|pnpm\|yarn\|npm>` | auto-detected | Override package-manager detection |
| `--skip-install` | `false` | Print the prompt only; don't install packages |
| `--dry-run` | `false` | Show planned actions without executing |
| `--yes`, `-y` | `false` | Skip the confirmation prompt |
| `--out <path>` | `src/openpolicy.ts` or `openpolicy.ts` | Output path for the stub |
| `--force` | `false` | Overwrite an existing stub |

## What gets installed

- `@openpolicy/sdk` — always
- `@openpolicy/vite` (dev) — if `vite` is in your `package.json`
- `@openpolicy/react` — if `react` is in your `package.json`
- `@openpolicy/vue` — if `vue` is in your `package.json`

## Documentation

[docs.openpolicy.sh](https://docs.openpolicy.sh)

## Links

- [GitHub](https://github.com/jamiedavenport/openpolicy)
- [openpolicy.sh](https://openpolicy.sh)
- [npm](https://www.npmjs.com/package/@openpolicy/cli)
