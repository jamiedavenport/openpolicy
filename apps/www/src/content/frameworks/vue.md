---
title: OpenPolicy with Vue
description: Generate and render privacy and cookie policies in Vue apps using OpenPolicy.
framework: Vue
icon: simple-icons:vuedotjs
pubDate: 2026-03-23
---

# OpenPolicy with Vue

Native Vue components for displaying OpenPolicy-generated legal pages in any Vue 3 app.

## Install

```bash
bun add @openpolicy/sdk @openpolicy/vue
```

## Define your policy

```ts
// src/openpolicy.ts
import { definePrivacyPolicy } from "@openpolicy/sdk";

export const privacyPolicy = definePrivacyPolicy({
	company: { name: "Acme Inc.", website: "https://acme.com" },
	contact: { email: "privacy@acme.com" },
	compliance: { gdpr: true, ccpa: true },
});
```

## Render in a view

```vue
<!-- src/views/PrivacyPolicyView.vue -->
<script setup lang="ts">
import { OpenPolicy, PrivacyPolicy } from "@openpolicy/vue";
import { privacyPolicy } from "@/openpolicy";
</script>

<template>
	<main>
		<OpenPolicy :config="privacyPolicy">
			<PrivacyPolicy />
		</OpenPolicy>
	</main>
</template>
```

## Why OpenPolicy for Vue

- **Native Vue components** — no framework adapter glue, just `<OpenPolicy>` and `<PrivacyPolicy />`
- **Reactive config** — pass a reactive config ref and the policy updates when your data does
- **Version controlled** — policy text lives in your repo, not a third-party dashboard
- **GDPR & CCPA built in** — flip compliance flags in your config, not in manual prose
