---
"@openpolicy/react": patch
---

Fix OSS-3: closing the cookie preferences dialog while consent is still
undecided now keeps the banner visible. The context effect that reconciles
`route` with visibility now also reacts to manual `setRoute("closed")` and
restores `route = "cookie"` when consent hasn't been recorded.
`useShouldShowCookieBanner` now synchronously returns `false` once status
is no longer `"undecided"`, eliminating a one-commit lag.
