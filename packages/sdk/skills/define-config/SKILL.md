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
  privacy: {
    effectiveDate: "2026-01-01",
    dataCollected: { ...dataCollected },
    legalBasis: "legitimate_interests",
    retention: { "Account Information": "Until account deletion" },
    cookies: { essential: true, analytics: false, marketing: false },
    thirdParties: [...thirdParties],
    userRights: ["access", "erasure"],
    jurisdictions: ["us"],
  },
});
```

`company` is declared once at the top level — do not repeat it inside `privacy` or `cookie`.

## Core Patterns

### 1. Privacy config with GDPR

Use `Compliance.GDPR` to spread the required `jurisdictions`, `legalBasis`, and `userRights` values in one step:

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
  privacy: {
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
    cookies: { essential: true, analytics: true, marketing: false },
    thirdParties: [...thirdParties, Providers.Stripe, Providers.PostHog],
    children: { underAge: 13 },
  },
});
```

`Compliance.GDPR` expands to `{ jurisdictions: ["eu"], legalBasis: ["legitimate_interests"], userRights: ["access", "rectification", "erasure", "portability", "restriction", "objection"] }`.

### 2. Using Compliance presets

`Compliance.GDPR` and `Compliance.CCPA` are objects safe to spread into `privacy`:

```ts
import { Compliance } from "@openpolicy/sdk";

// GDPR only
privacy: { ...Compliance.GDPR, ... }

// Both (array values merge correctly via spread — userRights and jurisdictions union)
privacy: {
  ...Compliance.GDPR,
  jurisdictions: [...Compliance.GDPR.jurisdictions, ...Compliance.CCPA.jurisdictions],
  userRights: [...Compliance.GDPR.userRights, ...Compliance.CCPA.userRights],
  ...
}
```

`Compliance.CCPA` does not include `legalBasis` — it provides only `jurisdictions: ["ca"]` and `userRights: ["access", "erasure", "opt_out_sale", "non_discrimination"]`.

Available preset groups from `@openpolicy/sdk`:

| Export | Content |
|---|---|
| `DataCategories` | Named `dataCollected` entries (AccountInfo, SessionData, PaymentInfo, UsageData, DeviceInfo, LocationData, Communications) |
| `Retention` | Retention period strings (UntilAccountDeletion, ThirtyDays, NinetyDays, OneYear, ThreeYears, AsRequiredByLaw, …) |
| `Rights` | `UserRight` string constants (Access, Rectification, Erasure, …) |
| `LegalBases` | `LegalBasis` string constants (Consent, Contract, LegitimateInterests, …) |
| `Compliance` | Preset bundles: `GDPR`, `CCPA` |
| `Providers` | Named third-party descriptors: Stripe, PostHog, Vercel, Sentry, Clerk, Resend, … |

### 3. Cookie config

```ts
export default defineConfig({
  company: { ... },
  cookie: {
    effectiveDate: "2026-01-01",
    cookies: { essential: true, analytics: true, marketing: false },
    jurisdictions: ["eu", "us"],
    consentMechanism: {
      hasBanner: true,
      hasPreferencePanel: true,
      canWithdraw: true,
    },
    trackingTechnologies: ["localStorage", "sessionStorage", "cookies"],
    thirdParties: [Providers.GoogleAnalytics, Providers.Cloudflare],
  },
});
```

`CookiePolicyCookies` requires `essential: boolean` — all other keys are `boolean` and are treated as additional cookie categories.

## Common Mistakes

### HIGH — Using standalone PrivacyPolicyConfig instead of nested OpenPolicyConfig

Wrong:
```ts
// WRONG: standalone shape, company repeated inside the policy object
import type { PrivacyPolicyConfig } from "@openpolicy/sdk";

const config: PrivacyPolicyConfig = {
  company: { name: "Acme", legalName: "Acme, Inc.", address: "...", contact: "..." },
  effectiveDate: "2026-01-01",
  dataCollected: {},
  legalBasis: "consent",
  retention: {},
  cookies: { essential: true, analytics: false, marketing: false },
  thirdParties: [],
  userRights: [],
  jurisdictions: [],
};
```

Correct:
```ts
// correct: nested OpenPolicyConfig via defineConfig()
import { defineConfig } from "@openpolicy/sdk";

export default defineConfig({
  company: { name: "Acme", legalName: "Acme, Inc.", address: "...", contact: "privacy@acme.com" },
  privacy: {
    effectiveDate: "2026-01-01",
    dataCollected: {},
    legalBasis: "consent",
    retention: {},
    cookies: { essential: true, analytics: false, marketing: false },
    thirdParties: [],
    userRights: [],
    jurisdictions: [],
  },
});
```

React components and the autoCollect pipeline read from `OpenPolicyConfig`; the standalone policy types are internal shapes not consumed by the rendering layer.

Source: `packages/core/src/types.ts`

---

### MEDIUM — Not specifying jurisdictions — GDPR/CCPA sections silently absent

Wrong:
```ts
// WRONG: jurisdictions missing — legalBasis section and GDPR/CCPA content will not appear
privacy: {
  legalBasis: "legitimate_interests",
  userRights: ["access", "erasure"],
  // jurisdictions omitted
}
```

Correct:
```ts
privacy: {
  legalBasis: "legitimate_interests",
  userRights: ["access", "erasure"],
  jurisdictions: ["eu", "us"],
}
```

Section builders for GDPR (`eu`) and CCPA (`ca`) content check `config.jurisdictions` before generating output. Omitting `jurisdictions` (or passing an empty array) causes those sections to be silently skipped with no warning. `Compliance.GDPR` and `Compliance.CCPA` include the correct `jurisdictions` values when spread.

Source: `packages/core/src/templates/privacy/`

## Reference

- [PrivacyPolicyConfig and CookiePolicyConfig field table](./references/privacy-config.md)
