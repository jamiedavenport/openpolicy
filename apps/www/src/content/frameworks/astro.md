---
title: OpenPolicy with Astro
description: Generate and render privacy policies and terms of service in Astro sites using the OpenPolicy Astro integration.
framework: Astro
icon: simple-icons:astro
pubDate: 2026-03-23
---

# OpenPolicy with Astro

The `@openpolicy/astro` integration wires up the Vite plugin for you and lets you import compiled policy HTML directly into `.astro` components.

## Install

```bash
bun add @openpolicy/sdk @openpolicy/astro
```

## Configure the integration

```ts
// astro.config.mjs
import { defineConfig } from "astro/config";
import openPolicy from "@openpolicy/astro";

export default defineConfig({
  integrations: [
    openPolicy({ configs: ["./src/openpolicy.ts"] }),
  ],
});
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
import policy from "../privacy-policy.html?raw";
---

<html lang="en">
  <head><title>Privacy Policy — Acme</title></head>
  <body>
    <main set:html={policy} />
  </body>
</html>
```

## Why OpenPolicy for Astro

- **Zero JS by default** — the policy compiles to static HTML; no client bundle added
- **`set:html` directive** — Astro's built-in way to render trusted HTML strings
- **Seamless Vite integration** — the Astro integration handles plugin wiring for you
- **Ships with your content** — policy lives alongside your Markdown and MDX content, version controlled in git
