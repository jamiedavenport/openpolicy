---
title: Configuration
description: Setting up your openpolicy.ts config file
---

All policies are defined in a single config file using `defineConfig()` from `@openpolicy/sdk`. You can place it anywhere in your project.

## Install

```sh
bun add @openpolicy/sdk
```

## Create your config

```ts
// openpolicy.ts
import { defineConfig } from "@openpolicy/sdk";

export default defineConfig({
  company: {
    name: "Acme Inc.",
    legalName: "Acme Corporation",
    address: "123 Main St, Springfield, USA",
    contact: "privacy@acme.com",
  },
  effectiveDate: "2026-01-01",
  jurisdictions: ["us", "eu"],
  dataCollected: {
    "Account Information": ["Name", "Email address"],
    "Usage Data": ["Pages visited", "IP address"],
  },
  legalBasis: ["legitimate_interests", "consent"],
  retention: { "Account data": "Until account deletion" },
  thirdParties: [],
  cookies: { essential: true, analytics: false, marketing: false },
});
```

The `company` block is required and shared across all policy types. All other fields live at the top level: `effectiveDate` and `jurisdictions` are shared, and OpenPolicy auto-detects which policies to generate from the fields you provide — include privacy-specific fields (like `dataCollected`, `legalBasis`, `retention`) for a privacy policy, and cookie-specific fields (like `cookies`, `consentMechanism`) for a cookie policy.

The user rights you're legally required to disclose (access, erasure, portability, etc.) are derived automatically from `jurisdictions` — declare `eu` and you get the six GDPR rights, declare `ca` and you get the four CCPA rights, declare both and you get the union. There's no `userRights` field to set.

## Using AI

The fastest way to fill out your config is to ask your coding agent to do it. Point it at your codebase and ask it to generate an `openpolicy.ts` based on what it finds — your dependencies, environment variables, data models, and any existing privacy or legal documents. Agents are good at this because the config is typed and the fields map directly to things already described in your code.
