---
title: OpenPolicy with TanStack
description: Generate and render privacy and cookie policies in TanStack Router apps using OpenPolicy.
framework: TanStack
icon: simple-icons:tanstack
pubDate: 2026-03-23
---

# OpenPolicy with TanStack

Add legal pages to TanStack Router apps using the same React components as any other React project.

## Install

```bash
bun add @openpolicy/sdk @openpolicy/react
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

## Render in a route

```tsx
// src/routes/privacy-policy.tsx
import { createFileRoute } from "@tanstack/react-router";
import { OpenPolicy, PrivacyPolicy } from "@openpolicy/react";
import { privacyPolicy } from "../openpolicy";

export const Route = createFileRoute("/privacy-policy")({
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
  return (
    <main>
      <OpenPolicy config={privacyPolicy}>
        <PrivacyPolicy />
      </OpenPolicy>
    </main>
  );
}
```

## Why OpenPolicy for TanStack

- **File-based routing friendly** — one file, one route, one policy component
- **Type-safe config** — `definePrivacyPolicy` is fully typed; wrong fields are compile errors
- **No external dependencies at runtime** — policy content is pre-compiled, not fetched
- **Audit trail in git** — every policy change is a commit, reviewable in PRs
