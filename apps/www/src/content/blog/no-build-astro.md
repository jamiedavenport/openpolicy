---
title: "Zero-build privacy policies with Astro"
description: "Skip the Vite plugin — compile privacy and cookie policies directly in Astro page frontmatter using @openpolicy/core."
pubDate: 2026-04-10
author: "OpenPolicy Team"
---

When we launched the OpenPolicy Astro integration in March, it worked by generating Markdown files at build time. You added the plugin to `astro.config.mjs`, pointed it at an output directory, and Astro imported the generated `.md` files as components.

```js
// astro.config.mjs — old approach
import { openPolicy } from "@openpolicy/astro";

export default defineConfig({
	integrations: [
		openPolicy({
			formats: ["markdown"],
			outDir: "src/generated/policies",
		}),
	],
});
```

It worked. But it added friction: an extra package, a `.gitignore` entry for the generated directory, and a file-watching step between your config and your page.

The core library now compiles policies directly. You can call it straight from Astro's frontmatter — no integration, no generated files.

## Install

```sh
bun add @openpolicy/sdk @openpolicy/core @openpolicy/renderers
```

No Astro integration needed. No Vite plugin. Three packages.

## Define your config

Create `src/lib/openpolicy.ts`:

```ts
import { defineConfig } from "@openpolicy/sdk";

export default defineConfig({
	company: {
		name: "Acme",
		legalName: "Acme, Inc.",
		// ...
	},
	effectiveDate: "2026-04-01",
	jurisdictions: ["eu", "us-ca"],
	// Privacy policy fields — auto-detected from field presence
	data: {
		collected: {
			/* ... */
		},
		purposes: {
			/* ... */
		},
		lawfulBasis: {
			/* ... */
		},
		retention: {
			/* ... */
		},
	},
	// ...
	// Cookie policy fields — auto-detected from field presence
	cookies: {
		used: { essential: true /* ... */ },
		lawfulBasis: {
			/* ... */
		},
	},
	// ...
});
```

See the [full config schema](https://docs.openpolicy.sh/configuration) for all available fields.

The fastest way to fill this out is to paste your existing privacy page (or just describe your app) into Claude and ask it to generate the config. Because the output is deterministic — the same config always produces the same policy — Claude is only configuring, not writing legal text. You review the inputs, OpenPolicy handles the rest.

## Render on a dedicated page

Each page finds its policy from the config, compiles it, and renders to HTML — all in the frontmatter:

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

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>Privacy Policy</title>
  </head>
  <body>
    <div set:html={policy} />
  </body>
</html>
```

`expandOpenPolicyConfig` splits the unified config into individual policies. `compile` runs each through its section builders. `renderHTML` converts the result to an HTML string. `set:html` renders it without escaping.

Everything runs at build time. Zero JavaScript ships to the browser.

Cookie pages work the same way — just find `type === "cookie"` instead.

## `astro.config.mjs`

```js
import { defineConfig } from "astro/config";

export default defineConfig({});
```

No integrations. No plugins. Nothing to configure.

## Why this is simpler than the old approach

The plugin approach generated intermediate files that lived in your `src/` directory. This one doesn't:

- **No generated files.** No `src/generated/` directory to create, manage, or exclude from git.
- **No plugin configuration.** `astro.config.mjs` stays empty. No `outDir`, no `formats`, no watched paths.
- **No extra package.** Drop `@openpolicy/astro` — only `core` and `renderers` are needed at runtime.
- **Both policy types.** Privacy and cookie policies compile from one config. Same `defineConfig()` call, same pipeline.

The output is the same as before: statically rendered HTML with no client-side JavaScript. The difference is that the compilation happens inline, in the page that uses it, rather than as a side-effect of a plugin watching your filesystem.

The full working example is in the [examples/astro](https://github.com/jamiedavenport/openpolicy/tree/main/examples/astro) directory of the repo.

## Going further with OpenPolicy+

If you need more than static generation, [OpenPolicy+](https://plus.openpolicy.sh) extends the core library with cloud-based consent tracking, PR automation (policy linting, compliance checks on every pull request), and hands-on onboarding from our team. [Book a demo](https://cal.eu/jamie-openpolicy/openpolicy-chat-demo) and we'll help you get set up.
