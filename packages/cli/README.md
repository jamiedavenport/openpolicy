# `@openpolicy/cli`

> CLI for generating and validating [OpenPolicy](https://openpolicy.sh) policy documents.

Compile privacy policies and terms of service to Markdown, HTML, or PDF from the command line — no Vite or Astro required.

## Install

```sh
bun add -D @openpolicy/cli
bun add @openpolicy/sdk
# or: npm install --save-dev @openpolicy/cli @openpolicy/sdk
```

Or run without installing:

```sh
bunx @openpolicy/cli --help
```

## Commands

### `init` — interactive setup wizard

Creates a starter config file with placeholder content:

```sh
openpolicy init                  # privacy policy (default)
openpolicy init --type terms     # terms of service
```

### `generate` — compile a policy

```sh
openpolicy generate ./privacy.config.ts --format markdown,html --out ./public/policies
openpolicy generate ./terms.config.ts   --format markdown      --out ./public/policies
```

| Flag | Default | Description |
|---|---|---|
| `--format` | `markdown` | Comma-separated output formats: `markdown`, `html`, `pdf` |
| `--out` | `./public/policies` | Output directory |
| `--type` | auto-detected | Override policy type: `privacy` or `terms` |
| `--watch` | `false` | Watch config files and regenerate on changes |

Policy type is auto-detected from the filename — files containing `"terms"` compile as terms of service.

### `validate` — check a policy config

```sh
openpolicy validate ./privacy.config.ts
openpolicy validate ./privacy.config.ts --jurisdiction gdpr
```

| Flag | Default | Description |
|---|---|---|
| `--jurisdiction` | `all` | Validate against: `gdpr`, `ccpa`, or `all` |
| `--type` | auto-detected | Override policy type: `privacy` or `terms` |

## Documentation

[openpolicy.sh/docs/getting-started/cli](https://openpolicy.sh/docs/getting-started/cli)

## Links

- [GitHub](https://github.com/jamiedavenport/openpolicy)
- [openpolicy.sh](https://openpolicy.sh)
- [npm](https://www.npmjs.com/package/@openpolicy/cli)
