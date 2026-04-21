---
title: Vite
description: Scan source files for data-collection annotations at build time
---

See the [Generation Overview](/generation/overview) for context.

The `@openpolicy/vite` plugin scans your source for `collecting()` and `thirdParty()` calls and populates the `@openpolicy/sdk` auto-collected registry so `dataCollected` / `thirdParties` are available at runtime. It does not write policy files — render policies directly in your app via SDK components, or use the CLI for static output.

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

By default the plugin walks `src/` for `.ts` / `.tsx` files and refreshes its registry on change during `vite dev`.

## Options

```ts
openPolicy({
  srcDir: "src",
  extensions: [".ts", ".tsx"],
  ignore: [],
  thirdParties: { usePackageJson: false },
})
```

| Option | Type | Default | Description |
|---|---|---|---|
| `srcDir` | `string` | `"src"` | Directory walked for `collecting()` / `thirdParty()` calls |
| `extensions` | `string[]` | `[".ts", ".tsx"]` | File extensions scanned |
| `ignore` | `string[]` | `[]` | Extra directory names to skip (appended to built-in ignores) |
| `thirdParties.usePackageJson` | `boolean` | `false` | Auto-detect third parties from `package.json` against the known-packages registry |

See [Auto-collect](/policies/auto-collect) for annotation patterns and examples.
