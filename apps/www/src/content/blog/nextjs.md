---
title: "Stop Copy-Pasting Legal Pages Into Your Next.js App"
description: "Use the OpenPolicy CLI to generate legally-structured policy documents at build time — no Google Docs, no copy-paste."
pubDate: 2026-03-09
author: "OpenPolicy Team"
tags: ["framework"]
---

Most Next.js apps need a privacy policy before they launch. The usual approach: grab a template from the internet, paste it into a static page, and forget about it until a lawyer asks why it still says "Company Name Here."

OpenPolicy treats your policies like code. You define them as TypeScript objects, and the CLI compiles them to HTML as part of your build — in sync with every deploy.

## Install

```sh
bun add @openpolicy/sdk
bun add -D @openpolicy/cli
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
		contact: { email: "privacy@acme.com" },
	},
	effectiveDate: "2026-03-09",
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

## Add a generate script to `package.json`

```json
{
	"scripts": {
		"generate:policies": "openpolicy generate --format html --out ./public/policies",
		"prebuild": "bun run generate:policies"
	}
}
```

The `prebuild` script runs automatically before `next build`, so the policy file is regenerated alongside every deploy.

Run it manually to generate the files for the first time:

```sh
bun run generate:policies
```

## What gets generated

```
public/policies/
  privacy-policy.html
```

Files land in `public/policies/` so Next.js serves them as static assets, but they're also readable at runtime via `fs.readFile` in Server Components.

## Render on dedicated routes

Next.js App Router Server Components can read the generated HTML directly from disk at request time:

```tsx
// app/privacy/page.tsx
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export default async function PrivacyPage() {
	const html = await readFile(join(process.cwd(), "public/policies/privacy-policy.html"), "utf-8");
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
