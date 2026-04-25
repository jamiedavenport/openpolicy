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
import { defineConfig, dataCollected, thirdParties } from "@openpolicy/sdk";

export default defineConfig({
	company: {
		name: "Acme",
		legalName: "Acme, Inc.",
		address: "123 Main St, San Francisco, CA 94105",
		contact: "privacy@acme.com",
	},
	effectiveDate: "2026-01-01",
	jurisdictions: ["us-ca"],
	dataCollected: { ...dataCollected },
	legalBasis: { "Providing the service": "legitimate_interests" },
	retention: { "Account Information": "Until account deletion" },
	thirdParties: [...thirdParties],
	cookies: { essential: true, analytics: false, marketing: false },
});
```

All policy fields live at the top level of `OpenPolicyConfig`. OpenPolicy auto-detects which policies to generate from the fields you provide: privacy-specific fields (like `dataCollected`, `legalBasis`, `retention`) produce a privacy policy, and cookie-specific fields (like `cookies`, `consentMechanism`) produce a cookie policy. `effectiveDate` and `jurisdictions` are shared across both.

User rights (access, erasure, portability, etc.) are **derived automatically** from `jurisdictions` — declare `eu` (GDPR) or `uk` (UK-GDPR) for the six GDPR-style rights, `us-ca` for the four CCPA rights, or any combination for the union. There is no `userRights` field on the public config. See [Supported jurisdictions](https://docs.openpolicy.sh/references/jurisdictions) for the full list of codes.

## Core Patterns

### 1. Privacy config with GDPR

Use `Compliance.GDPR` to spread the required `jurisdictions` and `legalBasis` values in one step (rights are derived automatically from `jurisdictions`):

```ts
import {
	defineConfig,
	Compliance,
	DataCategories,
	Retention,
	Providers,
	dataCollected,
	thirdParties,
} from "@openpolicy/sdk";

export default defineConfig({
	company: {
		name: "Acme",
		legalName: "Acme, Inc.",
		address: "123 Main St, San Francisco, CA 94105",
		contact: "privacy@acme.com",
	},
	effectiveDate: "2026-01-01",
	...Compliance.GDPR,
	dataCollected: {
		...dataCollected,
		...DataCategories.AccountInfo,
		...DataCategories.UsageData,
	},
	retention: {
		"Account Information": Retention.UntilAccountDeletion,
		"Usage Data": Retention.NinetyDays,
	},
	thirdParties: [...thirdParties, Providers.Stripe, Providers.PostHog],
	children: { underAge: 13 },
	cookies: { essential: true, analytics: true, marketing: false },
});
```

`Compliance.GDPR` expands to `{ jurisdictions: ["eu"], legalBasis: { "Providing the service": "legitimate_interests" } }`. The six GDPR user rights are derived automatically from `jurisdictions: ["eu"]`.

### 2. Using Compliance presets

`Compliance.GDPR`, `Compliance.UK_GDPR`, and `Compliance.CCPA` are objects safe to spread directly into `defineConfig()`:

```ts
import { Compliance, defineConfig } from "@openpolicy/sdk";

// GDPR only
defineConfig({ ...Compliance.GDPR /* ... */ });

// Multi-region — union the jurisdictions; user rights are derived automatically
defineConfig({
	...Compliance.GDPR,
	jurisdictions: [
		...Compliance.GDPR.jurisdictions,
		...Compliance.UK_GDPR.jurisdictions,
		...Compliance.CCPA.jurisdictions,
	],
	// ...
});
```

`Compliance.CCPA` does not include `legalBasis` — it provides only `jurisdictions: ["us-ca"]`. The four CCPA user rights are derived automatically.

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
  cookies: { essential: true, analytics: true, marketing: false },
  consentMechanism: {
    hasBanner: true,
    hasPreferencePanel: true,
    canWithdraw: true,
  },
  trackingTechnologies: ["localStorage", "sessionStorage", "cookies"],
  thirdParties: [Providers.GoogleAnalytics, Providers.Cloudflare],
});
```

The `cookies` field requires `essential: boolean` — all other keys are `boolean` and are treated as additional cookie categories. Presence of `cookies`, `consentMechanism`, or `trackingTechnologies` auto-detects a cookie policy.

## Common Mistakes

### HIGH — Using standalone PrivacyPolicyConfig instead of flat OpenPolicyConfig

Wrong:

```ts
// WRONG: standalone shape
import type { PrivacyPolicyConfig } from "@openpolicy/sdk";

const config: PrivacyPolicyConfig = {
	company: { name: "Acme", legalName: "Acme, Inc.", address: "...", contact: "..." },
	effectiveDate: "2026-01-01",
	dataCollected: {},
	legalBasis: { "Marketing communications": "consent" },
	retention: {},
	cookies: { essential: true, analytics: false, marketing: false },
	thirdParties: [],
	userRights: [],
	jurisdictions: [],
};
// userRights is a REQUIRED field on the internal PrivacyPolicyConfig,
// but this shape isn't what defineConfig() accepts.
```

Correct:

```ts
// correct: flat OpenPolicyConfig via defineConfig()
import { defineConfig } from "@openpolicy/sdk";

export default defineConfig({
	company: { name: "Acme", legalName: "Acme, Inc.", address: "...", contact: "privacy@acme.com" },
	effectiveDate: "2026-01-01",
	jurisdictions: [],
	dataCollected: {},
	legalBasis: { "Marketing communications": "consent" },
	retention: {},
	thirdParties: [],
	cookies: { essential: true, analytics: false, marketing: false },
});
```

React components and the `openPolicy()` Vite plugin's auto-collect pipeline read from `OpenPolicyConfig`; the standalone policy types are internal shapes not consumed by the rendering layer.

Source: `packages/core/src/types.ts`

---

### MEDIUM — Not specifying jurisdictions — GDPR/CCPA sections silently absent

Wrong:

```ts
// WRONG: jurisdictions missing — legalBasis section and GDPR/CCPA content will not appear,
// and no user rights will be derived
defineConfig({
	company: {
		/* ... */
	},
	legalBasis: { "Providing the service": "legitimate_interests" },
	// jurisdictions omitted
});
```

Correct:

```ts
defineConfig({
	company: {
		/* ... */
	},
	legalBasis: { "Providing the service": "legitimate_interests" },
	jurisdictions: ["eu", "us-ca"],
});
```

Section builders for GDPR (`eu`), UK-GDPR (`uk`), and CCPA (`us-ca`) content check the top-level `jurisdictions` field before generating output, and the user rights list is derived from the same field. Omitting `jurisdictions` (or passing an empty array) causes those sections to be silently skipped and no rights to be listed. `Compliance.GDPR`, `Compliance.UK_GDPR`, and `Compliance.CCPA` include the correct `jurisdictions` values when spread.

Source: `packages/core/src/templates/privacy/`

## Reference

- [PrivacyPolicyConfig and CookiePolicyConfig field table](./references/privacy-config.md)
