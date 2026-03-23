---
title: OpenPolicy with Svelte
description: Generate and render privacy policies and terms of service in Svelte and SvelteKit apps using OpenPolicy.
framework: Svelte
icon: simple-icons:svelte
pubDate: 2026-03-23
---

# OpenPolicy with Svelte

Use the Vite plugin to compile your policy at build time and import it as a string into any Svelte component.

## Install

```bash
bun add @openpolicy/sdk @openpolicy/vite
```

## Configure the Vite plugin

```ts
// vite.config.ts
import { sveltekit } from "@sveltejs/kit/vite";
import { openPolicy } from "@openpolicy/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    sveltekit(),
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

## Render in a route

```svelte
<!-- src/routes/privacy-policy/+page.svelte -->
<script lang="ts">
  import policy from "../../privacy-policy.html?raw";
</script>

<svelte:head>
  <title>Privacy Policy — Acme</title>
</svelte:head>

<main>
  {@html policy}
</main>
```

## Why OpenPolicy for Svelte

- **Compiled at build time** — zero runtime overhead; the policy is plain HTML
- **Works with SvelteKit SSR** — the HTML string renders server-side for instant first paint
- **`?raw` import** — standard Vite feature, no extra loader needed
- **Policy as code** — change your data-handling, update the config, rebuild — done
