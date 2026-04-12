---
"@openpolicy/vite-auto-collect": minor
---

Add `usePackageJson` option to `autoCollect()` that cross-references `package.json` dependencies against a built-in registry of known npm packages (Stripe, Sentry, PostHog, Datadog, and ~12 others) to auto-populate `thirdParties` without requiring source-code annotations. Explicit `thirdParty()` calls always take precedence over auto-detected entries.
