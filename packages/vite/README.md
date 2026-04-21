# `@openpolicy/vite`

> Vite plugin that scans source files for [OpenPolicy](https://openpolicy.sh) `collecting()` and `thirdParty()` calls and populates the SDK's auto-collected registry at build time.

At `buildStart` the plugin walks your `srcDir`, extracts every `collecting()` / `thirdParty()` call from `@openpolicy/sdk`, and exposes the merged result as `dataCollected` / `thirdParties` on `@openpolicy/sdk`. Your policy config spreads those values into the runtime-rendered policy — no files are written to disk.

## Install

```sh
bun add -D @openpolicy/vite
bun add @openpolicy/sdk
# or: npm install --save-dev @openpolicy/vite && npm install @openpolicy/sdk
```

## Setup

```ts
// vite.config.ts
import { defineConfig } from "vite";
import { openPolicy } from "@openpolicy/vite";

export default defineConfig({
  plugins: [openPolicy()],
});
```

Astro users: add it the same way under `vite.plugins` in `astro.config.mjs`.

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `srcDir` | `string` | `"src"` | Directory walked for `collecting()` / `thirdParty()` calls, relative to the Vite root. |
| `extensions` | `string[]` | `[".ts", ".tsx"]` | File extensions to scan. |
| `ignore` | `string[]` | `[]` | Extra directory basenames to skip (appended to the built-in list: `node_modules`, `dist`, `.git`, `.next`, `.output`, `.svelte-kit`, `.cache`). |
| `thirdParties.usePackageJson` | `boolean` | `false` | Auto-detect third-party services from `package.json` dependencies against the built-in registry (Stripe, Sentry, PostHog, etc.). |

## Documentation

[openpolicy.sh/docs](https://docs.openpolicy.sh)

## Links

- [GitHub](https://github.com/jamiedavenport/openpolicy)
- [openpolicy.sh](https://openpolicy.sh)
- [npm](https://www.npmjs.com/package/@openpolicy/vite)
