---
title: Introduction
description: What OpenPolicy is and why it exists
---

OpenPolicy generates privacy policies, terms of service, and cookie policies from TypeScript config files. Instead of maintaining documents manually or copying templates, you describe your actual data practices in code and OpenPolicy produces accurate, up-to-date policy documents.

## What you can do with it

- **Compile to files** — generate Markdown, HTML, or PDF via the Vite plugin or CLI
- **Render as components** — drop `<PrivacyPolicy />`, `<TermsOfService />`, or `<CookiePolicy />` directly into your React or Vue app
- **Add a cookie banner** — install the shadcn registry component for a consent-aware banner with a preferences panel

## Why policies-as-code

Policy documents go stale. When you add a new third-party service, change your data retention period, or expand to a new jurisdiction, a static document won't reflect that unless someone remembers to update it. With OpenPolicy, your policy config lives next to your codebase — it can be reviewed in PRs, diffed in git, and regenerated any time something changes.
