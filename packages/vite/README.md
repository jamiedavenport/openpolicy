# `@openpolicy/vite`

> Vite plugin for compiling [OpenPolicy](https://openpolicy.sh) policy documents at build time.

Compiles `defineConfig()` configs to Markdown or HTML automatically — on every build and on save in dev mode.

## Install

```sh
bun add -D @openpolicy/vite
bun add @openpolicy/sdk
# or: npm install --save-dev @openpolicy/vite @openpolicy/sdk
```

## Setup

```ts
// vite.config.ts
import { defineConfig } from "vite";
import { openPolicy } from "@openpolicy/vite";

export default defineConfig({
  plugins: [
    openPolicy({
      formats: ["markdown"],
      outDir: "public/policies",
    }),
  ],
});
```

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `configPath` | `string` | `"openpolicy.ts"` | Path to the unified policy config file, relative to the Vite root. |
| `formats` | `OutputFormat[]` | `["markdown"]` | `"markdown"` or `"html"` |
| `outDir` | `string` | `"public/policies"` | Output directory, relative to the Vite root |

## Scaffold

If a config file doesn't exist when Vite starts, the plugin creates a starter file with placeholder content — edit and save to generate your first policy.

## Astro

For Astro projects, use [`@openpolicy/astro`](https://openpolicy.sh/docs/getting-started/astro) instead — it wraps this plugin and plugs into Astro's integration API.

## Documentation

[openpolicy.sh/docs/getting-started/vite](https://openpolicy.sh/docs/getting-started/vite)

## Links

- [GitHub](https://github.com/jamiedavenport/openpolicy)
- [openpolicy.sh](https://openpolicy.sh)
- [npm](https://www.npmjs.com/package/@openpolicy/vite)
