---
title: "@policystack/cli"
description: "Terminal UI for scans and config sync"
product: consent
---

Terminal entry point for Consent. Wraps [`@policystack/vite`](/docs/consent/scanner) for one-off scans, config init, and writing back vendor-category suggestions that the [Vite plugin](/docs/consent/vite) only prints.

> Status: the `@policystack/cli` package ships with a `policystack` bin (`init`, `validate`, `mcp`); the consent-specific scan/sync commands below are still in flight. For build-time scanning today, use [`@policystack/vite`](/docs/consent/vite) — same scanner, integrated with HMR and `vite build`.

## Install

```sh
bun add -D @policystack/cli
```

## Usage

```sh
policystack --help
```

## Planned commands

- `policystack scan` — run the scanner against a project, print findings.
- `policystack sync` — apply the vendor-category suggestions the scanner detects, writing them to your `policystack.ts`.

Track progress in the repo issues.

## See also

- [`@policystack/vite`](/docs/consent/scanner) — the detection engine the CLI wraps
- [`@policystack/vite`](/docs/consent/vite) — recommended for in-editor / CI feedback today
- [`@policystack/core/consent`](/docs/consent/core) — runtime config the CLI generates and edits

## License

Apache-2.0
