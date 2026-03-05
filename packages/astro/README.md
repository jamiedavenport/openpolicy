# `@openpolicy/astro`

> Astro integration for compiling [OpenPolicy](https://openpolicy.sh) policy documents at build time.

A first-class Astro integration that compiles `definePrivacyPolicy()` and `defineTermsOfService()` configs to Markdown or HTML — on every build and on save in dev mode. Delegates to `@openpolicy/vite` under the hood.

## Install

```sh
# Recommended — auto-updates astro.config.mjs
npx astro add @openpolicy/astro

# Also install the SDK for defining policies
bun add @openpolicy/sdk
```

Or manually:

```sh
bun add -D @openpolicy/astro @openpolicy/vite
bun add @openpolicy/sdk
```

## Setup

```js
// astro.config.mjs
import { defineConfig } from "astro/config";
import { openPolicy } from "@openpolicy/astro";

export default defineConfig({
  integrations: [
    openPolicy({
      configs: [
        "privacy.config.ts",
        { config: "terms.config.ts", type: "terms" },
      ],
      formats: ["markdown"],
      outDir: "src/generated/policies",
    }),
  ],
});
```

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `configs` | `PolicyConfigEntry[]` | — | Policy configs to compile. Type is auto-detected from filename (`"terms"` → terms of service, otherwise privacy). Each entry is a path string or `{ config: string; type?: "privacy" \| "terms" }`. |
| `formats` | `OutputFormat[]` | `["markdown"]` | `"markdown"` or `"html"` |
| `outDir` | `string` | `"public/policies"` | Output directory, relative to the Astro root |

## Using the output

Because the generated files land in `src/`, Astro can import them as Markdown components:

```astro
---
// src/pages/privacy.astro
import { Content } from "../../generated/policies/privacy-policy.md";
---
<div class="prose">
  <Content />
</div>
```

## Documentation

[openpolicy.sh/docs/getting-started/astro](https://openpolicy.sh/docs/getting-started/astro)

## Links

- [GitHub](https://github.com/jamiedavenport/openpolicy)
- [openpolicy.sh](https://openpolicy.sh)
- [npm](https://www.npmjs.com/package/@openpolicy/astro)
