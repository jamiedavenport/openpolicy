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
	data: {
		collected: {
			"Account Information": ["Name", "Email address"],
			"Usage Data": ["Pages visited", "IP address"],
		},
		purposes: {
			"Account Information": "To authenticate users and send service notifications",
			"Usage Data": "To understand product usage and improve the service",
		},
	},
	legalBasis: {
		"Providing the service": "legitimate_interests",
		"Marketing communications": "consent",
	},
	retention: { "Account data": "Until account deletion" },
	thirdParties: [],
	cookies: { essential: true, analytics: false, marketing: false },
});
```

The `company` block is required and shared across all policy types. All other fields live at the top level: `effectiveDate` and `jurisdictions` are shared, and OpenPolicy auto-detects which policies to generate from the fields you provide — include privacy-specific fields (like `data`, `legalBasis`, `retention`) for a privacy policy, and cookie-specific fields (like `cookies`, `consentMechanism`) for a cookie policy.

### Data Protection Officer

If you operate under GDPR or UK-GDPR, set `company.dpo` so the policy discloses DPO contact details as required by Article 13(1)(b):

```ts
company: {
  name: "Acme Inc.",
  legalName: "Acme Corporation",
  address: "123 Main St, Springfield, USA",
  contact: "privacy@acme.com",
  dpo: {
    email: "dpo@acme.com",
    name: "Jane Doe",           // optional
    phone: "+1 555 010 2030",   // optional
    address: "123 Main St...",  // optional
  },
},
```

If appointing a DPO is not required for your processing activities (see GDPR Article 37(1)), say so explicitly — the policy will include the disclosure in the GDPR/UK-GDPR supplements:

```ts
company: {
  // ...
  dpo: { required: false, reason: "Our processing is not large-scale or systematic." },
},
```

Omitting `dpo` emits a validation warning when `jurisdictions` includes `eu` or `uk`.

`data.collected` is a map of category label → fields; `data.purposes` is a map of the same category label → prose describing _why_ you process it (GDPR Article 13(1)(c)). Every key in `data.collected` must have a matching entry in `data.purposes`; `defineConfig` enforces this at type-check time, and the `openPolicy()` Vite plugin re-validates it at build time. When auto-collect is enabled, the plugin also emits `openpolicy.gen.ts` alongside your config (check it in) so the same constraint applies to scanned `collecting()` categories even without running Vite first.

The user rights you're legally required to disclose (access, erasure, portability, etc.) are derived automatically from `jurisdictions` — declare `eu` or `uk` and you get the six GDPR rights, declare `us-ca` and you get the four CCPA rights, declare any combination and you get the union. There's no `userRights` field to set. See [Supported jurisdictions](/references/jurisdictions) for the full list of codes.

## Using AI

The fastest way to fill out your config is to hand it to a coding agent. [`@openpolicy/cli`](/cli) prints a ready-made prompt for this — run `bunx @openpolicy/cli init`, paste the prompt into Claude Code or Cursor, and the agent will fill in `data`, `thirdParties`, `jurisdictions`, and cookie usage from your codebase. Agents are good at this because the config is typed and the fields map directly to things already described in your dependencies, environment variables, data models, and existing legal copy.
