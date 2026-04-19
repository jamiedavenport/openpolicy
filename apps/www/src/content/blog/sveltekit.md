---
title: "Policy Pages in SvelteKit That Actually Stay Up to Date"
description: "Use the OpenPolicy Vite plugin to generate legally-structured privacy and cookie policy pages at build time — hot-reloaded in dev, committed with your code."
pubDate: 2026-03-13
author: "OpenPolicy Team"
---

SvelteKit apps need legal pages before launch. The usual approach: find a template, paste it into a `+page.svelte`, and hope nobody notices when it still references "Your Company Name" six months later.

OpenPolicy treats your policies like code. You define them as TypeScript objects in `openpolicy.ts`, and the Vite plugin compiles them to HTML at build time — automatically, on every deploy, in sync with the rest of your app.

## Install

```sh
bun add @openpolicy/sdk
bun add -D @openpolicy/vite
```

## Define your policies

Create a single `openpolicy.ts` at the root of your project. The unified `defineConfig()` lets you define all policies in one file with a shared `company` block:

```ts
// openpolicy.ts
import { defineConfig } from "@openpolicy/sdk";

export default defineConfig({
  company: {
    name: "Acme",
    legalName: "Acme, Inc.",
    address: "123 Main St, San Francisco, CA 94105",
    contact: "privacy@acme.com",
  },
  effectiveDate: "2026-03-13",
  jurisdictions: ["us", "eu"],
  dataCollected: {
    "Account information": ["Email address", "Display name"],
    "Usage data": ["Pages visited", "Session duration"],
  },
  legalBasis: ["legitimate_interests", "consent"],
  retention: {
    "Account data": "Until account deletion",
    "Analytics data": "13 months",
  },
  userRights: ["access", "erasure", "portability", "objection"],
  thirdParties: [
    {
      name: "Plausible",
      purpose: "Privacy-friendly analytics",
      policyUrl: "https://plausible.io/privacy",
    },
    { name: "Vercel", purpose: "Hosting and edge delivery" },
  ],
  cookies: {
    essential: true,
    analytics: true,
    functional: false,
    marketing: false,
  },
  consentMechanism: {
    hasBanner: true,
    hasPreferencePanel: false,
    canWithdraw: true,
  },
});
```

## Add the plugin to your Vite config

SvelteKit is built on Vite, so the plugin slots in naturally alongside `sveltekit()`:

```ts
// vite.config.ts
import { openPolicy } from "@openpolicy/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    sveltekit(),
    openPolicy({
      formats: ["html"],
      outDir: "src/lib/policies",
    }),
  ],
});
```

Outputting to `src/lib/policies` puts the files inside SvelteKit's `$lib` alias so you can import them directly in any route.

## What gets generated

```
src/lib/policies/
  privacy-policy.html
  cookie-policy.html
```

A single `defineConfig()` compiles both policies in one pass — OpenPolicy auto-detects which to generate from the fields you provide.

## Render on dedicated routes

Import each HTML file as a raw string using Vite's `?raw` suffix, then render it with Svelte's `{@html}` tag:

```svelte
<!-- src/routes/privacy/+page.svelte -->
<svelte:head>
  <title>Privacy Policy</title>
</svelte:head>

<script lang="ts">
  import policy from "$lib/policies/privacy-policy.html?raw";
</script>

<main>
  {@html policy}
</main>
```

```svelte
<!-- src/routes/cookie/+page.svelte -->
<svelte:head>
  <title>Cookie Policy</title>
</svelte:head>

<script lang="ts">
  import policy from "$lib/policies/cookie-policy.html?raw";
</script>

<main>
  {@html policy}
</main>
```

## Hot-reload in dev

During `vite dev`, the plugin watches `openpolicy.ts` for changes and regenerates the affected policy files on every save — no restart needed. The same hot-reload loop you rely on for Svelte components works for your policy documents too.

## Why this is better than a static page

- **Type-safe.** Every field is checked by TypeScript. You can't ship a policy with a missing contact email.
- **Structured.** Each section is generated from your actual config — no stale placeholder text.
- **Version-controlled.** The config lives in your repo. `git blame` shows you when and why anything changed.
- **Jurisdiction-aware.** Set `jurisdictions: ["eu"]` and GDPR-required sections (right to erasure, data transfers, DPA contact) are included automatically.

The generated HTML includes all required sections for the jurisdictions you specify. You own the config; OpenPolicy handles the legal structure.
