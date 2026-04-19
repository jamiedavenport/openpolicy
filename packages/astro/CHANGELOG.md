# @openpolicy/astro

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

- Updated dependencies [8e219fe]
- Updated dependencies [8e219fe]
- Updated dependencies [8e219fe]
  - @openpolicy/sdk@0.0.23
  - @openpolicy/core@0.0.23
  - @openpolicy/vite@0.0.23

## 0.0.22

### Patch Changes

- @openpolicy/sdk@0.0.22
- @openpolicy/core@0.0.22
- @openpolicy/vite@0.0.22

## 1.0.0

### Patch Changes

- Updated dependencies [6b635d3]
  - @openpolicy/sdk@1.0.0
  - @openpolicy/core@1.0.0
  - @openpolicy/vite@1.0.0

## 0.0.21

### Patch Changes

- @openpolicy/sdk@0.0.21
- @openpolicy/core@0.0.21
- @openpolicy/vite@0.0.21

## 0.0.20

### Patch Changes

- Updated dependencies [a4cd5ad]
  - @openpolicy/sdk@0.0.20
  - @openpolicy/core@0.0.20
  - @openpolicy/vite@0.0.20

## 0.0.19

### Patch Changes

- Updated dependencies [165ae2e]
  - @openpolicy/sdk@0.0.19
  - @openpolicy/core@0.0.19
  - @openpolicy/vite@0.0.19

## 0.0.18

### Patch Changes

- Updated dependencies [82e7df7]
- Updated dependencies [82e7df7]
  - @openpolicy/sdk@0.0.18
  - @openpolicy/core@0.0.18
  - @openpolicy/vite@0.0.18

## 0.0.17

### Patch Changes

- Updated dependencies [efa565b]
  - @openpolicy/core@0.0.17
  - @openpolicy/sdk@0.0.17
  - @openpolicy/vite@0.0.17

## 0.0.16

### Patch Changes

- @openpolicy/sdk@0.0.16
- @openpolicy/core@0.0.16
- @openpolicy/vite@0.0.16

## 0.0.15

### Patch Changes

- 28b6b14: Fixes Jamie's mistakes
- Updated dependencies [28b6b14]
  - @openpolicy/core@0.0.15
  - @openpolicy/vite@0.0.15
  - @openpolicy/sdk@0.0.15

## 0.0.13

### Patch Changes

- Updated dependencies [2372fdb]
  - @openpolicy/core@0.0.13
  - @openpolicy/vite@0.0.13
  - @openpolicy/sdk@0.0.13

## 0.0.12

### Patch Changes

- Unified Config
- Updated dependencies
  - @openpolicy/core@0.0.12
  - @openpolicy/vite@0.0.12
  - @openpolicy/sdk@0.0.12

## 0.0.11

### Patch Changes

- Updated dependencies
  - @openpolicy/core@0.0.11
  - @openpolicy/vite@0.0.11
  - @openpolicy/sdk@0.0.11

## 0.0.10

### Patch Changes

- @openpolicy/sdk@0.0.10
- @openpolicy/core@0.0.10
- @openpolicy/vite@0.0.10

## 0.0.9

### Patch Changes

- Fixes bundling and peer deps
- Updated dependencies
  - @openpolicy/core@0.0.9
  - @openpolicy/vite@0.0.9
  - @openpolicy/sdk@0.0.9

## 0.0.8

### Patch Changes

- Astro Plugin
  - @openpolicy/vite@0.0.8
