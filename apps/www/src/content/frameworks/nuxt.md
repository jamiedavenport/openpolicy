---
title: OpenPolicy with Nuxt
description: Generate and render privacy and cookie policies in Nuxt apps using OpenPolicy.
framework: Nuxt
icon: simple-icons:nuxtdotjs
pubDate: 2026-03-23
---

# OpenPolicy with Nuxt

Add legal pages to your Nuxt app using the same Vue components — no extra adapter needed.

## Install

```bash
bun add @openpolicy/sdk @openpolicy/vue
```

## Define your policy

```ts
// lib/openpolicy.ts
import { definePrivacyPolicy } from "@openpolicy/sdk";

export const privacyPolicy = definePrivacyPolicy({
	company: { name: "Acme Inc.", website: "https://acme.com" },
	contact: { email: "privacy@acme.com" },
	compliance: { gdpr: true, ccpa: true },
});
```

## Render in a page

```vue
<!-- pages/privacy-policy.vue -->
<script setup lang="ts">
import { OpenPolicy, PrivacyPolicy } from "@openpolicy/vue";
import { privacyPolicy } from "@/lib/openpolicy";

useSeoMeta({ title: "Privacy Policy — Acme" });
</script>

<template>
	<main>
		<OpenPolicy :config="privacyPolicy">
			<PrivacyPolicy />
		</OpenPolicy>
	</main>
</template>
```

## Why OpenPolicy for Nuxt

- **SSR-friendly** — renders on the server, no hydration issues with policy content
- **`useSeoMeta` colocated** — keep SEO metadata next to the policy config in one file
- **No third-party scripts** — policy loads from your own server, not an external widget
- **Always in sync** — policy regenerates from config on every build, never stale
