---
title: Cookie banner
description: The cookie banner and consent runtime now live in the OpenCookies project.
---

The cookie banner, preferences panel, and consent runtime previously shipped as part of OpenPolicy have moved to a sibling project: **OpenCookies**.

> [github.com/jamiedavenport/opencookies](https://github.com/jamiedavenport/opencookies)

OpenCookies and OpenPolicy are designed to work together: the same `cookies` config in your `openpolicy.ts` drives both the cookie _policy_ (the legal document) and the cookie _banner_ (the consent UI).

## What stayed in OpenPolicy

OpenPolicy still generates the **cookie policy** — the legal document describing the cookies your application uses. See [Policies → Cookie policy](/policies/cookies) for how to render it via `<CookiePolicy />`.

## What moved to OpenCookies

- The `<CookieBanner />` and `<CookiePreferences />` components.
- The `useCookies()` hook and `<ConsentGate>` component.
- Consent storage, cross-tab sync, and the `data-consent-*` body attributes.

For installation and usage, follow the OpenCookies repository.
