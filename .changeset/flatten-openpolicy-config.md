---
"@openpolicy/sdk": patch
"@openpolicy/core": patch
"@openpolicy/vite": patch
"@openpolicy/vite-auto-collect": patch
"@openpolicy/cli": patch
"@openpolicy/astro": patch
"@openpolicy/react": patch
"@openpolicy/vue": patch
"@openpolicy/renderers": patch
---

Flatten `defineConfig()` — all policy fields now live at the top level. The nested `privacy: { ... }` and `cookie: { ... }` blocks are gone, and `effectiveDate` / `jurisdictions` are single top-level fields (previously duplicated in each block).

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
  company: { /* … */ },
  privacy: {
    effectiveDate: "2026-01-01",
    jurisdictions: ["us"],
    dataCollected: { /* … */ },
    legalBasis: "legitimate_interests",
    retention: { /* … */ },
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
  company: { /* … */ },
  effectiveDate: "2026-01-01",
  jurisdictions: ["us"],
  dataCollected: { /* … */ },
  legalBasis: "legitimate_interests",
  retention: { /* … */ },
  userRights: ["access"],
  thirdParties: [],
  cookies: { essential: true, analytics: true },
});
```
