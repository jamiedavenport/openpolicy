---
"@openpolicy/sdk": patch
"@openpolicy/core": patch
"@openpolicy/vite": patch
"@openpolicy/cli": patch
"@openpolicy/react": patch
"@openpolicy/vue": patch
"@openpolicy/renderers": patch
---

**Breaking:** the cookie banner, preferences panel, and consent runtime have moved to a sibling project, **OpenCookies** (https://github.com/jamiedavenport/opencookies).

OpenPolicy still generates the cookie _policy_ (the legal document) — `<CookiePolicy>`, `defineCookie()`, and the `cookies.used` / `cookies.context` config keys are unchanged. Only the consent UI/runtime has been extracted.

Removed from `@openpolicy/react`:

- `useCookies()` hook
- `<ConsentGate>` component
- `useShouldShowCookieBanner()` hook
- The consent-tracking responsibilities of `<OpenPolicy>` — the provider is now a thin config-only context (mirrors `@openpolicy/vue`). Continue mounting `<OpenPolicy config={...}>` so `<PrivacyPolicy>` / `<CookiePolicy>` can read the config.

Removed from `@openpolicy/core`:

- `acceptAll()` / `rejectAll()` helpers
- `CookieConsent` and `CookieConsentStatus` types

The `ConsentMechanism` type and `consentMechanism` policy field are unchanged — they are informational policy content, not runtime.

Removed from `@openpolicy/vite`:

- The auto-collect scanner no longer recognises `<ConsentGate>` or `useCookies().has()` from `@openpolicy/react`. Declare cookie categories with `defineCookie()` instead. (When OpenCookies publishes its own Vite plugin, scanning targeted at its components can be reintroduced.)

Migration: install OpenCookies for banner/preferences/consent, keep using OpenPolicy for the cookie policy document.
