---
title: "Stop Copy-Pasting Legal Pages Into Your Next.js App"
description: "Use the OpenPolicy CLI to generate legally-structured policy documents at build time — no Google Docs, no copy-paste."
pubDate: 2026-03-09
author: "OpenPolicy Team"
---

Most Next.js apps need a privacy policy and terms of service before they launch. The usual approach: grab a template from the internet, paste it into a static page, and forget about it until a lawyer asks why it still says "Company Name Here."

OpenPolicy treats your policies like code. You define them as TypeScript objects, and the CLI compiles them to HTML as part of your build — in sync with every deploy.

## Install

```sh
bun add @openpolicy/sdk
bun add -D @openpolicy/cli
```

## Define your privacy policy

```ts
// policy.config.ts
import { definePrivacyPolicy } from "@openpolicy/sdk";

export default definePrivacyPolicy({
  effectiveDate: "2026-03-09",
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
  effectiveDate: "2026-03-09",
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

## Add a generate script to `package.json`

```json
{
  "scripts": {
    "generate:policies": "openpolicy generate --format html --out ./public/policies",
    "prebuild": "bun run generate:policies"
  }
}
```

The `prebuild` script runs automatically before `next build`. Pass both config paths as a comma-separated list — the CLI generates both policies in a single invocation and skips any file that doesn't exist yet.

Run it manually to generate the files for the first time:

```sh
bun run generate:policies
```

## What gets generated

```
public/policies/
  privacy-policy.html
  terms-of-service.html
```

Files land in `public/policies/` so Next.js serves them as static assets, but they're also readable at runtime via `fs.readFile` in Server Components.

## Render on dedicated routes

Next.js App Router Server Components can read the generated HTML directly from disk at request time:

```tsx
// app/privacy/page.tsx
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export default async function PrivacyPage() {
  const html = await readFile(
    join(process.cwd(), "public/policies/privacy-policy.html"),
    "utf-8",
  );
  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px" }}>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </main>
  );
}
```

```tsx
// app/terms/page.tsx
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export default async function TermsPage() {
  const html = await readFile(
    join(process.cwd(), "public/policies/terms-of-service.html"),
    "utf-8",
  );
  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "40px 24px" }}>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </main>
  );
}
```

Add a `.gitignore` entry so the generated files aren't checked in:

```
# .gitignore
/public/policies/*.html
```

Keep a `.gitkeep` in `public/policies/` so the directory exists in the repo before the first generation.

## Why this is better than a static page

- **Type-safe.** Every field is checked by TypeScript. You can't ship a policy with a missing contact email.
- **Structured.** Each section is generated from your actual config — no stale placeholder text.
- **Version-controlled.** The config lives in your repo. `git blame` shows you when and why anything changed.
- **Jurisdiction-aware.** Set `jurisdictions: ["eu"]` and GDPR-required sections (right to erasure, data transfers, DPA contact) are included automatically.

The generated HTML includes all required sections for the jurisdictions you specify. You own the config; OpenPolicy handles the legal structure.
