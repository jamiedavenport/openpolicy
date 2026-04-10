---
title: Astro
description: Render policy documents in Astro pages using @openpolicy/core
---

## Recommended: compile directly in frontmatter

The simplest approach is to call `@openpolicy/core` directly in your Astro page frontmatter. No integration, no generated files — compilation happens at build time, inline with the page that uses it.

```sh
bun add @openpolicy/sdk @openpolicy/core @openpolicy/renderers
```

```astro
---
// src/pages/privacy.astro
import { compile, expandOpenPolicyConfig } from "@openpolicy/core";
import { renderHTML } from "@openpolicy/renderers";
import openpolicy from "../lib/openpolicy";

const policies = expandOpenPolicyConfig(openpolicy);
const privacyPolicy = policies.find((p) => p.type === "privacy");

if (!privacyPolicy) {
  throw new Error("Privacy policy not found in config");
}

const policy = renderHTML(compile(privacyPolicy));
---

<div set:html={policy} />
```

`expandOpenPolicyConfig` splits your unified config into individual policies. `compile` runs each through its section builders. `renderHTML` converts the result to an HTML string.

Terms and cookie pages work the same way — just find `type === "terms"` or `type === "cookie"` instead.

See the [full working example](https://github.com/openpolicyhq/openpolicy/tree/main/examples/astro) and the [blog post](/blog/no-build-astro) for a complete walkthrough.

---

## Alternative: `@openpolicy/astro` integration

The Astro integration still works if you prefer file-based output. It wraps the Vite plugin as a native Astro integration and writes policy files to a directory at build time.

```sh
bun add -D @openpolicy/astro
```

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

### Options

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

## Alternative: CLI

You can also generate policy files once with the CLI, outside of any build process. See the [CLI docs](/generation/cli).
