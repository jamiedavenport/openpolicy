---
"@openpolicy/sdk": patch
"@openpolicy/vite": patch
---

Add cookie auto-detection (OP-283).

- `@openpolicy/sdk` exports a new `cookies` sentinel (spread into `defineConfig({ cookies })`) and a `defineCookie("category")` helper for declaring consent categories manually at call sites.
- `@openpolicy/vite`'s `openPolicy()` now scans source for `defineCookie()` calls, `<ConsentGate requires="…" />` JSX usage, and `useCookies().has(…)` lookups (including nested `{ and, or, not }` expressions) from `@openpolicy/react`. Detected categories populate the `cookies` sentinel alongside `dataCollected` and `thirdParties`.
- New plugin option `cookies: { usePackageJson: true }` opts into inferring cookie categories from the project's `package.json` via a known-packages table (e.g. `posthog-js` → `analytics`, `@stripe/stripe-js` → `essential`).
