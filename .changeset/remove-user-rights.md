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

**Breaking change:** `userRights` has been removed from `OpenPolicyConfig`. The data-subject rights listed in your privacy policy are now derived automatically from `jurisdictions`:

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
