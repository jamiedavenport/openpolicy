---
title: Vite
description: Generate policy files at build time with the OpenPolicy Vite plugin
---

See the [Generation Overview](/generation/overview) for context.

The `@openpolicy/vite` plugin generates policy files during the Vite build and watches for config changes in dev.

## Install

```sh
bun add -D @openpolicy/vite
```

## Setup

```ts
// vite.config.ts
import { defineConfig } from "vite";
import { openPolicy } from "@openpolicy/vite";

export default defineConfig({
  plugins: [
    openPolicy(),
  ],
});
```

By default this reads `openpolicy.ts` from the project root and writes output to `public/policies/` as Markdown.

## Options

```ts
openPolicy({
  configPath: "openpolicy.ts",   // path to your config file
  formats: ["markdown"],         // "markdown" | "html" | "pdf"
  outDir: "public/policies",     // output directory
})
```

| Option | Type | Default | Description |
|---|---|---|---|
| `configPath` | `string` | `"openpolicy.ts"` | Path to your config file |
| `formats` | `OutputFormat[]` | `["markdown"]` | One or more output formats |
| `outDir` | `string` | `"public/policies"` | Directory to write files into |

## With auto-collect

If you use `autoCollect()` to scan source files for data collection annotations, add it before `openPolicy()` in your plugin array so the scan completes before the policy config is imported.

```ts
// vite.config.ts
import { autoCollect } from "@openpolicy/vite-auto-collect";
import { openPolicy } from "@openpolicy/vite";

export default defineConfig({
  plugins: [
    autoCollect(),
    openPolicy(),
  ],
});
```

See [Auto-collect](/policies/auto-collect) for full setup and options.
