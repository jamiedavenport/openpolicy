---
title: OpenPolicy with React
description: Generate and render privacy and cookie policies in React apps using OpenPolicy.
framework: React
icon: simple-icons:react
pubDate: 2026-03-23
---

# OpenPolicy with React

Add type-safe, always-current legal pages to any React app in minutes.

## Install

```bash
bun add @openpolicy/sdk @openpolicy/react
```

## Define your policy

```ts
// openpolicy.ts
import { definePrivacyPolicy } from "@openpolicy/sdk";

export const privacyPolicy = definePrivacyPolicy({
	company: { name: "Acme Inc.", website: "https://acme.com" },
	contact: { email: "privacy@acme.com" },
	compliance: { gdpr: true, ccpa: true },
});
```

## Render in a route

```tsx
// pages/PrivacyPolicy.tsx
import { OpenPolicy, PrivacyPolicy } from "@openpolicy/react";
import { privacyPolicy } from "../openpolicy";

export default function PrivacyPolicyPage() {
	return (
		<OpenPolicy config={privacyPolicy}>
			<PrivacyPolicy />
		</OpenPolicy>
	);
}
```

## Why OpenPolicy for React

- **Headless by default** — bring your own styles; the output is plain HTML inside your component tree
- **Version controlled** — policy changes show up as diffs in pull requests
- **No copy-paste drift** — the policy regenerates from your config on every build
- **GDPR & CCPA ready** — compliance flags in your config, not scattered through manual text
