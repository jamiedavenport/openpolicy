# @openpolicy/sdk

## 0.0.28

### Patch Changes

- 5e0ea9d: Name the EDPB members directory in the GDPR supplement complaint paragraph instead of referring generically to "your local data protection authority", and add an optional `company.euRepresentative` field for non-EEA controllers required to designate an Article 27 GDPR representative.

  Resolves the `supervisory-authority-complaint-eu` validator warning. The EDPB-directory link is rendered unconditionally for `eu` jurisdictions; the Article 27 paragraph is rendered only when `company.euRepresentative` is set.

- 5e0ea9d: **Breaking:** unify lawful basis and retention with their data categories under one symmetric shape; reshape cookies the same way.

  `OpenPolicyConfig.legalBasis` and `OpenPolicyConfig.retention` are removed from the top level. They now live inside `data` and are keyed by the same set as `data.collected`, so missing or mismatched keys become a TS error at the `defineConfig` call site (with a runtime validator backstop). `data.lawfulBasis` and `data.retention` are required when `data` is present.

  `CookiePolicyCookies` is reshaped from a flat `{ essential: true; [k]: boolean }` map into `{ used: { essential: true; [k]: boolean }; lawfulBasis: { [k]: LegalBasis } }`. Every enabled cookie category requires an Article 6 lawful basis; the rendered "Cookies and Tracking" section appends the basis label to each enabled bullet.

  The Vite plugin now also emits a `ScannedCookieKeys` interface augmentation alongside `ScannedCollectionKeys` in `openpolicy.gen.ts`, threading scanned cookie categories through the `defineConfig` generic the same way data categories already are.

  **Migration:**

  ```diff
   export default defineConfig({
     data: {
       collected: { "Account Information": ["Email"] },
       purposes: { "Account Information": "Auth" },
  +    lawfulBasis: { "Account Information": LegalBases.Contract },
  +    retention: { "Account Information": "Until account deletion" },
     },
  -  legalBasis: { "Providing the service": LegalBases.Contract },
  -  retention: { "Account data": "Until account deletion" },
     cookies: {
  -    essential: true,
  -    analytics: false,
  +    used: { essential: true, analytics: false },
  +    lawfulBasis: { essential: LegalBases.LegalObligation, analytics: LegalBases.Consent },
     },
   });
  ```

- 5e0ea9d: Add a new `data.provisionRequirement` map and a `provision-requirement` section that satisfies the GDPR Article 13(2)(e) disclosure: for each collected category, the controller must state whether providing the data is statutory, contractual, a contract-prerequisite, or voluntary, and the consequences of failing to provide it.

  Resolves the `statutory-contractual-obligation` validator error.

  **Breaking config change.** `DataConfig.provisionRequirement` is now required: every key in `data.collected` must have a matching `{ basis, consequences }` entry. `defineConfig`'s generic enforces exhaustiveness alongside the existing `purposes` / `lawfulBasis` / `retention` maps. Existing configs need to add the new map — for example:

  ```ts
  data: {
    collected: { "Account Information": ["Email"] },
    purposes: { "Account Information": "To authenticate users" },
    lawfulBasis: { "Account Information": "contract" },
    retention: { "Account Information": "Until account deletion" },
    provisionRequirement: {
      "Account Information": {
        basis: "contract-prerequisite",
        consequences: "We cannot create or operate your account.",
      },
    },
  },
  ```

  Under EU/UK jurisdictions the renderer emits a new `provision-requirement` section after `data-retention` listing each category with its basis label and consequences.

## 0.0.27

### Patch Changes

- 261bae3: Adds `automatedDecisionMaking` to fix the GDPR Art. 13(2)(f) / Art. 22 validator error (`automated-decision-making`). Each entry declares one activity with `name`, `logic`, and `significance` fields; an empty array `[]` explicitly declares that no automated decision-making is used.

  Under EU/UK jurisdictions, the rendered privacy policy now includes an "Automated Decision-Making and Profiling" section, and validation emits a warning if the field is omitted entirely (controllers must make an explicit declaration either way). When at least one activity is listed, the section automatically appends the Art. 22(3) right-to-human-review paragraph referencing `company.contact`.

  Example:

  ```ts
  defineConfig({
  	// ... existing fields ...
  	automatedDecisionMaking: [], // explicit "we don't"
  	// or:
  	automatedDecisionMaking: [
  		{
  			name: "Fraud scoring",
  			logic:
  				"Transactions are scored by a rules engine combining device fingerprint and historical patterns.",
  			significance:
  				"A high score may delay or decline a transaction; you can request human review.",
  		},
  	],
  });
  ```

- 261bae3: **Breaking:** top-level `dataCollected` moves to `data.collected`, and a sibling `data.purposes` is newly required — one prose string per collected category, disclosing _why_ you process it. Satisfies GDPR Article 13(1)(c), which was previously unaddressed.

  `defineConfig` now enforces purpose coverage at type-check time: every key in `data.collected` must have a matching entry in `data.purposes`. The `openPolicy()` Vite plugin emits `openpolicy.gen.ts` next to your `openpolicy.ts`, augmenting a `ScannedCollectionKeys` interface so the same constraint applies to scanned `collecting()` categories. Commit `openpolicy.gen.ts` — that keeps the type-level constraint live in CI without needing to run the Vite plugin first.

  Migration: nest `dataCollected` under `data.collected`, then add a `data.purposes` map keyed by the same category names.

  ```ts
  // before
  defineConfig({
  	dataCollected: { "Account Information": ["Name", "Email"] },
  });

  // after
  defineConfig({
  	data: {
  		collected: { "Account Information": ["Name", "Email"] },
  		purposes: {
  			"Account Information": "To authenticate users and send service notifications",
  		},
  	},
  });
  ```

- 261bae3: Add optional `company.dpo` for Data Protection Officer contact details, required under GDPR Article 13(1)(b) when a DPO has been appointed.

  `Dpo` is a discriminated union: provide `{ email, name?, phone?, address? }` to disclose the appointed officer, or `{ required: false, reason? }` to declare explicitly that no DPO is required. The GDPR and UK-GDPR supplements now render a paragraph covering both cases, and the contact section includes the DPO details when present.

  `validateOpenPolicyConfig` emits a warning when `jurisdictions` includes `eu` or `uk` and `company.dpo` is unset — previously the generated policy was silent on DPO, which external GDPR linters flag as a `dpo-contact` violation.

  ```ts
  company: {
    name: "Acme Inc.",
    legalName: "Acme Corporation",
    address: "123 Main St, Springfield, USA",
    contact: "privacy@acme.com",
    dpo: { email: "dpo@acme.com", name: "Jane Doe" },
  },
  ```

- 261bae3: **Breaking:** `legalBasis` is now `Record<PurposeName, LegalBasis>` (alias `LegalBasisMap`) instead of `LegalBasis | LegalBasis[]`. Each named processing purpose maps to its Article 6 lawful basis, fixing the `lawful-basis-per-purpose` validator error (GDPR Art. 13(1)(c) requires the lawful basis to be stated for each distinct processing purpose).

  When any purpose's basis is `"consent"`, the rendered policy now automatically appends a GDPR Art. 13(2)(c) right-to-withdraw paragraph — disclosing the right to withdraw consent at any time without affecting the lawfulness of pre-withdrawal processing. No new config field is required; the disclosure references `company.contact`.

  Validation issues now carry a stable `code` field (in addition to `level` and `message`) so consumers can assert on `code` instead of message substrings. The new code `lawful-basis-per-purpose` fires when an EU/UK policy has an empty `legalBasis` map or any purpose with an empty basis. `Compliance.GDPR` and `Compliance.UK_GDPR` presets now expose `legalBasis` as a single-purpose map by default.

  Migration:

  ```ts
  // before
  defineConfig({
  	legalBasis: ["legitimate_interests", "consent"],
  });

  // after
  defineConfig({
  	legalBasis: {
  		"Providing the service": "legitimate_interests",
  		"Marketing communications": "consent",
  	},
  });
  ```

- 261bae3: **Breaking:** `compile()` now throws when `dataCollected` is empty. Previously, an
  empty `dataCollected` produced an "Information We Collect" section with the
  intro sentence "We collect the following categories of information:" followed
  by an empty list, which fails GDPR's categories-of-data disclosure
  requirement. To fix, populate `dataCollected` in your config, or instrument
  `collecting()` calls and use `autoCollect()` from `@openpolicy/vite-auto-collect`.

## 0.0.26

### Patch Changes

- 21b6670: OpenPolicy is now licensed under Apache-2.0 (previously GPL-3.0-only).
  The `LICENSE.md` file and the `license` field in every published package
  manifest have been updated, and each published tarball now ships
  `LICENSE.md` and `NOTICE.md` at its root. No code changes accompany
  this relicense.

## 0.0.25

## 0.0.24

### Patch Changes

- 94b16b7: Add cookie auto-detection (OP-283).
  - `@openpolicy/sdk` exports a new `cookies` sentinel (spread into `defineConfig({ cookies })`) and a `defineCookie("category")` helper for declaring consent categories manually at call sites.
  - `@openpolicy/vite`'s `openPolicy()` now scans source for `defineCookie()` calls, `<ConsentGate requires="…" />` JSX usage, and `useCookies().has(…)` lookups (including nested `{ and, or, not }` expressions) from `@openpolicy/react`. Detected categories populate the `cookies` sentinel alongside `dataCollected` and `thirdParties`.
  - New plugin option `cookies: { usePackageJson: true }` opts into inferring cookie categories from the project's `package.json` via a known-packages table (e.g. `posthog-js` → `analytics`, `@stripe/stripe-js` → `essential`).

- 94b16b7: Canonical jurisdiction scheme + UK-GDPR support (OP-209, OP-181).

  **Breaking:** `Jurisdiction` values have been replaced with a canonical region-code scheme. Unknown codes are now rejected by the config validator at compile time.

  Old union: `"us" | "eu" | "ca" | "au" | "nz" | "other"`
  New union: `"eu" | "uk" | "us-ca" | "us-va" | "us-co" | "br" | "ca" | "au" | "jp" | "sg"`
  - `"us"` is **removed** — there is no federal US privacy regime shipping content. List specific state codes (e.g. `"us-ca"`) for the states you cover.
  - `"ca"` **semantics flipped** from California → Canada. Consumers using `"ca"` for CCPA must migrate to `"us-ca"`. `"ca"` is now a reserved code for Canada and produces no gated content yet.
  - `"nz"` and `"other"` are removed.
  - New `"uk"` code triggers a UK-GDPR supplement citing the ICO and the Data Protection Act 2018 (closes OP-181).
  - Reserved codes `"us-va"`, `"us-co"`, `"br"`, `"ca"`, `"au"`, `"jp"`, `"sg"` are type-valid today but produce no gated content in 0.1.0.
  - `Compliance.CCPA` preset now expands to `{ jurisdictions: ["us-ca"] }`. New `Compliance.UK_GDPR` preset provides `{ jurisdictions: ["uk"], legalBasis: ["legitimate_interests"] }`.
  - Runtime validator rejects unknown jurisdiction codes with a helpful error listing the full valid set.

  Migration: search your `openpolicy.ts` for `jurisdictions: [...]` and replace `"us"` with the specific state(s) you cover, and `"ca"` (if meant as California) with `"us-ca"`. UK-regulated businesses should add `"uk"`.

## 0.0.23

### Patch Changes

- 8e219fe: Flatten `defineConfig()` — all policy fields now live at the top level. The nested `privacy: { ... }` and `cookie: { ... }` blocks are gone, and `effectiveDate` / `jurisdictions` are single top-level fields (previously duplicated in each block).

  Which policy types are generated is now auto-detected from field presence:
  - **Privacy policy** is emitted if any of `dataCollected`, `legalBasis`, `retention`, `userRights`, or `children` is set.
  - **Cookie policy** is emitted if `cookies` is set.

  You can override auto-detection with `policies: ["privacy"]` or `policies: ["cookie"]`.

  **Breaking changes:**
  - `OpenPolicyConfig` is a single flat object. The `privacy` and `cookie` wrapper keys are removed.
  - `EffectiveDate` is now the template literal type `` `${number}-${number}-${number}` ``.
  - `LegalBasis` is narrowed to a union of GDPR Art. 6 lawful bases: `"consent" | "contract" | "legal_obligation" | "vital_interests" | "public_task" | "legitimate_interests"`. Free-form strings are no longer accepted.
  - `PrivacyPolicyConfig` and `CookiePolicyConfig` are now internal types and no longer re-exported from `@openpolicy/sdk`. Use `OpenPolicyConfig` in user code.
  - `@openpolicy/sdk` re-exports `Retention` (value helper) and the `Retention` type now collides — the type is re-exported as `RetentionMap`.

  **Migration — before:**

  ```ts
  export default defineConfig({
  	company: {
  		/* … */
  	},
  	privacy: {
  		effectiveDate: "2026-01-01",
  		jurisdictions: ["us"],
  		dataCollected: {
  			/* … */
  		},
  		legalBasis: "legitimate_interests",
  		retention: {
  			/* … */
  		},
  		cookies: { essential: true, analytics: false, marketing: false },
  		thirdParties: [],
  		userRights: ["access"],
  	},
  	cookie: {
  		effectiveDate: "2026-01-01",
  		jurisdictions: ["us"],
  		cookies: { essential: true, analytics: true },
  	},
  });
  ```

  **After:**

  ```ts
  export default defineConfig({
  	company: {
  		/* … */
  	},
  	effectiveDate: "2026-01-01",
  	jurisdictions: ["us"],
  	dataCollected: {
  		/* … */
  	},
  	legalBasis: "legitimate_interests",
  	retention: {
  		/* … */
  	},
  	userRights: ["access"],
  	thirdParties: [],
  	cookies: { essential: true, analytics: true },
  });
  ```

- 8e219fe: Remove Terms of Service support. OpenPolicy now focuses exclusively on privacy and cookie policies — domains that are globally regulated and have consistent compliance requirements.

  **Breaking changes:**
  - `PolicyInput` is now a discriminated union of `privacy | cookie` only (the `terms` branch has been removed)
  - `TermsOfServiceConfig` and `DisputeResolutionMethod` types have been removed from `@openpolicy/sdk` and `@openpolicy/core`
  - `validateTermsOfService` has been removed from `@openpolicy/core`
  - `<TermsOfService />` components have been removed from `@openpolicy/react` and `@openpolicy/vue`
  - CLI `openpolicy init` no longer offers a `terms` template option; filename auto-detection no longer treats `"terms"` as a policy type
  - The `terms-of-service` shadcn registry item has been removed

  **Migration:** remove the `terms: { ... }` block from your `openpolicy.ts` config and stop importing `<TermsOfService />`. If you need terms of service content, source it from a dedicated legal tool.

- 8e219fe: **Breaking change:** `userRights` has been removed from `OpenPolicyConfig`. The data-subject rights listed in your privacy policy are now derived automatically from `jurisdictions`:
  - `jurisdictions: ["eu"]` → access, rectification, erasure, portability, restriction, objection (GDPR)
  - `jurisdictions: ["ca"]` → access, erasure, opt_out_sale, non_discrimination (CCPA)
  - Both → the union, in a fixed canonical order
  - `us`, `au`, `nz`, `other` → no rights listed (the "Your Rights" section is omitted)

  **Migration:** delete the `userRights` line from your `openpolicy.ts`. TypeScript will flag the field as an excess property; no other changes are needed.

  ```diff
    export default defineConfig({
      company: { /* ... */ },
      effectiveDate: "2026-01-01",
      jurisdictions: ["us", "eu"],
      dataCollected: { /* ... */ },
      legalBasis: ["legitimate_interests", "consent"],
      retention: { /* ... */ },
      thirdParties: [],
  -   userRights: ["access", "erasure"],
    });
  ```

  The rendered privacy policy may list **more** rights than before if your previous `userRights` value was shorter than the baseline required by your declared `jurisdictions` — this is intentional; the refactor closes a footgun where the field under-declared legal obligations.

  Related SDK surface changes:
  - `Rights` constant removed from `@openpolicy/sdk` (superseded by derivation).
  - `UserRight` type re-export removed from `@openpolicy/sdk`.
  - `Compliance.GDPR` and `Compliance.CCPA` no longer include a `userRights` field — they still provide `jurisdictions` (and `legalBasis` for GDPR), which is enough to drive the correct rights list.
  - New `deriveUserRights(jurisdictions)` export in `@openpolicy/core` for consumers (e.g. forthcoming DSAR tooling) that need the same mapping.

## 0.0.22

## 1.0.0

### Minor Changes

- 6b635d3: `collecting()` label record keys are now required — every key of `value` must appear in the label record. To exclude a field from the compiled privacy policy, pass the new `Ignore` sentinel (re-exported from `@openpolicy/sdk`) as the value: `{ name: "Name", hashedPassword: Ignore }`. The build-time analyser in `@openpolicy/vite-auto-collect` recognises `Ignore` (including renamed imports) and drops those fields from the compiled labels.

## 0.0.21

## 0.0.20

### Patch Changes

- a4cd5ad: Add `@tanstack/intent` skill files for AI coding agents. Run `npx @tanstack/intent@latest install` to load OpenPolicy skills into your agent.

## 0.0.19

### Patch Changes

- 165ae2e: Add `thirdParty()` auto-collect support. Call `thirdParty(name, purpose, policyUrl)` next to the code that uses a third-party service; the `autoCollect` Vite plugin now scans these calls and populates the `thirdParties` sentinel exported from `@openpolicy/sdk`.

## 0.0.18

### Patch Changes

- 82e7df7: Add `autoCollected` sentinel to `@openpolicy/sdk` and new `@openpolicy/vite-auto-collect` Vite plugin that scans source files for `collecting()` calls and inlines the discovered categories into the sentinel at build time. Spread `autoCollected` into `dataCollected` in your `openpolicy.ts` — the plugin composes cleanly without requiring `@openpolicy/vite`.
- 82e7df7: Add `collecting()` runtime wrapper for declaring data collection at the point of storage

## 0.0.17

## 0.0.16

## 0.0.15

### Patch Changes

- 28b6b14: Fixes Jamie's mistakes

## 0.0.13

## 0.0.12

### Patch Changes

- Unified Config

## 0.0.11

### Patch Changes

- Cookie policy

## 0.0.10

## 0.0.9

### Patch Changes

- Fixes bundling and peer deps

## 0.0.8

## 0.0.7

## 0.0.6

### Patch Changes

- Testing

## 0.0.4

### Patch Changes

- Fixes

## 0.0.3

### Patch Changes

- Fixes

## 0.0.2

### Patch Changes

- Test Release
