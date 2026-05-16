---
title: "@opencookies/cli"
description: "Terminal UI for scans and config sync"
product: opencookies
---

Terminal entry point for OpenCookies. Wraps [`@opencookies/scanner`](/docs/opencookies/scanner) for one-off scans, config init, and writing back vendor-category suggestions that the [Vite plugin](/docs/opencookies/vite) only prints.

> Status: scaffold. The package and `opencookies` bin are reserved; the implementation is in flight. For build-time scanning today, use [`@opencookies/vite`](/docs/opencookies/vite) — same scanner, integrated with HMR and `vite build`.

## Install

```sh
bun add -D @opencookies/cli
```

## Usage

```sh
opencookies --help
```

## Planned commands

- `opencookies scan` — run the scanner against a project, print findings.
- `opencookies init` — scaffold a starter `cookies.config.ts` with the categories the scanner detected.
- `opencookies sync` — apply the vendor-category suggestions the Vite plugin prints when `autoSync: true`, writing them to your config file.

Track progress in the repo issues.

## See also

- [`@opencookies/scanner`](/docs/opencookies/scanner) — the detection engine the CLI wraps
- [`@opencookies/vite`](/docs/opencookies/vite) — recommended for in-editor / CI feedback today
- [`@opencookies/core`](/docs/opencookies/core) — runtime config the CLI generates and edits

## License

Apache-2.0
