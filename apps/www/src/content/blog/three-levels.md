---
title: "The three levels of OpenPolicy"
description: "Ship a policy on day one, keep it in sync as the product grows, and prove who consented to what once compliance risk gets real — without rewriting anything."
pubDate: 2026-04-22
author: "OpenPolicy Team"
---

Privacy work doesn't happen all at once. It starts when you launch and need a policy that isn't embarrassing, changes shape when the product starts moving faster than anyone can remember to update config, and changes shape _again_ when you have enough users that a regulator or auditor could credibly show up at the door.

OpenPolicy is built for all three moments. Here's what each level looks like, the scenario that makes it the right call, and what makes it worth graduating to the next one.

## Level 1 — You're launching and need something real on day one

You're about to ship. You have a footer with a "Privacy Policy" link pointing nowhere, and you need to fix that before launch. You don't want to paste an embed script from a compliance vendor, you don't want to copy-paste a template into a static route, and you definitely don't want to spend a week reading GDPR guidance.

Run the CLI once:

```sh
bunx @openpolicy/cli init
```

You end up with an `openpolicy.ts` at the root of your project, the matching React/Vue integration installed, and a prompt you can paste into Claude Code or Cursor to fill in the fields from your actual codebase.

The config is a plain TypeScript object:

```ts
// openpolicy.ts
import { ContractPrerequisite, defineConfig, LegalBases, Voluntary } from "@openpolicy/sdk";

export default defineConfig({
	company: {
		name: "Acme",
		legalName: "Acme, Inc.",
		address: "123 Main St, San Francisco, CA 94105",
		contact: "privacy@acme.com",
	},
	effectiveDate: "2026-01-01",
	jurisdictions: ["eu", "uk", "us-ca"],
	data: {
		collected: {
			"Account Information": ["Name", "Email address"],
			"Usage Data": ["Pages visited", "Features used"],
		},
		context: {
			"Account Information": {
				purpose: "To create and manage user accounts",
				lawfulBasis: LegalBases.Contract,
				retention: "Until account deletion",
				provision: ContractPrerequisite("We cannot create or operate your account."),
			},
			"Usage Data": {
				purpose: "To understand product usage and improve the service",
				lawfulBasis: LegalBases.LegitimateInterests,
				retention: "90 days",
				provision: Voluntary("None — your service is unaffected."),
			},
		},
	},
	thirdParties: [],
	cookies: {
		used: { essential: true, analytics: true, marketing: false },
		context: {
			essential: { lawfulBasis: LegalBases.LegalObligation },
			analytics: { lawfulBasis: LegalBases.Consent },
			marketing: { lawfulBasis: LegalBases.Consent },
		},
	},
	automatedDecisionMaking: [],
});
```

Drop the provider and the components into your root layout:

```tsx
import { OpenPolicy, PrivacyPolicy } from "@openpolicy/react";
import { CookieBanner, CookiePreferences } from "@/components/ui/cookie-banner";
import openpolicy from "@/openpolicy";

export default function RootLayout({ children }) {
	return (
		<OpenPolicy config={openpolicy}>
			{children}
			<CookieBanner />
			<CookiePreferences />
		</OpenPolicy>
	);
}
```

That's a real, rendered policy with the right GDPR, UK-GDPR, and CCPA supplements derived automatically from `jurisdictions`, plus a consent banner wired to the same config. No script tags, no third-party CDN, no vendor dashboard — the components live in your repo and render with the rest of your app.

It takes roughly an evening. It's enough for launch, and for quite a while after. You move on to Level 2 when you notice `openpolicy.ts` becoming the file nobody remembers to edit.

## Level 2 — The product is moving and the policy keeps drifting

Six months in, the product has gotten bigger. You've added Stripe, wired up PostHog, started storing phone numbers, and shipped a feature that uses an analytics script. Nothing broke — but when you re-read `openpolicy.ts`, it describes the product from launch day. Two of the three things your users care about (what data you collect, which services see it) are stale, and the banner still only lists `analytics` and `marketing` even though `functional` cookies are a thing now.

This is the drift problem, and it's a workflow problem, not a discipline one. The fix is to move the signal to where the behaviour actually lives. Add `@openpolicy/vite`:

```ts
// vite.config.ts
import { openPolicy } from "@openpolicy/vite";

export default defineConfig({
	plugins: [
		openPolicy({
			thirdParties: { usePackageJson: true },
			cookies: { usePackageJson: true },
		}),
	],
});
```

With `thirdParties: { usePackageJson: true }`, the plugin scans your `package.json` against a built-in registry of known services — Stripe, PostHog, Sentry, Intercom, Vercel Analytics, and more — and merges them into `thirdParties` at build time. You don't list them by hand.

With `cookies: { usePackageJson: true }`, the plugin does the same for cookie categories. Install `posthog-js` and `analytics` appears in your banner automatically. Install `@stripe/stripe-js` and `essential` is recorded. Remove the dependency and the category goes with it.

For data collection, annotate the call where the write happens:

```ts
import { collecting } from "@openpolicy/sdk";

export async function createUser(name: string, email: string) {
	return db
		.insert(users)
		.values(
			collecting("Account Information", { name, email }, { name: "Name", email: "Email address" }),
		);
}
```

`collecting()` returns its argument unchanged — no runtime cost, no wrapping type to thread through. At build time the plugin walks every file, finds these calls, and populates `dataCollected` before your config is evaluated.

For cookie categories the plugin can't infer from `package.json`, declare them at the call site too with `defineCookie()` where the category is first established.

You're still at the same surface area as Level 1 — one config file, the same components, the same output. The difference is that the parts most likely to go stale are now derived from code. The policy, the cookie banner, and the third-party list follow the product instead of trailing it.

Most teams are happy here for a long time. You move on to Level 3 when drift isn't the risk anymore — _proof_ is.

## Level 3 — Compliance risk is now a real number

You've got meaningful users. You've expanded into the EU or the UK. You're doing a SOC 2, a DPA with an enterprise customer is on the table, or a regulator has quietly started asking around. The question stops being "is the policy up to date?" and becomes "can you prove which user accepted which version, on which date, from which jurisdiction?"

`git log` is a great answer to "what did the policy say on March 3rd?" It's not an answer to "did user 8f3c accept that version, and when?" That's what OpenPolicy+ is for.

Install the client:

```sh
bun add @openpolicy/plus
```

```ts
import { client } from "@openpolicy/plus";

// Record that a user accepted the current version of your policy.
await client.consent("user_123");
```

Call `consent()` at signup, at key moments of intent (checkout, opting into a new feature), and again when a user reviews an updated policy. Each record is pinned to a hash of your current `defineConfig`, timestamped, and retained as a tamper-evident audit log you can export for legal, a DPA, or a regulator.

Because the hash changes when the config changes, you can also ask what's new for any given user:

```ts
const changes = await client.changes("user_123");
// [
//   { section: "data_retention", previous: "90 days", current: "30 days" },
//   { section: "third_party_sharing", previous: null, current: "We share data with..." }
// ]
```

`changes()` is jurisdiction-aware. A GDPR-only update doesn't show up for a user in California. A CCPA-only update doesn't show up for a user in Germany. You get exactly the diff that's relevant to each user, which is what makes targeted notification flows possible without the "re-consent to everything, every time" spam that trains users to dismiss your emails.

Wire those two calls into whatever flow fits the change — a banner on next login for small edits, a blocking modal for material ones, an email digest for users who rarely sign in. We walk through each pattern in [the update-flows post](/blog/building-update-flows).

## You don't have to pick up front

Each level adds to the previous without changing what came before. The same `openpolicy.ts` is the source of truth for the rendered policy at Level 1, the auto-synced config at Level 2, and the version-pinned consent records at Level 3. One file, three guarantees that escalate with the risk you're actually carrying.

Start with [the docs](https://docs.openpolicy.sh), or [book a demo](https://cal.eu/jamie-openpolicy/openpolicy-chat-demo) if you're already thinking about Level 3.
