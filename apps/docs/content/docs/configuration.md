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
  privacy: {
    effectiveDate: "2026-01-01",
    dataCollected: {
      "Account Information": ["Name", "Email address"],
      "Usage Data": ["Pages visited", "IP address"],
    },
    legalBasis: "Legitimate interests and consent",
    retention: { "Account data": "Until account deletion" },
    cookies: { essential: true, analytics: false, marketing: false },
    thirdParties: [],
    userRights: ["access", "erasure"],
    jurisdictions: ["us", "eu"],
  },
  cookie: {
    effectiveDate: "2026-01-01",
    cookies: { essential: true, analytics: false, marketing: false },
    jurisdictions: ["us", "eu"],
  },
});
```

The `company` block is required and shared across all policy types. Each policy section (`privacy`, `cookie`) is optional — only the sections you define will produce output.

## Using AI

The fastest way to fill out your config is to ask your coding agent to do it. Point it at your codebase and ask it to generate an `openpolicy.ts` based on what it finds — your dependencies, environment variables, data models, and any existing privacy or legal documents. Agents are good at this because the config is typed and the fields map directly to things already described in your code.
