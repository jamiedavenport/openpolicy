# @openpolicy/react

## 1.0.0

## 0.0.21

### Patch Changes

- 7dda430: Fix OSS-3: closing the cookie preferences dialog while consent is still
  undecided now keeps the banner visible. The context effect that reconciles
  `route` with visibility now also reacts to manual `setRoute("closed")` and
  restores `route = "cookie"` when consent hasn't been recorded.
  `useShouldShowCookieBanner` now synchronously returns `false` once status
  is no longer `"undecided"`, eliminating a one-commit lag.

## 0.0.20

### Patch Changes

- a4cd5ad: Add `@tanstack/intent` skill files for AI coding agents. Run `npx @tanstack/intent@latest install` to load OpenPolicy skills into your agent.

## 0.0.19

## 0.0.18

## 0.0.17

### Patch Changes

- efa565b: Cookie Banner

## 0.0.16

## 0.0.15

### Patch Changes

- 28b6b14: Fixes Jamie's mistakes

## 0.0.14

### Patch Changes

- 2372fdb: - Adds @openpolicy/react library.
  - Adds PDF renderer
- Updated dependencies [2372fdb]
  - @openpolicy/core@0.0.13
