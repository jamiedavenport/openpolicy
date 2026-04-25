# PrivacyPolicyConfig Field Reference

All fields below live at the top level of `OpenPolicyConfig` (the object passed to `defineConfig()`) alongside `company`. OpenPolicy auto-detects the privacy policy from the presence of privacy-specific fields.

## PrivacyPolicyConfig

| Field                     | Type                                                             | Required               | Notes                                                                                                                                                                                                                                                                                                            |
| ------------------------- | ---------------------------------------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `effectiveDate`           | `string`                                                         | Yes                    | ISO date string (e.g. `"2026-01-01"`). Validation fails if empty.                                                                                                                                                                                                                                                |
| `dataCollected`           | `Record<string, string[]>`                                       | Yes                    | At least one entry required. Keys are category labels; values are arrays of data point labels. Use `DataCategories.*` presets or spread `dataCollected` sentinel.                                                                                                                                                |
| `legalBasis`              | `Record<PurposeName, LegalBasis>` (`LegalBasisMap`)              | Yes (GDPR)             | Required when `"eu"` or `"uk"` is in `jurisdictions`. Keys are human-readable processing-purpose names; values are the Article 6 basis for that purpose. GDPR Art. 13(1)(c) requires the lawful basis to be stated for each distinct processing purpose.                                                         |
| `retention`               | `Record<string, string>`                                         | Yes                    | Keys should match `dataCollected` categories. Use `Retention.*` preset strings.                                                                                                                                                                                                                                  |
| `cookies`                 | `{ essential: boolean; analytics: boolean; marketing: boolean }` | Yes                    | All three booleans required. Drives cookie policy sections.                                                                                                                                                                                                                                                      |
| `thirdParties`            | `{ name: string; purpose: string; policyUrl?: string }[]`        | Yes                    | Can be empty array. Use `Providers.*` presets or spread `thirdParties` sentinel.                                                                                                                                                                                                                                 |
| `jurisdictions`           | `Jurisdiction[]`                                                 | Yes                    | Controls which jurisdiction-specific sections appear and drives the auto-derived user rights list. See values below.                                                                                                                                                                                             |
| `children`                | `{ underAge: number; noticeUrl?: string }`                       | No                     | Include when service is directed at children. `underAge` must be a positive integer.                                                                                                                                                                                                                             |
| `automatedDecisionMaking` | `AutomatedDecision[]` (alias `AutomatedDecisionMaking`)          | No (warns under EU/UK) | GDPR Art. 13(2)(f) / Art. 22 disclosure. Set to `[]` to declare no automated decision-making is used. Each entry declares one activity with `name`, `logic`, and `significance`. Omitting under EU/UK emits a warning; populating triggers an Art. 22(3) right-to-human-review paragraph in the rendered policy. |

### LegalBasis values

| Constant                         | String value             |
| -------------------------------- | ------------------------ |
| `LegalBases.Consent`             | `"consent"`              |
| `LegalBases.Contract`            | `"contract"`             |
| `LegalBases.LegalObligation`     | `"legal_obligation"`     |
| `LegalBases.VitalInterests`      | `"vital_interests"`      |
| `LegalBases.PublicTask`          | `"public_task"`          |
| `LegalBases.LegitimateInterests` | `"legitimate_interests"` |

### Jurisdiction values

| Value     | Region          | Gated content in 0.1.0           |
| --------- | --------------- | -------------------------------- |
| `"eu"`    | European Union  | GDPR sections                    |
| `"uk"`    | United Kingdom  | UK-GDPR sections (ICO, DPA 2018) |
| `"us-ca"` | California, USA | CCPA / CPRA sections             |
| `"us-va"` | Virginia, USA   | Reserved (no content yet)        |
| `"us-co"` | Colorado, USA   | Reserved (no content yet)        |
| `"br"`    | Brazil          | Reserved (no content yet)        |
| `"ca"`    | Canada          | Reserved (no content yet)        |
| `"au"`    | Australia       | Reserved (no content yet)        |
| `"jp"`    | Japan           | Reserved (no content yet)        |
| `"sg"`    | Singapore       | Reserved (no content yet)        |

There is no federal `"us"` code — use specific state codes like `"us-ca"`. See [Supported jurisdictions](https://docs.openpolicy.sh/references/jurisdictions) for the canonical list.

### User rights (auto-derived)

User rights are **not** a config field — they are derived from `jurisdictions` at compile time.

| Jurisdiction                                                                  | Rights granted                                                      |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `"eu"` (GDPR)                                                                 | access, rectification, erasure, portability, restriction, objection |
| `"uk"` (UK-GDPR)                                                              | access, rectification, erasure, portability, restriction, objection |
| `"us-ca"` (CCPA)                                                              | access, erasure, opt_out_sale, non_discrimination                   |
| Reserved codes (`"us-va"`, `"us-co"`, `"br"`, `"ca"`, `"au"`, `"jp"`, `"sg"`) | ∅ (no baseline yet)                                                 |

When multiple jurisdictions are declared, the rights are unioned and rendered in a fixed canonical order.

### DataCategories presets

Each entry is a `Record<string, string[]>` safe to spread into `dataCollected`:

| Constant                        | Category label          | Data points                                       |
| ------------------------------- | ----------------------- | ------------------------------------------------- |
| `DataCategories.AccountInfo`    | `"Account Information"` | Name, Email address                               |
| `DataCategories.SessionData`    | `"Session Data"`        | IP address, User agent, Browser type              |
| `DataCategories.PaymentInfo`    | `"Payment Information"` | Card last 4 digits, Billing name, Billing address |
| `DataCategories.UsageData`      | `"Usage Data"`          | Pages visited, Features used, Time spent          |
| `DataCategories.DeviceInfo`     | `"Device Information"`  | Device type, Operating system, Browser version    |
| `DataCategories.LocationData`   | `"Location Data"`       | Country, City, Timezone                           |
| `DataCategories.Communications` | `"Communications"`      | Email content, Support tickets                    |

### Retention presets

| Constant                         | String value                      |
| -------------------------------- | --------------------------------- |
| `Retention.UntilAccountDeletion` | `"Until account deletion"`        |
| `Retention.UntilSessionExpiry`   | `"Until session expiry"`          |
| `Retention.ThirtyDays`           | `"30 days"`                       |
| `Retention.NinetyDays`           | `"90 days"`                       |
| `Retention.OneYear`              | `"1 year"`                        |
| `Retention.ThreeYears`           | `"3 years"`                       |
| `Retention.AsRequiredByLaw`      | `"As required by applicable law"` |

### Providers presets

Each entry is a `{ name: string; purpose: string; policyUrl: string }` safe to use in `thirdParties`:

**Payments:** `Providers.Stripe`, `Providers.Paddle`, `Providers.LemonSqueezy`, `Providers.PayPal`

**Analytics:** `Providers.GoogleAnalytics`, `Providers.PostHog`, `Providers.Plausible`, `Providers.Mixpanel`

**Infrastructure:** `Providers.Vercel`, `Providers.Cloudflare`, `Providers.AWS`

**Auth:** `Providers.Auth0`, `Providers.Clerk`

**Email:** `Providers.Resend`, `Providers.Postmark`, `Providers.SendGrid`, `Providers.Loops`

**Monitoring:** `Providers.Sentry`, `Providers.Datadog`

### Compliance presets

| Preset               | Expands to                                                                                   |
| -------------------- | -------------------------------------------------------------------------------------------- |
| `Compliance.GDPR`    | `{ jurisdictions: ["eu"], legalBasis: { "Providing the service": "legitimate_interests" } }` |
| `Compliance.UK_GDPR` | `{ jurisdictions: ["uk"], legalBasis: { "Providing the service": "legitimate_interests" } }` |
| `Compliance.CCPA`    | `{ jurisdictions: ["us-ca"] }`                                                               |

### Validation behavior

- `effectiveDate` empty → fatal error
- `company.*` fields empty → fatal error per field
- `dataCollected` has zero keys → fatal error
- `"eu"` or `"uk"` in jurisdictions + empty `legalBasis` map → fatal `lawful-basis-per-purpose` error
- `"eu"` or `"uk"` in jurisdictions + any purpose with empty basis → fatal `lawful-basis-per-purpose` error
- When any purpose's basis is `"consent"`, the rendered policy automatically appends an Art. 13(2)(c) right-to-withdraw paragraph
- `"eu"` or `"uk"` in jurisdictions + `automatedDecisionMaking` omitted → `automated-decision-making` warning (set to `[]` to declare none, or populate)
- Any unknown jurisdiction code → fatal error (lists valid codes in message)
- `children.underAge` ≤ 0 → fatal error

Source: `packages/core/src/validate.ts`

---

## CookiePolicyConfig

All fields below live at the top level of `OpenPolicyConfig` (the object passed to `defineConfig()`) alongside `company`. OpenPolicy auto-detects the cookie policy from the presence of `cookies`, `consentMechanism`, or `trackingTechnologies`.

| Field                  | Type                                                                        | Required | Notes                                                                                                       |
| ---------------------- | --------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------- |
| `effectiveDate`        | `string`                                                                    | Yes      | ISO date string. Shared with privacy policy.                                                                |
| `cookies`              | `CookiePolicyCookies`                                                       | Yes      | `essential: boolean` is required; all other keys are `boolean` and treated as additional cookie categories. |
| `jurisdictions`        | `Jurisdiction[]`                                                            | Yes      | Same values as the privacy policy. Shared at the top level.                                                 |
| `thirdParties`         | `{ name: string; purpose: string; policyUrl?: string }[]`                   | No       | Use `Providers.*` presets. Shared with privacy policy.                                                      |
| `trackingTechnologies` | `string[]`                                                                  | No       | e.g. `["cookies", "localStorage", "sessionStorage", "pixel"]`                                               |
| `consentMechanism`     | `{ hasBanner: boolean; hasPreferencePanel: boolean; canWithdraw: boolean }` | No       | Required when `"eu"` or `"uk"` is in jurisdictions (GDPR / UK-GDPR + PECR compliance).                      |

### CookiePolicyCookies shape

```ts
type CookiePolicyCookies = {
	essential: boolean; // required
	[key: string]: boolean; // additional categories
};
```

Example with custom categories:

```ts
defineConfig({
	company: {
		/* ... */
	},
	effectiveDate: "2026-01-01",
	jurisdictions: ["eu", "us-ca"],
	cookies: {
		essential: true,
		analytics: true,
		marketing: false,
		preferences: true,
	},
});
```
