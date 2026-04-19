# PrivacyPolicyConfig Field Reference

All fields below live at the top level of `OpenPolicyConfig` (the object passed to `defineConfig()`) alongside `company`. OpenPolicy auto-detects the privacy policy from the presence of privacy-specific fields.

## PrivacyPolicyConfig

| Field | Type | Required | Notes |
|---|---|---|---|
| `effectiveDate` | `string` | Yes | ISO date string (e.g. `"2026-01-01"`). Validation fails if empty. |
| `dataCollected` | `Record<string, string[]>` | Yes | At least one entry required. Keys are category labels; values are arrays of data point labels. Use `DataCategories.*` presets or spread `dataCollected` sentinel. |
| `legalBasis` | `LegalBasis \| LegalBasis[]` | Yes (GDPR) | Required when `"eu"` is in `jurisdictions`. Accepts a single value or array. |
| `retention` | `Record<string, string>` | Yes | Keys should match `dataCollected` categories. Use `Retention.*` preset strings. |
| `cookies` | `{ essential: boolean; analytics: boolean; marketing: boolean }` | Yes | All three booleans required. Drives cookie policy sections. |
| `thirdParties` | `{ name: string; purpose: string; policyUrl?: string }[]` | Yes | Can be empty array. Use `Providers.*` presets or spread `thirdParties` sentinel. |
| `jurisdictions` | `Jurisdiction[]` | Yes | Controls which jurisdiction-specific sections appear and drives the auto-derived user rights list. See values below. |
| `children` | `{ underAge: number; noticeUrl?: string }` | No | Include when service is directed at children. `underAge` must be a positive integer. |

### LegalBasis values

| Constant | String value |
|---|---|
| `LegalBases.Consent` | `"consent"` |
| `LegalBases.Contract` | `"contract"` |
| `LegalBases.LegalObligation` | `"legal_obligation"` |
| `LegalBases.VitalInterests` | `"vital_interests"` |
| `LegalBases.PublicTask` | `"public_task"` |
| `LegalBases.LegitimateInterests` | `"legitimate_interests"` |

### Jurisdiction values

| Value | Region |
|---|---|
| `"us"` | United States |
| `"eu"` | European Union (triggers GDPR sections) |
| `"ca"` | California, USA (triggers CCPA sections) |
| `"au"` | Australia |
| `"nz"` | New Zealand |
| `"other"` | Other / unspecified |

### User rights (auto-derived)

User rights are **not** a config field — they are derived from `jurisdictions` at compile time.

| Jurisdiction | Rights granted |
|---|---|
| `"eu"` (GDPR) | access, rectification, erasure, portability, restriction, objection |
| `"ca"` (CCPA) | access, erasure, opt_out_sale, non_discrimination |
| `"us"`, `"au"`, `"nz"`, `"other"` | ∅ (no baseline) |

When multiple jurisdictions are declared, the rights are unioned and rendered in a fixed canonical order.

### DataCategories presets

Each entry is a `Record<string, string[]>` safe to spread into `dataCollected`:

| Constant | Category label | Data points |
|---|---|---|
| `DataCategories.AccountInfo` | `"Account Information"` | Name, Email address |
| `DataCategories.SessionData` | `"Session Data"` | IP address, User agent, Browser type |
| `DataCategories.PaymentInfo` | `"Payment Information"` | Card last 4 digits, Billing name, Billing address |
| `DataCategories.UsageData` | `"Usage Data"` | Pages visited, Features used, Time spent |
| `DataCategories.DeviceInfo` | `"Device Information"` | Device type, Operating system, Browser version |
| `DataCategories.LocationData` | `"Location Data"` | Country, City, Timezone |
| `DataCategories.Communications` | `"Communications"` | Email content, Support tickets |

### Retention presets

| Constant | String value |
|---|---|
| `Retention.UntilAccountDeletion` | `"Until account deletion"` |
| `Retention.UntilSessionExpiry` | `"Until session expiry"` |
| `Retention.ThirtyDays` | `"30 days"` |
| `Retention.NinetyDays` | `"90 days"` |
| `Retention.OneYear` | `"1 year"` |
| `Retention.ThreeYears` | `"3 years"` |
| `Retention.AsRequiredByLaw` | `"As required by applicable law"` |

### Providers presets

Each entry is a `{ name: string; purpose: string; policyUrl: string }` safe to use in `thirdParties`:

**Payments:** `Providers.Stripe`, `Providers.Paddle`, `Providers.LemonSqueezy`, `Providers.PayPal`

**Analytics:** `Providers.GoogleAnalytics`, `Providers.PostHog`, `Providers.Plausible`, `Providers.Mixpanel`

**Infrastructure:** `Providers.Vercel`, `Providers.Cloudflare`, `Providers.AWS`

**Auth:** `Providers.Auth0`, `Providers.Clerk`

**Email:** `Providers.Resend`, `Providers.Postmark`, `Providers.SendGrid`, `Providers.Loops`

**Monitoring:** `Providers.Sentry`, `Providers.Datadog`

### Compliance presets

| Preset | Expands to |
|---|---|
| `Compliance.GDPR` | `{ jurisdictions: ["eu"], legalBasis: ["legitimate_interests"] }` |
| `Compliance.CCPA` | `{ jurisdictions: ["ca"] }` |

### Validation behavior

- `effectiveDate` empty → fatal error
- `company.*` fields empty → fatal error per field
- `dataCollected` has zero keys → fatal error
- `"eu"` in jurisdictions + no `legalBasis` → fatal error
- `children.underAge` ≤ 0 → fatal error

Source: `packages/core/src/validate.ts`

---

## CookiePolicyConfig

All fields below live at the top level of `OpenPolicyConfig` (the object passed to `defineConfig()`) alongside `company`. OpenPolicy auto-detects the cookie policy from the presence of `cookies`, `consentMechanism`, or `trackingTechnologies`.

| Field | Type | Required | Notes |
|---|---|---|---|
| `effectiveDate` | `string` | Yes | ISO date string. Shared with privacy policy. |
| `cookies` | `CookiePolicyCookies` | Yes | `essential: boolean` is required; all other keys are `boolean` and treated as additional cookie categories. |
| `jurisdictions` | `Jurisdiction[]` | Yes | Same values as the privacy policy. Shared at the top level. |
| `thirdParties` | `{ name: string; purpose: string; policyUrl?: string }[]` | No | Use `Providers.*` presets. Shared with privacy policy. |
| `trackingTechnologies` | `string[]` | No | e.g. `["cookies", "localStorage", "sessionStorage", "pixel"]` |
| `consentMechanism` | `{ hasBanner: boolean; hasPreferencePanel: boolean; canWithdraw: boolean }` | No | Required when `"eu"` in jurisdictions for GDPR compliance. |

### CookiePolicyCookies shape

```ts
type CookiePolicyCookies = {
  essential: boolean;   // required
  [key: string]: boolean; // additional categories
};
```

Example with custom categories:

```ts
defineConfig({
  company: { /* ... */ },
  effectiveDate: "2026-01-01",
  jurisdictions: ["eu", "us"],
  cookies: {
    essential: true,
    analytics: true,
    marketing: false,
    preferences: true,
  },
})
```
