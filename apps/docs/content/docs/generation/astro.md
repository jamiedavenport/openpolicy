---
title: Astro
description: Generate policy files in Astro projects with @openpolicy/astro
---

See the [Generation Overview](/generation/overview) for context.

`@openpolicy/astro` wraps the Vite plugin as a native Astro integration. It accepts the same options.

## Install

```sh
bun add -D @openpolicy/astro
```

## Setup

```ts
// astro.config.ts
import { defineConfig } from "astro/config";
import { openPolicy } from "@openpolicy/astro";

export default defineConfig({
  integrations: [
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
