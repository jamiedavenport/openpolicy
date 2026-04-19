# @openpolicy/sdk

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
