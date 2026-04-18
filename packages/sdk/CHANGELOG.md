# @openpolicy/sdk

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
