# OpenPolicy

**The first policy-as-code framework for developers.**

Stop copying privacy policies from random generators. Stop paying lawyers to update boilerplate every time you add a new third-party integration. OpenPolicy lets you define your privacy and cookie policies in TypeScript—then generate compliant, always-up-to-date documents at build time.

---

## Why policy-as-code?

Legal policies rot. You ship a new payment provider, forget to update the privacy policy. You drop a marketing cookie, but the policy still says you use one. You have no idea when the policy last changed or why.

OpenPolicy treats policies like code: they live in your repo, they're reviewed in PRs, they're regenerated on every build, and they're always in sync with your actual implementation.

## How it works

**1. Define your policy in TypeScript**

```ts
// openpolicy.ts
import { defineConfig, LegalBases } from "@openpolicy/sdk";

export default defineConfig({
	company: {
		name: "Acme Inc.",
		legalName: "Acme Incorporated",
		address: "123 Market St, San Francisco, CA 94105",
		contact: "privacy@acme.com",
	},
	effectiveDate: "2026-01-01",
	jurisdictions: ["us-ca"],
	data: {
		collected: {
			"Account Information": ["Email", "Name"],
			"Usage Data": ["IP address", "Browser", "Pages visited"],
		},
		purposes: {
			"Account Information": "To create and manage user accounts",
			"Usage Data": "To understand product usage and improve the service",
		},
		lawfulBasis: {
			"Account Information": LegalBases.Contract,
			"Usage Data": LegalBases.LegitimateInterests,
		},
		retention: {
			"Account Information": "3 years after account closure",
			"Usage Data": "90 days",
		},
	},
	cookies: {
		used: { essential: true, analytics: true, marketing: false },
		lawfulBasis: {
			essential: LegalBases.LegalObligation,
			analytics: LegalBases.Consent,
			marketing: LegalBases.Consent,
		},
	},
	thirdParties: [
		{ name: "Stripe", purpose: "Payment processing" },
		{ name: "PostHog", purpose: "Product analytics" },
	],
});
```

**2. Add the Vite plugin**

```ts
// vite.config.ts
import { defineConfig } from "vite";
import { openPolicy } from "@openpolicy/vite";

export default defineConfig({
	plugins: [
		openPolicy({
			formats: ["jsx", "pdf", "markdown"],
		}),
	],
});
```

**3. Import the generated component**

```tsx
// routes/privacy-policy.tsx
import { PrivacyPolicy } from "@openpolicy/generated/privacy";

export default function Route() {
	return <PrivacyPolicy />;
}
```

That's it. Your privacy policy page is now generated directly from your `policy.ts` and rebuilt every time you deploy.

## Features

|                         |                                                                                      |
| ----------------------- | ------------------------------------------------------------------------------------ |
| **TypeScript-first**    | Define policies in the language you already know. Full type safety and autocomplete. |
| **Multi-format output** | Generate HTML, PDF, and Markdown at build time — use whichever you need.             |
| **Vite integration**    | Drops into your existing build pipeline in minutes.                                  |
| **GDPR & CCPA ready**   | Built-in templates for the regulations that matter most.                             |
| **Version controlled**  | Policies live in your repo and ship with your code.                                  |
| **Always in sync**      | Regenerated on every build — never out of date with your actual implementation.      |
| **Multi-jurisdiction**  | US, EU, UK and more supported out of the box.                                        |
| **Audit trail**         | Every policy change is tracked in git, reviewable in PRs.                            |
| **Framework agnostic**  | Works with React, Vue, Svelte, or plain HTML.                                        |

## AI-assisted policy generation

OpenPolicy ships an `llms.txt` so AI coding assistants — Claude, Cursor, Copilot — understand the SDK. Point your assistant at your codebase and let it write the `policy.ts` for you:

```
Read this codebase carefully, then generate a policy.ts using the OpenPolicy SDK.

SDK reference: https://openpolicy.sh/llms.txt

Your output should capture:
- Every category of data collected, why (data.purposes), the Article 6 basis (data.lawfulBasis), and how long it's kept (data.retention)
- All third-party services integrated and their purpose
- The applicable jurisdiction (US, EU, UK, etc.)
- Cookie categories and the lawful basis for each

Output only a single openpolicy.ts using defineConfig(). No explanations.
```

## Author

Built by [@jamiedavenport](https://jxd.dev)
