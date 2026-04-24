---
title: OpenPolicy with Astro
description: Render privacy and cookie policies directly in Astro pages using @openpolicy/core.
framework: Astro
icon: simple-icons:astro
pubDate: 2026-03-23
---

# OpenPolicy with Astro

Compile policies directly in your Astro page frontmatter with `@openpolicy/core` — no integration, no generated files.

## Install

```bash
bun add @openpolicy/sdk @openpolicy/core @openpolicy/renderers
```

## Define your policy

```ts
// src/openpolicy.ts
import { definePrivacyPolicy } from "@openpolicy/sdk";

export default definePrivacyPolicy({
	company: { name: "Acme Inc.", website: "https://acme.com" },
	contact: { email: "privacy@acme.com" },
	compliance: { gdpr: true, ccpa: true },
});
```

## Render in a page

```astro
---
// src/pages/privacy-policy.astro
import { compile, expandOpenPolicyConfig } from "@openpolicy/core";
import { renderHTML } from "@openpolicy/renderers";
import openpolicy from "../openpolicy";

const policies = expandOpenPolicyConfig(openpolicy);
const privacyPolicy = policies.find((p) => p.type === "privacy");
if (!privacyPolicy) throw new Error("Privacy policy not found");

const policy = renderHTML(compile(privacyPolicy));
---

<html lang="en">
  <head><title>Privacy Policy — Acme</title></head>
  <body>
    <main set:html={policy} />
  </body>
</html>
```

## Why OpenPolicy for Astro

- **Zero JS by default** — the policy compiles to static HTML in frontmatter; no client bundle added
- **`set:html` directive** — Astro's built-in way to render trusted HTML strings
- **No integration required** — just call `compile()` in frontmatter where you need it
- **Ships with your content** — policy lives alongside your Markdown and MDX content, version controlled in git
