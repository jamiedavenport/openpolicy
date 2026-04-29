---
name: define-config
description: >
  Writing the defineConfig() object for OpenPolicyConfig — privacy and cookie — including all field types, jurisdiction requirements, and preset constants from @openpolicy/sdk.
type: core
library: openpolicy
library_version: "0.0.19"
sources:
  - jamiedavenport/openpolicy:packages/core/src/types.ts
  - jamiedavenport/openpolicy:packages/sdk/src/constants.ts
---

# openpolicy/define-config

Write and maintain the `defineConfig()` call in `openpolicy.ts`. The function is an identity function used as a type marker — it accepts `OpenPolicyConfig` and returns it unchanged.

## Setup

Minimal config with privacy policy:

```ts
// openpolicy.ts
import {
	ContractPrerequisite,
	cookies,
	dataCollected,
	defineConfig,
	LegalBases,
	thirdParties,
} from "@openpolicy/sdk";

export default defineConfig({
	company: {
		name: "Acme",
		legalName: "Acme, Inc.",
		address: "123 Main St, San Francisco, CA 94105",
		contact: { email: "privacy@acme.com" },
	},
	effectiveDate: "2026-01-01",
	jurisdictions: ["us-ca"],
	data: {
		collected: { ...dataCollected },
		context: {
			"Account Information": {
				purpose: "To create and manage user accounts",
				lawfulBasis: LegalBases.Contract,
				retention: "Until account deletion",
				provision: ContractPrerequisite("We cannot create or operate your account."),
			},
		},
	},
	thirdParties: [...thirdParties],
	cookies: {
		used: cookies,
		context: { essential: { lawfulBasis: LegalBases.LegalObligation } },
	},
	automatedDecisionMaking: [],
});
```

The `data` block keeps privacy fields together: `collected` lists field labels per category, and `context` carries the per-category metadata (`purpose`, `lawfulBasis`, `retention`, `provision`). Every key in `collected` must have a matching `context` entry — TS-enforced via `defineConfig`. The `cookies` block mirrors that pattern with `used` (categories) and `context` (Article 6 basis per category). OpenPolicy auto-detects which policies to generate from the fields you provide: a `data` block produces a privacy policy; a `cookies` block produces a cookie policy. `effectiveDate` and `jurisdictions` are shared across both.

User rights (access, erasure, portability, etc.) are **derived automatically** from `jurisdictions` — declare `eu` (GDPR) or `uk` (UK-GDPR) for the six GDPR-style rights, `us-ca` for the four CCPA rights, or any combination for the union. There is no `userRights` field on the public config. See [Supported jurisdictions](https://docs.openpolicy.sh/references/jurisdictions) for the full list of codes.

## Core Patterns

### 1. Privacy config with GDPR

Use `Compliance.GDPR` to spread the required `jurisdictions` (rights are derived automatically). Pair each collected category with a single context object holding its purpose, lawful basis, retention, and provision requirement:

```ts
import {
	ContractPrerequisite,
	cookies,
	Compliance,
	DataCategories,
	dataCollected,
	defineConfig,
	LegalBases,
	Providers,
	Retention,
	thirdParties,
	Voluntary,
} from "@openpolicy/sdk";

export default defineConfig({
	company: {
		name: "Acme",
		legalName: "Acme, Inc.",
		address: "123 Main St, San Francisco, CA 94105",
		contact: { email: "privacy@acme.com" },
	},
	effectiveDate: "2026-01-01",
	...Compliance.GDPR,
	data: {
		collected: {
			...dataCollected,
			...DataCategories.AccountInfo,
			...DataCategories.UsageData,
		},
		context: {
			"Account Information": {
				purpose: "To authenticate users and send service notifications",
				lawfulBasis: LegalBases.Contract,
				retention: Retention.UntilAccountDeletion,
				provision: ContractPrerequisite("We cannot create or operate your account."),
			},
			"Usage Data": {
				purpose: "To understand product usage and improve the service",
				lawfulBasis: LegalBases.LegitimateInterests,
				retention: Retention.NinetyDays,
				provision: Voluntary("None — your service is unaffected."),
			},
		},
	},
	thirdParties: [...thirdParties, Providers.Stripe, Providers.PostHog],
	children: { underAge: 13 },
	cookies: {
		used: cookies,
		context: {
			essential: { lawfulBasis: LegalBases.LegalObligation },
			analytics: { lawfulBasis: LegalBases.Consent },
			marketing: { lawfulBasis: LegalBases.Consent },
		},
	},
	automatedDecisionMaking: [],
});
```

`Compliance.GDPR` expands to `{ jurisdictions: ["eu"] }`. The six GDPR user rights are derived automatically from `jurisdictions: ["eu"]`. `defineConfig` infers the category set from `data.collected` and requires every category to appear in `context` — omitting any is a TS error.

### 2. Using Compliance presets

`Compliance.GDPR`, `Compliance.UK_GDPR`, and `Compliance.CCPA` are objects safe to spread directly into `defineConfig()`:

```ts
import { Compliance, defineConfig } from "@openpolicy/sdk";

// GDPR only
defineConfig({ ...Compliance.GDPR /* ... */ });

// Multi-region — union the jurisdictions; user rights are derived automatically
defineConfig({
	jurisdictions: [
		...Compliance.GDPR.jurisdictions,
		...Compliance.UK_GDPR.jurisdictions,
		...Compliance.CCPA.jurisdictions,
	],
	// ...
});
```

Each preset provides only `jurisdictions`. The Article 6 basis per data category lives in `data.context[category].lawfulBasis` (you choose), not the preset.

Available preset groups from `@openpolicy/sdk`:

| Export           | Content                                                                                                                    |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `DataCategories` | Named `dataCollected` entries (AccountInfo, SessionData, PaymentInfo, UsageData, DeviceInfo, LocationData, Communications) |
| `Retention`      | Retention period strings (UntilAccountDeletion, ThirtyDays, NinetyDays, OneYear, ThreeYears, AsRequiredByLaw, …)           |
| `LegalBases`     | `LegalBasis` string constants (Consent, Contract, LegitimateInterests, …)                                                  |
| `Compliance`     | Preset bundles: `GDPR`, `UK_GDPR`, `CCPA`                                                                                  |
| `Providers`      | Named third-party descriptors: Stripe, PostHog, Vercel, Sentry, Clerk, Resend, …                                           |

### 3. Cookie config

```ts
export default defineConfig({
  company: { ... },
  effectiveDate: "2026-01-01",
  jurisdictions: ["eu", "us-ca"],
  cookies: {
    used: { essential: true, analytics: true, marketing: false },
    context: {
      essential: { lawfulBasis: LegalBases.LegalObligation },
      analytics: { lawfulBasis: LegalBases.Consent },
      marketing: { lawfulBasis: LegalBases.Consent },
    },
  },
  consentMechanism: {
    hasBanner: true,
    hasPreferencePanel: true,
    canWithdraw: true,
  },
  trackingTechnologies: ["localStorage", "sessionStorage", "cookies"],
  thirdParties: [Providers.GoogleAnalytics, Providers.Cloudflare],
});
```

`cookies.used` requires `essential: true` — all other keys are `boolean` and are treated as additional cookie categories. Every enabled category in `cookies.used` must have a matching entry in `cookies.context` (TS-enforced via the `ScannedCookieKeys` interface). Presence of `cookies`, `consentMechanism`, or `trackingTechnologies` auto-detects a cookie policy.

## Common Mistakes

### HIGH — Using free-form keys in `data.context`

Wrong:

```ts
// WRONG: data.context keys must match data.collected keys (TS will reject this)
defineConfig({
	data: {
		collected: { "Account Information": ["Name", "Email"] },
		context: {
			"Providing the service": {
				// ← unrelated string
				purpose: "Account creation",
				lawfulBasis: LegalBases.Contract,
				retention: "Until account deletion",
				provision: ContractPrerequisite("We cannot create your account."),
			},
		},
	},
});
```

Correct:

```ts
defineConfig({
	data: {
		collected: { "Account Information": ["Name", "Email"] },
		context: {
			"Account Information": {
				purpose: "Account creation",
				lawfulBasis: LegalBases.Contract,
				retention: "Until account deletion",
				provision: ContractPrerequisite("We cannot create your account."),
			},
		},
	},
});
```

`data.context` is keyed by the same set of strings as `data.collected`. The renderer joins each context entry into the GDPR Art. 13(1)(c) chain: `**Account Information** — used for Account creation — Performance of a contract (Article 6(1)(b))`.

Source: `packages/core/src/types.ts`, `packages/core/src/documents/privacy.ts`

---

### MEDIUM — Not specifying jurisdictions — GDPR/CCPA sections silently absent

Wrong:

```ts
// WRONG: jurisdictions missing — Legal Basis section and GDPR/CCPA content will not appear,
// and no user rights will be derived
defineConfig({
	company: {
		/* ... */
	},
	data: { collected: {}, context: {} },
	// jurisdictions omitted
});
```

Correct:

```ts
defineConfig({
	company: {
		/* ... */
	},
	data: {
		collected: { "Account Information": ["Name"] },
		context: {
			"Account Information": {
				purpose: "Account creation",
				lawfulBasis: LegalBases.Contract,
				retention: "Until account deletion",
				provision: ContractPrerequisite("We cannot create your account."),
			},
		},
	},
	jurisdictions: ["eu", "us-ca"],
});
```

Section builders for GDPR (`eu`), UK-GDPR (`uk`), and CCPA (`us-ca`) content check the top-level `jurisdictions` field before generating output, and the user rights list is derived from the same field. Omitting `jurisdictions` (or passing an empty array) causes those sections to be silently skipped and no rights to be listed.

Source: `packages/core/src/templates/privacy/`

## Reference

- [PrivacyPolicyConfig and CookiePolicyConfig field table](./references/privacy-config.md)
