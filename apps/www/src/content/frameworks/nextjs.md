---
title: OpenPolicy with Next.js
description: Generate and render privacy and cookie policies in Next.js apps using OpenPolicy.
framework: Next.js
icon: simple-icons:nextdotjs
pubDate: 2026-03-23
---

# OpenPolicy with Next.js

Drop legal pages into your Next.js App Router or Pages Router without leaving your codebase.

## Install

```bash
bun add @openpolicy/sdk @openpolicy/react
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

## Render in a Server Component

```tsx
// app/privacy-policy/page.tsx
import { OpenPolicy, PrivacyPolicy } from "@openpolicy/react";
import { privacyPolicy } from "@/lib/openpolicy";

export const metadata = {
	title: "Privacy Policy — Acme",
};

export default function PrivacyPolicyPage() {
	return (
		<main className="max-w-3xl mx-auto px-4 py-16">
			<OpenPolicy config={privacyPolicy}>
				<PrivacyPolicy />
			</OpenPolicy>
		</main>
	);
}
```

## Why OpenPolicy for Next.js

- **Server Component ready** — renders at build time with zero client JS for the policy content
- **Metadata colocated** — keep `export const metadata` next to your policy config
- **Diff-friendly** — policy changes appear in PRs alongside the code that caused them
- **No third-party iframes** — your policy lives in your own domain, your own markup
