# PrivacyPolicyConfig Field Reference

All fields below live at the top level of `OpenPolicyConfig` (the object passed to `defineConfig()`) alongside `company`. OpenPolicy auto-detects the privacy policy from the presence of privacy-specific fields.

## OpenPolicyConfig — privacy fields

| Field                     | Type                                                      | Required                | Notes                                                                                                                                                                                                                                                                                                            |
| ------------------------- | --------------------------------------------------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `effectiveDate`           | `string`                                                  | Yes                     | ISO date string (e.g. `"2026-01-01"`). Validation fails if empty.                                                                                                                                                                                                                                                |
| `data`                    | `DataConfig`                                              | Yes (for privacy)       | `{ collected, context }`. Both sub-maps are keyed by the same set of category names — `defineConfig` infers the set from `data.collected` and TS-enforces that every key has a matching `context` entry.                                                                                                         |
| `cookies`                 | `CookiePolicyCookies`                                     | Yes (for cookie policy) | `{ used, context }`. `used` requires `essential: true`; `context` requires one entry per used category.                                                                                                                                                                                                          |
| `thirdParties`            | `{ name: string; purpose: string; policyUrl?: string }[]` | No                      | Can be empty. Use `Providers.*` presets or spread `thirdParties` sentinel.                                                                                                                                                                                                                                       |
| `jurisdictions`           | `Jurisdiction[]`                                          | Yes                     | Controls which jurisdiction-specific sections appear and drives the auto-derived user rights list. See values below.                                                                                                                                                                                             |
| `children`                | `{ underAge: number; noticeUrl?: string }`                | No                      | Include when service is directed at children. `underAge` must be a positive integer.                                                                                                                                                                                                                             |
| `automatedDecisionMaking` | `AutomatedDecision[]`                                     | No (warns under EU/UK)  | GDPR Art. 13(2)(f) / Art. 22 disclosure. Set to `[]` to declare no automated decision-making is used. Each entry declares one activity with `name`, `logic`, and `significance`. Omitting under EU/UK emits a warning; populating triggers an Art. 22(3) right-to-human-review paragraph in the rendered policy. |

### DataConfig shape

```ts
type DataConfig = {
	collected: Record<string, string[]>; // category → field labels
	context: Record<string, DataContext>; // category → metadata row
};

type DataContext = {
	purpose: string; // human-readable purpose
	lawfulBasis: LegalBasis; // Article 6 basis
	retention: string; // retention period
	provision: ProvisionRequirement; // why we need this data + consequences if not provided
};
```

Both sub-maps share the same key set. The generic on `defineConfig` requires `context` to cover every key present in `collected` (plus every key the Vite plugin scans into `ScannedCollectionKeys`).

The renderer joins each context entry into the GDPR Art. 13(1)(c) "Legal Basis for Processing" section: `**[category]** — used for [purpose] — [Article 6 basis]`.

### LegalBasis values

| Constant                         | String value             |
| -------------------------------- | ------------------------ |
| `LegalBases.Consent`             | `"consent"`              |
| `LegalBases.Contract`            | `"contract"`             |
| `LegalBases.LegalObligation`     | `"legal_obligation"`     |
| `LegalBases.VitalInterests`      | `"vital_interests"`      |
| `LegalBases.PublicTask`          | `"public_task"`          |
| `LegalBases.LegitimateInterests` | `"legitimate_interests"` |

### ProvisionRequirement helpers

Each helper returns a `{ basis, consequences }` object safe to use under `data.context[category].provision`:

| Helper                               | Basis                     | Use when…                                                                         |
| ------------------------------------ | ------------------------- | --------------------------------------------------------------------------------- |
| `Statutory(consequences)`            | `"statutory"`             | A law requires the data (e.g. tax records).                                       |
| `Contractual(consequences)`          | `"contractual"`           | A contract you've already entered into requires it.                               |
| `ContractPrerequisite(consequences)` | `"contract-prerequisite"` | The user must provide it to enter a contract (e.g. account creation, payment).    |
| `Voluntary(consequences)`            | `"voluntary"`             | The data is optional — describe what (if anything) the user loses by withholding. |

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

Each entry is a `Record<string, string[]>` safe to spread into `data.collected`:

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

Each value is a string safe to use under `data.context[category].retention`.

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

| Preset               | Expands to                     |
| -------------------- | ------------------------------ |
| `Compliance.GDPR`    | `{ jurisdictions: ["eu"] }`    |
| `Compliance.UK_GDPR` | `{ jurisdictions: ["uk"] }`    |
| `Compliance.CCPA`    | `{ jurisdictions: ["us-ca"] }` |

The Article 6 lawful basis per data category lives in `data.context[category].lawfulBasis` (you choose), not the preset.

### Validation behavior

- `effectiveDate` empty → fatal error
- `company.*` fields empty → fatal error per field
- `data.collected` has zero keys → fatal error
- For each `data.collected` category: missing `data.context[category]` → fatal `data-context-missing` error
- For each `data.context` key not in `data.collected` → fatal `data-context-orphan` error
- For each enabled cookie in `cookies.used`: missing `cookies.context[key]` → fatal `cookie-lawful-basis-missing` error
- When any `data.context[category].lawfulBasis` is `"consent"`, the rendered policy automatically appends an Art. 13(2)(c) right-to-withdraw paragraph
- `"eu"` or `"uk"` in jurisdictions + `automatedDecisionMaking` omitted → `automated-decision-making` warning (set to `[]` to declare none, or populate)
- Any unknown jurisdiction code → fatal error (lists valid codes in message)
- `children.underAge` ≤ 0 → fatal error

Source: `packages/core/src/validate.ts`, `packages/core/src/validate-config.ts`, `packages/core/src/validate-cookie.ts`

---

## CookiePolicyCookies shape

`cookies` is a single object with two keyed sub-maps that mirror the `data` block:

```ts
type CookiePolicyCookies = {
	used: { essential: true; [key: string]: boolean }; // categories enabled
	context: Record<string, { lawfulBasis: LegalBasis }>; // Article 6 basis per category
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
		used: {
			essential: true,
			analytics: true,
			marketing: false,
			preferences: true,
		},
		context: {
			essential: { lawfulBasis: LegalBases.LegalObligation },
			analytics: { lawfulBasis: LegalBases.Consent },
			marketing: { lawfulBasis: LegalBases.Consent },
			preferences: { lawfulBasis: LegalBases.Consent },
		},
	},
});
```

The Vite plugin auto-emits the discovered cookie categories into `ScannedCookieKeys`, so `defineConfig` requires `cookies.context` to cover every scanned category as well.

| Field                  | Type                                                                        | Required | Notes                                                                                                      |
| ---------------------- | --------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------- |
| `cookies.used`         | `{ essential: true; [k: string]: boolean }`                                 | Yes      | `essential` is required and must be `true`; other keys are `boolean` and treated as additional categories. |
| `cookies.context`      | `Record<keyof used, { lawfulBasis: LegalBasis }>`                           | Yes      | One Article 6 basis per category, keyed by the same set as `cookies.used`.                                 |
| `trackingTechnologies` | `string[]`                                                                  | No       | e.g. `["cookies", "localStorage", "sessionStorage", "pixel"]`                                              |
| `consentMechanism`     | `{ hasBanner: boolean; hasPreferencePanel: boolean; canWithdraw: boolean }` | No       | Required when `"eu"` or `"uk"` is in jurisdictions (GDPR / UK-GDPR + PECR compliance).                     |
