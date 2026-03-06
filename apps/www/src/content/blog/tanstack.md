---
title: "Ship a Privacy Policy and Terms of Service with Your TanStack App"
description: "Use the OpenPolicy Vite plugin to generate legally-structured policy documents at build time — no Google Docs, no copy-paste."
pubDate: 2026-03-06
author: "OpenPolicy Team"
---

Most TanStack Start apps need a privacy policy and terms of service before they launch. The usual approach: grab a template from the internet, paste it into a static page, and forget about it until a lawyer asks why it still says "Company Name Here."

OpenPolicy treats your policies like code. You define them as TypeScript objects, and the Vite plugin compiles them to HTML at build time — in sync with every deploy.

## Install

```sh
bun add -D @openpolicy/sdk @openpolicy/vite
```

## Add the plugin to `vite.config.ts`

```ts
import { openPolicy } from "@openpolicy/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    openPolicy({
      configs: ["policy.config.ts", "terms.config.ts"],
      formats: ["html"],
      outDir: "src/policies",
    }),
    tanstackStart(),
    viteReact(),
  ],
});
```

The `openPolicy()` plugin goes before `tanstackStart()`. On the first `bun run dev`, if either config file doesn't exist yet, the plugin scaffolds it automatically. Edit the generated file and save — the plugin watches for changes and regenerates.

## Define your privacy policy

```ts
// policy.config.ts
import { definePrivacyPolicy } from "@openpolicy/sdk";

export default definePrivacyPolicy({
  effectiveDate: "2026-03-06",
  company: {
    name: "Acme",
    legalName: "Acme, Inc.",
    address: "123 Main St, San Francisco, CA 94105",
    contact: "privacy@acme.com",
  },
  dataCollected: {
    "Account information": ["Email address", "Display name"],
    "Usage data": ["Pages visited", "Session duration"],
  },
  legalBasis: "Legitimate interests and user consent",
  retention: {
    "Account data": "Until account deletion",
    "Analytics data": "13 months",
  },
  cookies: {
    essential: true,
    analytics: true,
    marketing: false,
  },
  thirdParties: [
    { name: "Vercel", purpose: "Hosting and edge delivery" },
    { name: "Plausible", purpose: "Privacy-friendly analytics" },
  ],
  userRights: ["access", "erasure", "portability", "objection"],
  jurisdictions: ["us", "eu"],
});
```

## Define your terms of service

```ts
// terms.config.ts
import { defineTermsOfService } from "@openpolicy/sdk";

export default defineTermsOfService({
  effectiveDate: "2026-03-06",
  company: {
    name: "Acme",
    legalName: "Acme, Inc.",
    address: "123 Main St, San Francisco, CA 94105",
    contact: "legal@acme.com",
  },
  acceptance: {
    methods: ["using the service", "creating an account"],
  },
  eligibility: {
    minimumAge: 13,
  },
  accounts: {
    registrationRequired: true,
    userResponsibleForCredentials: true,
    companyCanTerminate: true,
  },
  prohibitedUses: [
    "Violating any applicable laws or regulations",
    "Attempting to gain unauthorized access to any part of the service",
    "Transmitting malware or malicious code",
  ],
  intellectualProperty: {
    companyOwnsService: true,
    usersMayNotCopy: true,
  },
  disclaimers: {
    serviceProvidedAsIs: true,
    noWarranties: true,
  },
  limitationOfLiability: {
    excludesIndirectDamages: true,
    liabilityCap: "the amount paid by the user in the past 12 months",
  },
  governingLaw: {
    jurisdiction: "Delaware, USA",
  },
  changesPolicy: {
    noticeMethod: "email or prominent notice on the website",
    noticePeriodDays: 30,
  },
});
```

## What gets generated

After the next build (or on save in dev), the plugin writes:

```
src/policies/
  privacy-policy.html
  terms-of-service.html
```

Because the files land inside `src/`, Vite can resolve them as `?raw` imports directly from your route components.

## Render on dedicated routes

Create a route file for each policy. TanStack Router picks them up automatically via file-based routing:

```tsx
// src/routes/privacy.tsx
import { createFileRoute } from "@tanstack/react-router";
import html from "../policies/privacy-policy.html?raw";

export const Route = createFileRoute("/privacy")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
```

```tsx
// src/routes/terms.tsx
import { createFileRoute } from "@tanstack/react-router";
import html from "../policies/terms-of-service.html?raw";

export const Route = createFileRoute("/terms")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
```

TanStack Router auto-generates `routeTree.gen.ts` when it detects the new files — no manual registration needed.

Add a `.gitignore` entry so the generated files aren't checked in:

```
# .gitignore
src/policies/
```

## Why this is better than a static page

- **Type-safe.** Every field is checked by TypeScript. You can't ship a policy with a missing contact email.
- **Structured.** Each section is generated from your actual config — no stale placeholder text.
- **Version-controlled.** The config lives in your repo. `git blame` shows you when and why anything changed.
- **Jurisdiction-aware.** Set `jurisdictions: ["eu"]` and GDPR-required sections (right to erasure, data transfers, DPA contact) are included automatically.

The generated HTML includes all required sections for the jurisdictions you specify. You own the config; OpenPolicy handles the legal structure.
