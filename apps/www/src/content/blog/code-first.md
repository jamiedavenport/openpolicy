---
title: "Why we're betting on a code-first approach to privacy"
description: "Most apps treat privacy policies as an afterthought. Here's why shipping them as code changes everything."
pubDate: 2026-03-26
author: "OpenPolicy Team"
---

Legal pages are always an afterthought. An embed script from a compliance tool pasted into your `<head>`, a PDF from a lawyer dropped into an S3 bucket, or a static HTML page copy-pasted from a template and never touched again. It works — until your product changes and nobody updates it.

That's the problem OpenPolicy is trying to fix.

## The usual approach

There are two dominant patterns, and both have the same root issue: the policy is disconnected from the product.

**Embed scripts** — services like iubenda, Termly, and Osano give you a snippet to paste into your site. They manage the policy on their end; you display it via an external JS request. You get something live quickly, but the tradeoffs compound over time: extra DNS lookups, a flash of unstyled content while the widget loads, generic boilerplate you can't control, and a dependency on a third party's uptime and pricing.

**Static copy-paste** — a wall of legalese from a template, dropped into a markdown file or hardcoded into a route, committed once and forgotten. It's technically correct at the moment you ship it. Six months later, you've added Stripe, integrated an analytics provider, and launched in the EU. The policy still says what it said on day one.

Both approaches share the same problem: there's no forcing function to keep the policy current. It's not part of the development workflow, so it doesn't get updated when the product does.

## What code-first means

With OpenPolicy, you define your policy as a TypeScript object and render it directly into your app — as React components, a static page, or a Markdown file — using the same tools and workflow as the rest of your codebase.

```ts
// openpolicy.ts
import { defineConfig } from "@openpolicy/sdk";

export default defineConfig({
  company: {
    name: "Acme",
    legalName: "Acme, Inc.",
    contact: "legal@acme.com",
  },
  privacy: {
    dataCollected: {
      "Account Information": ["Full name", "Email address"],
      "Usage Data": ["Pages visited", "Feature usage"],
    },
    userRights: ["access", "erasure", "portability"],
    jurisdictions: ["us", "eu"],
  },
});
```

That config compiles to a structured document tree. From there you can render a `<PrivacyPolicy />` component directly into your Next.js or TanStack app, generate static Markdown for your docs site, or produce PDF output via the CLI. One source of truth, multiple outputs.

## Faster to set up, no external dependencies

Getting a policy live with OpenPolicy is one `bun add` and a config file. No embed snippet to manage, no third-party account to create, no external JS request on every page load.

```sh
bun add @openpolicy/sdk @openpolicy/react
```

Because the policy renders from your own code, it loads with the rest of your app. No FOUC from a widget that hasn't loaded yet. No DNS lookup to an external service. No dependency on anyone else's uptime.

`@openpolicy/react` is [6.56 KB gzipped](https://bundlephobia.com/package/@openpolicy/react@0.0.16) with zero bundled dependencies — react and react-dom are peer deps you already have. Contrast that with a third-party embed that loads its own runtime, fonts, and stylesheet from an external CDN on every page view.

## Your product moves fast. Your policy should too.

AI-assisted development is shipping features at a pace that the traditional "update your ToS every few years" model wasn't designed for. Teams are integrating new data sources, adding AI-powered features, and expanding into new markets on timescales that used to take years.

A static policy can't keep up with that pace. But a policy defined in code can.

When you ship a new feature that touches user data, the policy update goes in the same PR. When you add an analytics provider, the `dataCollected` field gets updated alongside the integration. Compliance becomes part of the development loop, not a annual scramble before an audit.

## Full audit trail, PR-based review

With policies defined in code, every change goes through the same review process as the rest of your codebase. `git log` shows the full history of every clause. `git blame` tells you who changed it, when, and in which PR — the same as any other file.

That auditability matters more than it sounds. If you're ever asked to demonstrate that your policy was accurate on a particular date — by a regulator, an auditor, or a data subject request — you have a precise, tamper-evident record. With a static page or a third-party embed, you have nothing.

In **[OpenPolicy+](/plus)**, we're taking this further with a PR bot that reviews policy changes automatically before they reach production. It flags missing required fields, detects jurisdiction mismatches, and surfaces clauses that may need legal review — directly in the PR, before anything ships. The same way a linter catches type errors before code review, the bot catches compliance issues before the policy goes live.

## Privacy is a trust opportunity, not a checkbox

The way most apps handle privacy signals one thing to users: we did the minimum required. A generic embed widget or a wall of lawyer-drafted legalese is a missed opportunity.

Code-first gives you control over how the policy is presented. You can render it in your own design system, match your brand typography, and add plain-English annotations to legal clauses using the `context.reason` field that OpenPolicy attaches to every section it compiles. A heading like "Limitation of Liability" can surface a tooltip that says "This caps our legal exposure under standard US commercial contracts" — without changing the legal text itself.

Users who understand your data practices are more likely to consent, more likely to trust you with more, and less likely to file support tickets asking "what did I agree to?" Trust compounds. Generic boilerplate doesn't help it.

## Gate features based on the consent users have actually given

Because your policy is structured data, you can wire it directly into your product's behaviour.

Instead of a binary "agreed to terms" flag in your database, you can model consent granularly: analytics on or off, marketing emails opted in or out, data sharing enabled or disabled. The policy and the product are no longer disconnected — they can enforce each other.

A user who hasn't consented to analytics shouldn't have analytics running. With policies as code, you have the structured data to make that check. With an embed script or a static page, you don't.

## Build experiences, not just documents

The policy component API is fully composable. You can override any renderer — headings, paragraphs, sections, lists — and plug in your own design system or behaviour. The policy stops being a page you link to in a footer and starts being a part of your product.

- Add `Tooltip` annotations to every legal clause so users understand what they're agreeing to — [here's how to do it with shadcn](/blog/shadcn-terms)
- Render cookie banners and consent modals driven by the same config
- Build a legal chatbot that answers plain-English questions about your policy using the compiled Markdown as context — [see the full walkthrough](/blog/legal-chatbot-ai-sdk)

All of it comes from the same config object. Change the config, and every output updates.

## Policies aren't a liability. They're leverage.

A policy that lives outside your codebase is debt. It was accurate on the day someone pasted it in, and has been drifting from reality ever since — quietly, until it isn't.

A policy defined in code is accurate by construction. It updates when your product updates, it's reviewed when your code is reviewed, and it can be audited at any point in its history. That's not just safer — it's a foundation for building real trust with your users.

Get started with the [docs](/docs) or browse the [examples on GitHub](https://github.com/jamiedavenport/openpolicy/tree/main/examples) to see it working end to end.
