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

Remove Terms of Service support. OpenPolicy now focuses exclusively on privacy and cookie policies — domains that are globally regulated and have consistent compliance requirements.

**Breaking changes:**

- `PolicyInput` is now a discriminated union of `privacy | cookie` only (the `terms` branch has been removed)
- `TermsOfServiceConfig` and `DisputeResolutionMethod` types have been removed from `@openpolicy/sdk` and `@openpolicy/core`
- `validateTermsOfService` has been removed from `@openpolicy/core`
- `<TermsOfService />` components have been removed from `@openpolicy/react` and `@openpolicy/vue`
- CLI `openpolicy init` no longer offers a `terms` template option; filename auto-detection no longer treats `"terms"` as a policy type
- The `terms-of-service` shadcn registry item has been removed

**Migration:** remove the `terms: { ... }` block from your `openpolicy.ts` config and stop importing `<TermsOfService />`. If you need terms of service content, source it from a dedicated legal tool.
