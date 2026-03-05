---
title: "Ship a Privacy Policy and Terms of Service with Your Astro Site"
description: "Use the OpenPolicy Astro integration to generate legally-structured policy documents at build time — no Google Docs, no copy-paste."
pubDate: 2026-03-05
author: "OpenPolicy Team"
---

Most Astro sites need a privacy policy and terms of service before they launch. The usual approach: grab a template from the internet, paste it into a static page, and forget about it until a lawyer asks why it still says "Company Name Here."

OpenPolicy treats your policies like code. You define them as TypeScript objects, and the Astro integration compiles them to Markdown at build time — in sync with every deploy.

## Install

```sh
npx astro add @openpolicy/astro
bun add @openpolicy/sdk
```

`astro add` installs the package and automatically updates `astro.config.mjs`. If you prefer to wire it up manually:

```sh
bun add -D @openpolicy/astro @openpolicy/vite
```

## Add the integration to `astro.config.mjs`

```js
import { defineConfig } from "astro/config";
import { openPolicy } from "@openpolicy/astro";

export default defineConfig({
  integrations: [
    openPolicy({
      configs: [
        "privacy.config.ts",
        { config: "terms.config.ts", type: "terms" },
      ],
      formats: ["markdown"],
      outDir: "src/generated/policies",
    }),
  ],
});
```

On the first `bun run dev`, if either config file doesn't exist yet, the plugin scaffolds it automatically. Edit the generated file and save — the plugin watches for changes and regenerates.

## Define your privacy policy

```ts
// privacy.config.ts
import { definePrivacyPolicy } from "@openpolicy/sdk";

export default definePrivacyPolicy({
  effectiveDate: "2026-03-05",
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
  effectiveDate: "2026-03-05",
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
src/generated/policies/
  privacy-policy.md
  terms-of-service.md
```

Because the files land inside `src/`, Astro can import them directly as Markdown components.

## Render on a dedicated page

```astro
---
// src/pages/privacy.astro
import { Content } from "../../generated/policies/privacy-policy.md";
---
<div class="prose prose-gray max-w-none">
  <Content />
</div>
```

Astro compiles the Markdown to HTML at build time, so there's no client-side rendering overhead. The `prose` class (from Tailwind Typography) handles all the heading, list, and paragraph styles.

Do the same for terms:

```astro
---
// src/pages/terms.astro
import { Content } from "../../generated/policies/terms-of-service.md";
---
<div class="prose prose-gray max-w-none">
  <Content />
</div>
```

Add `.gitignore` entries so the generated files aren't checked in:

```
# .gitignore
src/generated/
```

## Why this is better than a static page

- **Type-safe.** Every field is checked by TypeScript. You can't ship a policy with a missing contact email.
- **Structured.** Each section is generated from your actual config — no stale placeholder text.
- **Version-controlled.** The config lives in your repo. `git blame` shows you when and why anything changed.
- **Jurisdiction-aware.** Set `jurisdictions: ["eu"]` and GDPR-required sections (right to erasure, data transfers, DPA contact) are included automatically.

The generated Markdown includes all required sections for the jurisdictions you specify. You own the config; OpenPolicy handles the legal structure.
