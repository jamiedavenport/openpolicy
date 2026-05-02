---
title: "The headless privacy stack — why we're heading there"
description: "The hosted-CMP era is ending the same way hosted payments did. Privacy is following the headless playbook — and that's why we're building OpenPolicy and OpenCookies the way we are."
pubDate: 2026-05-02
author: "OpenPolicy Team"
tags: ["philosophy"]
---

Every category that starts life as a hosted snippet eventually leaves it. Payments stopped looking like a PayPal button and started looking like Stripe Elements. Auth stopped looking like a vendor's login modal and started looking like Auth0 / Clerk primitives. Both moves went the same direction: the vendor keeps the hard parts, you keep the surface users see, and the wiring sits as a typed config in your repo.

Privacy is the next category to make that move. We're building OpenPolicy and OpenCookies on the assumption that it already has.

## The shape that wins

What the headless versions of payments and auth had in common was never a stack. It was a shape:

- The vendor owns the parts that are hard to get right — networking, cryptography, edge cases, the compliance state machine.
- You own the parts users actually see — your design system, your copy, your flow.
- The wiring is a typed config in your repo, reviewed in PRs like every other change.
- You don't pay for it in DOM weight or third-party scripts you didn't pick.

That shape wins because every team eventually overrides the hosted UI anyway. Once you're rebuilding the surface, the hosted version was just deadweight bundle and a network round-trip. The headless version was always the destination — the only question was how long the embed-snippet detour would last.

## Privacy is still on the detour

Most teams ship privacy the way they shipped payments in 2015. A third-party CMP script lives in `<head>`. A SaaS dashboard somewhere — usually not opened by an engineer — owns the categories, the clauses, and the publish button. The privacy page is a URL, not a file. The consent state machine that runs in every customer's browser is a black box you can't audit, can't version, and can't keep in sync with the rest of your code.

It works the same way embed-script payments worked: well enough to ignore until you can't. The day you can't is usually the day a vendor edge case ships into your product, the day a regulator asks for a precise version of your policy on a specific date, or the day the banner script becomes your slowest TTFB contribution and somebody finally measures it.

## Headless privacy has two jobs, not one

Privacy splits cleanly in half, and once you see the split it stops being surprising that "one tool that does everything" never worked:

- **Build time.** Turn a typed config into the policy document — the `/privacy` page, the `/cookies` page, the markdown for your docs, the structured record an auditor can read. Predictable, static, single-output. This is what OpenPolicy does.
- **Runtime.** Run a consent state machine in every visitor's browser. Persist decisions, sync across tabs, gate third-party scripts before they execute, respect Global Privacy Control, re-prompt when categories change. State, storage, jurisdiction, persistence. This is what OpenCookies does.

Both are headless. Both keep their source of truth in your repo. Neither ships a hosted dashboard. Neither asks you to render markup it picked.

## Composition, not bundling

The instinct when you have two projects this close is to merge them — one config, one install, one provider. We don't, and the reason matters.

OpenPolicy is build-time and gets settled by `defineConfig`. OpenCookies is runtime and gets settled by what visitors choose. The two are aligned in shape — the cookie categories you declare in `openpolicy.ts` are the same keys you'd hand to OpenCookies — but they aren't a single object. You wire them yourself, in a few lines:

```ts
import openpolicy from "@/openpolicy";

const cookieCategories = Object.entries(openpolicy.cookies.used).map(([key]) => ({
  key,
  label: openpolicy.cookies.context[key]?.label ?? key,
  locked: key === "essential",
}));
```

Pass `cookieCategories` into `<OpenCookiesProvider>` and your banner picks up whatever your `openpolicy.ts` already declares. Add or remove a category there and both the policy document and the banner follow.

The bridge being a few lines of your code instead of a generated import is the headless tax, and it's the right one to pay this early. Two projects moving at their own speed beat one project that froze a brittle contract on day one.

## Source-of-truth config beats a SaaS dashboard

The argument for [code-first policies](/blog/code-first) extends one-for-one to the runtime:

- `git blame` tells you who changed a category, when, and in which PR. Vendor dashboards have audit logs; they aren't tamper-evident the way a signed commit is.
- Code review catches policy changes before they ship, the same way it catches type errors. A toggle in a SaaS dashboard is reviewed by whoever happened to be logged in.
- Deletes propagate. Remove a third party from your code and the cookie category, the policy clause, and the banner copy go with it. In the dashboard world, retiring a vendor leaves an orphan checkbox nobody dares delete.
- Types catch mistakes before runtime. Misname a category in your config and the build fails. Misname it in a dashboard and you find out from a user.

There isn't a single one of those properties a hosted CMP can match without quietly becoming a code-first tool itself.

## The headless tax — and why it keeps shrinking

Headless has a real cost: you write your own banner. You style your own preferences panel. The vendor doesn't ship the markup for you. Two things keep making that cost smaller than the trade used to be.

**Every banner gets restyled anyway.** Whatever a vendor ships, you'd override it to match your design system. The "convenience" of a hosted banner is mostly a stylesheet you'd discard inside the first sprint.

**Coding agents collapse the rest.** A headless API is exactly the shape Claude Code, Cursor, and Copilot are good at generating from. Point an agent at `@opencookies/react`, ask it for a banner that looks like the rest of your app, and you'll get something usable on the first try. The tedious parts — storage, GPC, cross-tab sync, versioned re-consent, script gating — are already handled in the library. The styling is the part you (or your agent) actually want to own.

The headless tax is now mostly the part of the work you'd want to do anyway.

## Where this goes

The two projects will keep settling independently, and the bridge between them will keep getting shorter. The next step is closing the loop so the cookie categories declared in `openpolicy.ts` flow into OpenCookies without the manual map — same instinct as the build-time scanner that already populates `data.collected` and `thirdParties` from your source. Remove a vendor from your code and every trace of it should disappear from both the policy document and the banner.

Beyond that, the same shape extends to privacy primitives that don't have a good home yet — DSAR flows, deletion records, vendor-policy diffs. Each one wants to live in the same place: a typed config in your repo, a headless primitive in the library, your UI on top.

## Try it

Both projects are pre-1.0 and live in alpha. APIs will move; the shape is committed.

- OpenPolicy — [github.com/jamiedavenport/openpolicy](https://github.com/jamiedavenport/openpolicy)
- OpenCookies — [github.com/jamiedavenport/opencookies](https://github.com/jamiedavenport/opencookies)
- Docs — [docs.openpolicy.sh](https://docs.openpolicy.sh)

If you've shipped a banner on top of OpenCookies, a policy on top of OpenPolicy, or you tried to and hit something awkward — [open an issue](https://github.com/jamiedavenport/openpolicy/issues) or [book a call](https://cal.eu/jamie-openpolicy/openpolicy-chat-demo). The shape of the headless privacy stack is what we're settling right now, and it settles fastest with people building real things on it.
