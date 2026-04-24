---
title: CLI
description: Install OpenPolicy and generate an agent prompt in one command
---

`@openpolicy/cli` sets up OpenPolicy in your project. Run it once — it installs the right packages for your stack, scaffolds a starter `openpolicy.ts`, and prints a prompt you can paste into a coding agent (Claude Code, Cursor, etc.) to finish filling in your config from your codebase.

## Run it

From the root of your project:

```sh
bunx @openpolicy/cli init
# or: npx @openpolicy/cli init
# or: pnpm dlx @openpolicy/cli init
```

That's the whole flow. The CLI is meant for one-time setup — once it's done, uninstall or ignore it.

## What it does

1. **Detects your package manager** from lockfiles (`bun.lock`, `pnpm-lock.yaml`, `yarn.lock`, `package-lock.json`) or the `packageManager` field in `package.json`. Falls back to `npm`.
2. **Detects frameworks** by reading your `package.json` dependencies and installs the matching OpenPolicy integration:
   - `vite` → `@openpolicy/vite` (devDependency)
   - `react` → `@openpolicy/react`
   - `vue` → `@openpolicy/vue`
   - `@openpolicy/sdk` is always installed.
3. **Writes a starter `openpolicy.ts`** to `src/openpolicy.ts` if a `src/` directory exists, otherwise to the project root.
4. **Prints an agent prompt** between delimiters so you can copy it into a coding agent and have the rest of your config filled in automatically from your codebase.

## Flags

| Flag                          | Default       | Description                                 |
| ----------------------------- | ------------- | ------------------------------------------- |
| `--cwd <path>`                | `.`           | Working directory                           |
| `--pm <bun\|pnpm\|yarn\|npm>` | auto-detected | Override package-manager detection          |
| `--skip-install`              | `false`       | Skip installation; only print the prompt    |
| `--dry-run`                   | `false`       | Show planned actions without executing      |
| `--yes`, `-y`                 | `false`       | Skip the confirmation prompt                |
| `--out <path>`                | auto-detected | Output path for the starter `openpolicy.ts` |
| `--force`                     | `false`       | Overwrite an existing `openpolicy.ts`       |

## Why a prompt instead of a wizard?

A coding agent reading your actual codebase can fill in `dataCollected`, `thirdParties`, `jurisdictions`, `legalBasis`, and cookie usage more accurately than a series of prompts ever could — it infers from your ORM schemas, imports, environment variables, and existing legal copy. The CLI gives you the scaffolding, the agent supplies the content.

See [Configuration](/configuration) for the shape of `openpolicy.ts` and [Auto-collect](/policies/auto-collect) for declaring data collection inline in your source.
