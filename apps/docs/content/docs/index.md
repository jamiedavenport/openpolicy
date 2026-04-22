---
title: Introduction
description: What OpenPolicy is and why it exists
---

OpenPolicy generates privacy policies and cookie policies from TypeScript config files. Instead of maintaining documents manually or copying templates, you describe your actual data practices in code and OpenPolicy renders them as components inside your app.

## What you can do with it

- **Render as components** — drop `<PrivacyPolicy />` or `<CookiePolicy />` directly into your React or Vue app
- **Auto-collect** — scan your source for `collecting()` and `thirdParty()` annotations at build time so the policy stays in sync with the code
- **Add a cookie banner** — install the shadcn registry component for a consent-aware banner with a preferences panel

## Get set up in one command

```sh
bunx @openpolicy/cli init
```

The CLI installs the right packages for your stack, writes a starter `openpolicy.ts`, and prints a prompt you can paste into a coding agent (Claude Code, Cursor, etc.) to finish filling in your config from your codebase. See the [CLI page](/cli).

## Why policies-as-code

Policy documents go stale. When you add a new third-party service, change your data retention period, or expand to a new jurisdiction, a static document won't reflect that unless someone remembers to update it. With OpenPolicy, your policy config lives next to your codebase — it can be reviewed in PRs, diffed in git, and re-rendered any time something changes.
