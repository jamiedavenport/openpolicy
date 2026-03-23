---
title: OpenPolicy with Remix
description: Generate and render privacy policies and terms of service in Remix apps using OpenPolicy.
framework: Remix
icon: simple-icons:remix
pubDate: 2026-03-23
---

# OpenPolicy with Remix

Add legal pages to Remix using familiar React components and Remix's file-based routing.

## Install

```bash
bun add @openpolicy/sdk @openpolicy/react
```

## Define your policy

```ts
// app/openpolicy.ts
import { definePrivacyPolicy } from "@openpolicy/sdk";

export const privacyPolicy = definePrivacyPolicy({
  company: { name: "Acme Inc.", website: "https://acme.com" },
  contact: { email: "privacy@acme.com" },
  compliance: { gdpr: true, ccpa: true },
});
```

## Render in a route

```tsx
// app/routes/privacy-policy.tsx
import type { MetaFunction } from "@remix-run/node";
import { OpenPolicy, PrivacyPolicy } from "@openpolicy/react";
import { privacyPolicy } from "../openpolicy";

export const meta: MetaFunction = () => [
  { title: "Privacy Policy — Acme" },
];

export default function PrivacyPolicyRoute() {
  return (
    <main>
      <OpenPolicy config={privacyPolicy}>
        <PrivacyPolicy />
      </OpenPolicy>
    </main>
  );
}
```

## Why OpenPolicy for Remix

- **SSR out of the box** — Remix renders on the server; the policy arrives in the initial HTML
- **`meta` export colocated** — keep your page title next to the policy config
- **No third-party scripts** — policy content is part of your app bundle, not an external embed
- **Change management** — update your data-handling practices in code, commit, deploy — the policy follows
