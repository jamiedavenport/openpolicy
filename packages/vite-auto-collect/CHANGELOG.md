# @openpolicy/vite-auto-collect

## 1.0.0

### Minor Changes

- 6b635d3: `collecting()` label record keys are now required — every key of `value` must appear in the label record. To exclude a field from the compiled privacy policy, pass the new `Ignore` sentinel (re-exported from `@openpolicy/sdk`) as the value: `{ name: "Name", hashedPassword: Ignore }`. The build-time analyser in `@openpolicy/vite-auto-collect` recognises `Ignore` (including renamed imports) and drops those fields from the compiled labels.

## 0.0.21

### Patch Changes

- 7dda430: Fix `dataCollected` / `thirdParties` being empty under the Vite dev server.
  The plugin now excludes `@openpolicy/sdk` from Vite's dep pre-bundler
  (both `optimizeDeps.exclude` and `ssr.optimizeDeps.exclude`), so the
  plugin's `resolveId`/`load` interception of the SDK's internal
  `./auto-collected.js` import fires in dev the same way it already does
  under `vite build`. Fixes OSS-7 / #57.

## 0.0.20

### Patch Changes

- a4cd5ad: Add `@tanstack/intent` skill files for AI coding agents. Run `npx @tanstack/intent@latest install` to load OpenPolicy skills into your agent.

## 0.0.19

### Patch Changes

- 165ae2e: Add `thirdParty()` auto-collect support. Call `thirdParty(name, purpose, policyUrl)` next to the code that uses a third-party service; the `autoCollect` Vite plugin now scans these calls and populates the `thirdParties` sentinel exported from `@openpolicy/sdk`.
- 165ae2e: Add `usePackageJson` option to `autoCollect()` that cross-references `package.json` dependencies against a built-in registry of known npm packages (Stripe, Sentry, PostHog, Datadog, and ~12 others) to auto-populate `thirdParties` without requiring source-code annotations. Explicit `thirdParty()` calls always take precedence over auto-detected entries.

## 0.0.18

### Patch Changes

- 82e7df7: Add `autoCollected` sentinel to `@openpolicy/sdk` and new `@openpolicy/vite-auto-collect` Vite plugin that scans source files for `collecting()` calls and inlines the discovered categories into the sentinel at build time. Spread `autoCollected` into `dataCollected` in your `openpolicy.ts` — the plugin composes cleanly without requiring `@openpolicy/vite`.
