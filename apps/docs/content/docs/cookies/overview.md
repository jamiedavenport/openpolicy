---
title: Overview
description: Consent-aware cookie banner for React apps
---

`@openpolicy/cookie-banner` is a shadcn registry component that adds a consent banner and preferences panel to your React app. It reads your cookie config from `openpolicy.ts` and stores consent decisions in `localStorage`.

See the [Quick Start](/cookies/quick-start) to get up and running.

## What's included

| Component               | Description                                   |
| ----------------------- | --------------------------------------------- |
| `<CookieBanner />`      | Initial consent prompt shown to new visitors  |
| `<CookiePreferences />` | Modal panel for updating consent per category |

Both components are driven by the `<OpenPolicy>` provider — no props required.

The `useCookies()` hook exposes the full consent state for building custom UIs or gating content programmatically.
