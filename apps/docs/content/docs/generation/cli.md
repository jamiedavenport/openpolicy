---
title: CLI
description: Generate and validate policies from the command line
---

See the [Generation Overview](/generation/overview) for context.

`@openpolicy/cli` lets you generate and validate policies outside of a build tool.

## Install

```sh
bun add -D @openpolicy/cli
# or use npx without installing
npx openpolicy --help
```

## Generate

Compile a config file to one or more output formats:

```sh
openpolicy generate openpolicy.ts
openpolicy generate openpolicy.ts --format html
openpolicy generate openpolicy.ts --format markdown,html,pdf --out dist/policies
```

| Flag | Default | Description |
|---|---|---|
| `--format` | `markdown` | Comma-separated formats: `markdown`, `html`, `pdf` |
| `--out` | `./output` | Output directory |
| `--watch` | — | Watch the config file and regenerate on changes |

## Validate

Check your config for compliance issues:

```sh
openpolicy validate openpolicy.ts
openpolicy validate openpolicy.ts --jurisdiction gdpr
```

| Flag | Default | Description |
|---|---|---|
| `--jurisdiction` | `all` | Jurisdiction to validate against: `gdpr`, `ccpa`, or `all` |

Exits with a non-zero code if any errors are found, making it suitable for CI.

## Init

Create a starter config interactively:

```sh
openpolicy init
```
