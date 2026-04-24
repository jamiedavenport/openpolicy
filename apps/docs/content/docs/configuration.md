---
title: Configuration
description: Setting up your openpolicy.ts config file
---

All policies are defined in a single config file using `defineConfig()` from `@openpolicy/sdk`. You can place it anywhere in your project.

## Install

The fastest way is to run [`@openpolicy/cli`](/cli), which installs `@openpolicy/sdk` plus the right framework integration for your stack and scaffolds a starter config:

```sh
bunx @openpolicy/cli init
```

Or install manually:

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
	jurisdictions: ["eu", "us-ca"],
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

The user rights you're legally required to disclose (access, erasure, portability, etc.) are derived automatically from `jurisdictions` — declare `eu` or `uk` and you get the six GDPR rights, declare `us-ca` and you get the four CCPA rights, declare any combination and you get the union. There's no `userRights` field to set. See [Supported jurisdictions](/references/jurisdictions) for the full list of codes.

## Using AI

The fastest way to fill out your config is to hand it to a coding agent. [`@openpolicy/cli`](/cli) prints a ready-made prompt for this — run `bunx @openpolicy/cli init`, paste the prompt into Claude Code or Cursor, and the agent will fill in `dataCollected`, `thirdParties`, `jurisdictions`, and cookie usage from your codebase. Agents are good at this because the config is typed and the fields map directly to things already described in your dependencies, environment variables, data models, and existing legal copy.
