---
title: OpenPolicy with Svelte
description: Generate and render privacy and cookie policies in Svelte and SvelteKit apps using OpenPolicy.
framework: Svelte
icon: simple-icons:svelte
pubDate: 2026-03-23
---

# OpenPolicy with Svelte

Native Svelte components for displaying OpenPolicy-generated legal pages in any Svelte 5 or SvelteKit app.

## Install

```bash
bun add @openpolicy/sdk @openpolicy/svelte
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
<!-- src/routes/privacy/+page.svelte -->
<script lang="ts">
import { OpenPolicy, PrivacyPolicy } from "@openpolicy/svelte";
import config from "../../openpolicy";
</script>

<svelte:head>
	<title>Privacy Policy</title>
</svelte:head>

<main>
	<OpenPolicy {config}>
		<PrivacyPolicy />
	</OpenPolicy>
</main>
```

## Why OpenPolicy for Svelte

- **Native Svelte 5 components** — runes-ready, no `?raw` HTML imports
- **Slot-friendly overrides** — swap any heading, paragraph, or table renderer with a snippet
- **Works with SvelteKit SSR** — renders cleanly server-side for instant first paint
- **Version controlled** — policy text lives in your repo, not a third-party dashboard
- **GDPR & CCPA built in** — flip compliance flags in your config, not in manual prose
