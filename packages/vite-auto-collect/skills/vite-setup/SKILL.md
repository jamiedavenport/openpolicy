---
name: vite-setup
description: >
  Configuring the autoCollect() Vite plugin from @openpolicy/vite-auto-collect to populate
  the dataCollected and thirdParties sentinels at build time by scanning source files for
  collecting() and thirdParty() calls. Covers AutoCollectOptions (srcDir, extensions, ignore,
  thirdParties.usePackageJson), enforce: "pre" plugin ordering, virtual module interception,
  and dev-server hot reload behaviour.
type: framework
library: openpolicy
framework: vite
library_version: "0.0.19"
requires:
  - openpolicy/define-config
sources:
  - jamiedavenport/openpolicy:packages/vite-auto-collect/src/index.ts
  - jamiedavenport/openpolicy:packages/vite-auto-collect/src/scan.ts
---

This skill builds on openpolicy/define-config. Read it first.

## Overview

`autoCollect()` is a Vite plugin that scans your source files at build time, extracts
`collecting()` and `thirdParty()` call metadata via static AST analysis (oxc-parser), and
injects the results into the `@openpolicy/sdk` module graph as a virtual module. The sentinels
`dataCollected` and `thirdParties` exported from `@openpolicy/sdk` are then populated with the
scanned data when your policy config is evaluated.

The plugin uses `enforce: "pre"` so it always runs before other plugins. In dev mode it watches
the `srcDir` tree and triggers a full page reload when annotations change.

## AutoCollectOptions type

```ts
type AutoCollectOptions = {
  // Directory walked for collecting() calls. Resolved relative to the Vite
  // project root. Defaults to "src".
  srcDir?: string;

  // File extensions scanned. Defaults to [".ts", ".tsx"].
  extensions?: string[];

  // Extra directory names skipped during the walk. Appended to the built-in
  // defaults: node_modules, dist, .git, .next, .output, .svelte-kit, .cache
  ignore?: string[];

  thirdParties?: {
    // When true, reads package.json dependencies and devDependencies and
    // matches them against the built-in KNOWN_PACKAGES registry (~30 common
    // npm packages). Matched entries are added to thirdParties automatically.
    usePackageJson?: boolean;
  };
};
```

## Setup

Install the package:

```sh
bun add -D @openpolicy/vite-auto-collect
```

## Core Patterns

### 1. Basic setup

The minimum configuration — no options required:

```ts
// vite.config.ts
import { defineConfig } from "vite";
import { autoCollect } from "@openpolicy/vite-auto-collect";

export default defineConfig({
  plugins: [autoCollect()],
});
```

The plugin scans `<root>/src/**/*.{ts,tsx}` by default.

### 2. With usePackageJson

Enable automatic third-party detection from `package.json`. The plugin reads all
`dependencies` and `devDependencies` and cross-references them against the built-in
`KNOWN_PACKAGES` registry. Matched entries are merged into the `thirdParties` sentinel
alongside any `thirdParty()` call results.

```ts
// vite.config.ts
import { defineConfig } from "vite";
import { autoCollect } from "@openpolicy/vite-auto-collect";

export default defineConfig({
  plugins: [
    autoCollect({
      thirdParties: {
        usePackageJson: true,
      },
    }),
  ],
});
```

### 3. Custom srcDir, extensions, and ignore

Use `srcDir` when source files live outside the default `src/` directory (e.g. Next.js `app/`,
Nuxt `pages/`). Use `extensions` to include `.js` or `.jsx` files. Use `ignore` to skip
additional directories that the built-in defaults do not cover.

```ts
// vite.config.ts
import { defineConfig } from "vite";
import { autoCollect } from "@openpolicy/vite-auto-collect";

export default defineConfig({
  plugins: [
    autoCollect({
      srcDir: "app",
      extensions: [".ts", ".tsx", ".js", ".jsx"],
      ignore: ["__tests__", "storybook-static"],
      thirdParties: {
        usePackageJson: true,
      },
    }),
  ],
});
```

### Wiring sentinels in openpolicy.ts

The plugin only has an effect if the `dataCollected` and `thirdParties` sentinels from
`@openpolicy/sdk` are spread into the policy config. Without this, the scan results are
discarded:

```ts
// openpolicy.ts
import { defineConfig, dataCollected, thirdParties } from "@openpolicy/sdk";

export default defineConfig({
  company: {
    name: "Acme",
    legalName: "Acme, Inc.",
    address: "123 Main St, Springfield, USA",
    contact: "privacy@acme.com",
  },
  privacy: {
    effectiveDate: "2026-01-01",
    dataCollected: {
      ...dataCollected,
      // Manually declared categories merge alongside auto-collected ones
      "Account Information": ["Email address", "Display name"],
    },
    thirdParties: [...thirdParties],
  },
});
```

## Common Mistakes

### CRITICAL — Using `openPolicy()` from `@openpolicy/vite` instead of `autoCollect()`

`openPolicy()` and `autoCollect()` are different plugins with different purposes:

- `openPolicy()` (from `@openpolicy/vite`) generates static `.md`, `.html`, or `.pdf` files
  at build time. It does not populate sentinels and does not integrate with React rendering.
- `autoCollect()` (from `@openpolicy/vite-auto-collect`) populates `dataCollected` and
  `thirdParties` sentinels at build time for use with `@openpolicy/react` components.

Using `openPolicy()` when you intend to render with React produces stale static files that
the React components never read. The sentinels remain empty.

```ts
// WRONG — old static generation pattern
import { openPolicy } from "@openpolicy/vite";

export default defineConfig({
  plugins: [openPolicy({ formats: ["markdown"], outDir: "public/policies" })],
});
```

```ts
// CORRECT — sentinel population for React rendering
import { autoCollect } from "@openpolicy/vite-auto-collect";

export default defineConfig({
  plugins: [autoCollect({ thirdParties: { usePackageJson: true } })],
});
```

### MEDIUM — Expecting autoCollect to scan files outside the default `srcDir`

`autoCollect()` only walks the directory specified by `srcDir` (default: `"src"` relative to
the Vite project root). Any `collecting()` or `thirdParty()` calls placed in config files,
scripts, `test/`, or other top-level directories are silently ignored — no warning is emitted.

```ts
// WRONG — collecting() in scripts/seed.ts is outside "src", silently ignored
// autoCollect() with default options never scans it
```

```ts
// CORRECT — either move annotations into src/, or configure srcDir to cover the directory:
autoCollect({ srcDir: "app" })

// Or add a second directory by using a broader common ancestor:
autoCollect({ srcDir: "." , ignore: ["node_modules", "dist", "public"] })
```
