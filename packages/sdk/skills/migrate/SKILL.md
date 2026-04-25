---
name: migrate
description: >
  Converting existing hand-written privacy policies into OpenPolicy defineConfig() configs — mapping prose sections to structured TypeScript fields without passing raw text as values.
type: lifecycle
library: openpolicy
library_version: "0.0.19"
requires:
  - openpolicy/define-config
sources:
  - jamiedavenport/openpolicy:packages/core/src/types.ts
  - jamiedavenport/openpolicy:packages/sdk/src/constants.ts
---

# openpolicy/migrate

This skill builds on openpolicy/define-config. Read it first.

OpenPolicy generates all prose from structured fields. The job of a migration is to extract structure from an existing document — not to transcribe its sentences. Every field value must be a short label, boolean, enum string, or object; never a paragraph.

## Setup: Before and After

### Existing privacy policy (excerpt)

```
Privacy Policy — Effective January 1, 2026

Acme, Inc. ("Acme") operates the Acme platform. This policy describes how we collect
and use personal data in compliance with the GDPR and the California Consumer Privacy Act.

Data We Collect
We collect the following categories of personal data:
- Account information: your name, email address, and password when you register.
- Payment details: the last 4 digits of your card, your billing name, and billing address.
- Usage data: pages you visit, features you use, and time spent in the app.
- Device information: your device type, operating system, and browser version.

We use Google Analytics for product analytics and Stripe for payment processing.

Legal Basis (GDPR)
We process your data on the basis of legitimate interests and, where required, consent.

Data Retention
Account information is held until you delete your account. Usage data is retained for
90 days. Payment records are kept for 3 years as required by applicable law.

Your Rights
Under the GDPR you have the right to access, correct, erase, port, restrict, and object
to processing of your data. California residents may opt out of the sale of personal
information and are protected from discrimination for exercising their rights.

Contact: privacy@acme.com | Acme, Inc., 123 Main St, San Francisco, CA 94105
```

### Migrated config

```ts
// openpolicy.ts
import {
	Compliance,
	ContractPrerequisite,
	cookies,
	DataCategories,
	dataCollected,
	defineConfig,
	LegalBases,
	LegitimateInterests,
	Providers,
	Retention,
	Statutory,
	thirdParties,
	Voluntary,
} from "@openpolicy/sdk";

export default defineConfig({
	company: {
		name: "Acme",
		legalName: "Acme, Inc.",
		address: "123 Main St, San Francisco, CA 94105",
		contact: "privacy@acme.com",
	},
	effectiveDate: "2026-01-01",
	jurisdictions: [...Compliance.GDPR.jurisdictions, ...Compliance.CCPA.jurisdictions],
	data: {
		collected: {
			...dataCollected,
			...DataCategories.AccountInfo,
			...DataCategories.PaymentInfo,
			...DataCategories.UsageData,
			...DataCategories.DeviceInfo,
		},
		context: {
			"Account Information": {
				purpose: "To create and manage user accounts",
				lawfulBasis: LegalBases.Contract,
				retention: Retention.UntilAccountDeletion,
				provision: ContractPrerequisite("We cannot create or operate your account."),
			},
			"Payment Information": {
				purpose: "To process payments and prevent fraud",
				lawfulBasis: LegalBases.Contract,
				retention: Retention.ThreeYears,
				provision: Statutory("We cannot lawfully complete the transaction."),
			},
			"Usage Data": {
				purpose: "To understand product usage and improve the service",
				lawfulBasis: LegalBases.LegitimateInterests,
				retention: Retention.NinetyDays,
				provision: Voluntary("None — your service is unaffected."),
			},
			"Device Information": {
				purpose: "To diagnose issues and tailor the experience to your device",
				lawfulBasis: LegalBases.LegitimateInterests,
				retention: Retention.NinetyDays,
				provision: Voluntary("None — your service is unaffected."),
			},
		},
	},
	thirdParties: [...thirdParties, Providers.GoogleAnalytics, Providers.Stripe],
	cookies: {
		used: { ...cookies, analytics: true, marketing: false },
		context: {
			essential: { lawfulBasis: LegalBases.LegalObligation },
			analytics: { lawfulBasis: LegalBases.Consent },
			marketing: { lawfulBasis: LegalBases.Consent },
		},
	},
	automatedDecisionMaking: [],
});
```

## Core Patterns

### 1. Mapping data collection sections

Read each "data we collect" section and identify the category name and the specific fields listed. Map each to a short label — never copy sentences.

`DataCategories` presets cover the most common categories. Check if the existing policy's categories match before reaching for custom keys:

| Preset                          | Generated key           | Fields                                            |
| ------------------------------- | ----------------------- | ------------------------------------------------- |
| `DataCategories.AccountInfo`    | `"Account Information"` | Name, Email address                               |
| `DataCategories.SessionData`    | `"Session Data"`        | IP address, User agent, Browser type              |
| `DataCategories.PaymentInfo`    | `"Payment Information"` | Card last 4 digits, Billing name, Billing address |
| `DataCategories.UsageData`      | `"Usage Data"`          | Pages visited, Features used, Time spent          |
| `DataCategories.DeviceInfo`     | `"Device Information"`  | Device type, Operating system, Browser version    |
| `DataCategories.LocationData`   | `"Location Data"`       | Country, City, Timezone                           |
| `DataCategories.Communications` | `"Communications"`      | Email content, Support tickets                    |

For categories not covered by a preset, add a custom key with short field labels:

```ts
data: {
  collected: {
    ...dataCollected,
    ...DataCategories.AccountInfo,
    "Health Data": ["Blood glucose readings", "Heart rate"],
  },
  context: {
    "Account Information": { /* purpose, lawfulBasis, retention, provision */ },
    "Health Data": { /* purpose, lawfulBasis, retention, provision */ },
  },
},
```

Always spread `dataCollected` first so the `openPolicy()` Vite plugin's output is included alongside the explicit entries. Every key you add to `data.collected` must have a matching `data.context` entry — `defineConfig` enforces this at type-check time.

### 2. Mapping jurisdiction and legal basis from GDPR/CCPA language

Scan the existing policy for jurisdiction signals:

| Prose signal                                         | Maps to                                                                                                                                                                        |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| "GDPR", "EU", "EEA", "European"                      | `jurisdictions: ["eu"]`                                                                                                                                                        |
| "UK-GDPR", "UK", "United Kingdom", "ICO", "British"  | `jurisdictions: ["uk"]`                                                                                                                                                        |
| "CCPA", "CPRA", "California", "California residents" | `jurisdictions: ["us-ca"]`                                                                                                                                                     |
| "Australian Privacy Act"                             | `jurisdictions: ["au"]`                                                                                                                                                        |
| No specific regulation cited                         | Pick the specific region(s) where the business operates — there is no federal `"us"` code. See [Supported jurisdictions](https://docs.openpolicy.sh/references/jurisdictions). |

For lawful basis (GDPR policies only), `data.context[category].lawfulBasis` carries each category's Article 6 basis. GDPR Art. 13(1)(c) requires the lawful basis to be stated per category, and the renderer joins category + purpose + basis into a single line. Map prose phrases to `LegalBases` constants:

| Prose                                              | LegalBases constant              |
| -------------------------------------------------- | -------------------------------- |
| "legitimate interests"                             | `LegalBases.LegitimateInterests` |
| "your consent" / "you have agreed"                 | `LegalBases.Consent`             |
| "to perform a contract" / "to provide the service" | `LegalBases.Contract`            |
| "legal obligation" / "required by law"             | `LegalBases.LegalObligation`     |

Build the context map using the same keys as `data.collected`:

```ts
data: {
  collected: { "Account Information": ["Name", "Email"], "Usage Data": [...] },
  context: {
    "Account Information": {
      purpose: "Account creation",
      lawfulBasis: LegalBases.Contract,
      retention: Retention.UntilAccountDeletion,
      provision: ContractPrerequisite("We cannot create or operate your account."),
    },
    "Usage Data": {
      purpose: "Analytics",
      lawfulBasis: LegalBases.LegitimateInterests,
      retention: Retention.NinetyDays,
      provision: Voluntary("None — your service is unaffected."),
    },
  },
},
```

When any `data.context[category].lawfulBasis` is `LegalBases.Consent`, the rendered policy automatically appends a GDPR Art. 13(2)(c) right-to-withdraw paragraph — no extra config needed.

Use `Compliance.GDPR` or `Compliance.CCPA` as a starting point when the existing policy explicitly targets those regulations. Each preset only sets `jurisdictions`; merge them when both apply:

```ts
jurisdictions: [...Compliance.GDPR.jurisdictions, ...Compliance.CCPA.jurisdictions],
```

The user-rights list is derived from the resulting `jurisdictions` array — no need to merge a separate array. The Article 6 basis per data category lives in `data.context[category].lawfulBasis` (you choose), not the preset.

### 3. Using presets to standardize values

Prefer preset constants over raw strings wherever the meaning matches exactly. This reduces typo risk and keeps the config readable.

**Retention periods** — match common prose to preset keys:

| Prose                           | Preset                           |
| ------------------------------- | -------------------------------- |
| "until you delete your account" | `Retention.UntilAccountDeletion` |
| "until your session ends"       | `Retention.UntilSessionExpiry`   |
| "30 days"                       | `Retention.ThirtyDays`           |
| "90 days"                       | `Retention.NinetyDays`           |
| "1 year"                        | `Retention.OneYear`              |
| "3 years"                       | `Retention.ThreeYears`           |
| "as required by law"            | `Retention.AsRequiredByLaw`      |

For a period not in the preset list, pass a plain string to `data.context[category].retention`:

```ts
data: {
  context: {
    "Audit Logs": {
      purpose: "Security and compliance auditing",
      lawfulBasis: LegalBases.LegalObligation,
      retention: "7 years",
      provision: Statutory("We cannot meet our retention obligations."),
    },
  },
},
```

**User rights** — `UserRight` enum values and their prose equivalents:

| Prose                                               | Value                  |
| --------------------------------------------------- | ---------------------- |
| right of access / to view your data                 | `"access"`             |
| right to correct / rectify                          | `"rectification"`      |
| right to delete / erasure / "right to be forgotten" | `"erasure"`            |
| right to data portability                           | `"portability"`        |
| right to restrict processing                        | `"restriction"`        |
| right to object                                     | `"objection"`          |
| right to opt out of sale                            | `"opt_out_sale"`       |
| right to non-discrimination                         | `"non_discrimination"` |

## Common Mistakes

### HIGH — Passing prose text as field values instead of mapping to structured fields

OpenPolicy generates all human-readable sentences from the config structure. Passing paragraph text into fields produces malformed or legally duplicated output.

Wrong:

```ts
defineConfig({
	company: {
		/* ... */
	},
	data: {
		collected: {
			// WRONG: prose sentence passed as a field label
			Data: [
				"We collect information you provide when you register for an account, including your name and email address.",
			],
		},
		context: {
			Data: {
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
	company: {
		/* ... */
	},
	data: {
		collected: { "Account Information": ["Name", "Email address"] },
		context: {
			"Account Information": {
				purpose: "To create and manage user accounts",
				lawfulBasis: LegalBases.Contract,
				retention: "Until account deletion",
				provision: ContractPrerequisite("We cannot create or operate your account."),
			},
		},
	},
});
```

Source: `packages/core/src/types.ts`
