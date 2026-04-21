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

Cookie pages work the same way — just find `type === "cookie"` instead.

See the [full working example](https://github.com/openpolicyhq/openpolicy/tree/main/examples/astro) and the [blog post](/blog/no-build-astro) for a complete walkthrough.

---

## Auto-collect annotations

If you annotate data collection with `collecting()` / `thirdParty()` inside your source, add the Vite plugin directly to `astro.config.mjs` so those calls are scanned at build time:

```ts
// astro.config.ts
import { defineConfig } from "astro/config";
import { openPolicy } from "@openpolicy/vite";

export default defineConfig({
  vite: {
    plugins: [openPolicy()],
  },
});
```

See [Auto-collect](/policies/auto-collect) for full details.

## Alternative: CLI

You can also generate policy files once with the CLI, outside of any build process. See the [CLI docs](/generation/cli).
