---
title: "Ship a Privacy Policy with Your Astro Site"
description: "Define your privacy policy as TypeScript and render it directly in an Astro page — no integration, no generated files."
pubDate: 2026-03-05
author: "OpenPolicy Team"
---

Most Astro sites need a privacy policy before they launch. The usual approach: grab a template from the internet, paste it into a static page, and forget about it until a lawyer asks why it still says "Company Name Here."

OpenPolicy treats your policies like code. You define them as TypeScript objects and render them directly in an Astro page's frontmatter — in sync with every deploy.

## Install

```sh
bun add @openpolicy/sdk @openpolicy/core @openpolicy/renderers
```

## Define your policies

Create a single `openpolicy.ts` at the root of your project. The unified `defineConfig()` lets you define all policies in one file with a shared `company` block:

```ts
// openpolicy.ts
import { ContractPrerequisite, defineConfig, LegalBases, Voluntary } from "@openpolicy/sdk";

export default defineConfig({
	company: {
		name: "Acme",
		legalName: "Acme, Inc.",
		address: "123 Main St, San Francisco, CA 94105",
		contact: "privacy@acme.com",
	},
	effectiveDate: "2026-03-05",
	jurisdictions: ["eu", "us-ca"],
	data: {
		collected: {
			"Account information": ["Email address", "Display name"],
			"Usage data": ["Pages visited", "Session duration"],
		},
		context: {
			"Account information": {
				purpose: "To create and manage user accounts",
				lawfulBasis: LegalBases.Contract,
				retention: "Until account deletion",
				provision: ContractPrerequisite("We cannot create or operate your account."),
			},
			"Usage data": {
				purpose: "To understand product usage and improve the service",
				lawfulBasis: LegalBases.LegitimateInterests,
				retention: "13 months",
				provision: Voluntary("None — your service is unaffected."),
			},
		},
	},
	thirdParties: [
		{ name: "Vercel", purpose: "Hosting and edge delivery" },
		{ name: "Plausible", purpose: "Privacy-friendly analytics" },
	],
	cookies: {
		used: { essential: true, analytics: true, marketing: false },
		context: {
			essential: { lawfulBasis: LegalBases.LegalObligation },
			analytics: { lawfulBasis: LegalBases.Consent },
			marketing: { lawfulBasis: LegalBases.Consent },
		},
	},
	automatedDecisionMaking: [],
});
```

## Render on a dedicated page

```astro
---
// src/pages/privacy.astro
import { compile, expandOpenPolicyConfig } from "@openpolicy/core";
import { renderHTML } from "@openpolicy/renderers";
import openpolicy from "../../openpolicy";

const policies = expandOpenPolicyConfig(openpolicy);
const privacyPolicy = policies.find((p) => p.type === "privacy");
if (!privacyPolicy) throw new Error("Privacy policy not found");

const html = renderHTML(compile(privacyPolicy));
---

<div class="prose prose-gray max-w-none" set:html={html} />
```

Astro evaluates the frontmatter at build time, so there's no client-side rendering overhead. The `prose` class (from Tailwind Typography) handles all the heading, list, and paragraph styles.

## Why this is better than a static page

- **Type-safe.** Every field is checked by TypeScript. You can't ship a policy with a missing contact email.
- **Structured.** Each section is generated from your actual config — no stale placeholder text.
- **Version-controlled.** The config lives in your repo. `git blame` shows you when and why anything changed.
- **Jurisdiction-aware.** Set `jurisdictions: ["eu"]` and GDPR-required sections (right to erasure, data transfers, DPA contact) are included automatically.

The compiled policy includes all required sections for the jurisdictions you specify. You own the config; OpenPolicy handles the legal structure.
