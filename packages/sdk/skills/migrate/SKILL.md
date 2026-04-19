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
  privacy: {
    effectiveDate: "2026-01-01",
    // GDPR + CCPA: spread both presets, then union the array fields
    ...Compliance.GDPR,
    jurisdictions: [
      ...Compliance.GDPR.jurisdictions,
      ...Compliance.CCPA.jurisdictions,
    ],
    userRights: [
      ...Compliance.GDPR.userRights,
      ...Compliance.CCPA.userRights,
    ],
    dataCollected: {
      ...dataCollected,
      ...DataCategories.AccountInfo,
      ...DataCategories.PaymentInfo,
      ...DataCategories.UsageData,
      ...DataCategories.DeviceInfo,
    },
    retention: {
      "Account Information": Retention.UntilAccountDeletion,
      "Usage Data": Retention.NinetyDays,
      "Payment Information": Retention.ThreeYears,
    },
    cookies: { essential: true, analytics: true, marketing: false },
    thirdParties: [
      ...thirdParties,
      Providers.GoogleAnalytics,
      Providers.Stripe,
    ],
  },
});
```

## Core Patterns

### 1. Mapping data collection sections

Read each "data we collect" section and identify the category name and the specific fields listed. Map each to a short label — never copy sentences.

`DataCategories` presets cover the most common categories. Check if the existing policy's categories match before reaching for custom keys:

| Preset | Generated key | Fields |
|---|---|---|
| `DataCategories.AccountInfo` | `"Account Information"` | Name, Email address |
| `DataCategories.SessionData` | `"Session Data"` | IP address, User agent, Browser type |
| `DataCategories.PaymentInfo` | `"Payment Information"` | Card last 4 digits, Billing name, Billing address |
| `DataCategories.UsageData` | `"Usage Data"` | Pages visited, Features used, Time spent |
| `DataCategories.DeviceInfo` | `"Device Information"` | Device type, Operating system, Browser version |
| `DataCategories.LocationData` | `"Location Data"` | Country, City, Timezone |
| `DataCategories.Communications` | `"Communications"` | Email content, Support tickets |

For categories not covered by a preset, add a custom key with short field labels:

```ts
dataCollected: {
  ...dataCollected,
  ...DataCategories.AccountInfo,
  "Health Data": ["Blood glucose readings", "Heart rate"],
},
```

Always spread `dataCollected` first so the autoCollect plugin's output is included alongside the explicit entries.

### 2. Mapping jurisdiction and legal basis from GDPR/CCPA language

Scan the existing policy for jurisdiction signals:

| Prose signal | Maps to |
|---|---|
| "GDPR", "EU", "EEA", "European" | `jurisdictions: ["eu"]` |
| "CCPA", "California", "California residents" | `jurisdictions: ["ca"]` |
| "Australian Privacy Act" | `jurisdictions: ["au"]` |
| No specific regulation cited | `jurisdictions: ["us"]` |

For legal basis (GDPR policies only), map the stated basis:

| Prose | `legalBasis` value |
|---|---|
| "legitimate interests" | `"legitimate_interests"` |
| "your consent" / "you have agreed" | `"consent"` |
| "to perform a contract" / "to provide the service" | `"contract"` |
| "legal obligation" / "required by law" | `"legal_obligation"` |

When the policy states more than one basis, use an array:

```ts
legalBasis: ["legitimate_interests", "consent"],
```

Use `Compliance.GDPR` or `Compliance.CCPA` as a starting point when the existing policy explicitly targets those regulations. Merge the array fields when both apply:

```ts
...Compliance.GDPR,
jurisdictions: [...Compliance.GDPR.jurisdictions, ...Compliance.CCPA.jurisdictions],
userRights: [...Compliance.GDPR.userRights, ...Compliance.CCPA.userRights],
```

`Compliance.CCPA` does not include `legalBasis` — only add it when the existing policy states an EU legal basis.

### 3. Using presets to standardize values

Prefer preset constants over raw strings wherever the meaning matches exactly. This reduces typo risk and keeps the config readable.

**Retention periods** — match common prose to preset keys:

| Prose | Preset |
|---|---|
| "until you delete your account" | `Retention.UntilAccountDeletion` |
| "until your session ends" | `Retention.UntilSessionExpiry` |
| "30 days" | `Retention.ThirtyDays` |
| "90 days" | `Retention.NinetyDays` |
| "1 year" | `Retention.OneYear` |
| "3 years" | `Retention.ThreeYears` |
| "as required by law" | `Retention.AsRequiredByLaw` |

For a period not in the preset list, use a plain string:

```ts
retention: {
  "Audit Logs": "7 years",
},
```

**User rights** — `UserRight` enum values and their prose equivalents:

| Prose | Value |
|---|---|
| right of access / to view your data | `"access"` |
| right to correct / rectify | `"rectification"` |
| right to delete / erasure / "right to be forgotten" | `"erasure"` |
| right to data portability | `"portability"` |
| right to restrict processing | `"restriction"` |
| right to object | `"objection"` |
| right to opt out of sale | `"opt_out_sale"` |
| right to non-discrimination | `"non_discrimination"` |

## Common Mistakes

### HIGH — Passing prose text as field values instead of mapping to structured fields

OpenPolicy generates all human-readable sentences from the config structure. Passing paragraph text into fields produces malformed or legally duplicated output.

Wrong:
```ts
privacy: {
  dataCollected: {
    // WRONG: prose sentence passed as a field label
    "Data": ["We collect information you provide when you register for an account, including your name and email address."],
  },
}
```

Correct:
```ts
privacy: {
  dataCollected: {
    "Account Information": ["Name", "Email address"],
  },
}
```

Source: `packages/core/src/types.ts`
