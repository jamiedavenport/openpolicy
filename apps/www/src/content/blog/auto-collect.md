---
title: "Your privacy policy should know what your code does"
description: "Annotate your data storage and third-party calls once. Auto-collect keeps your policy in sync automatically."
pubDate: 2026-04-13
author: "OpenPolicy Team"
tags: ["engineering", "announcement"]
---

The hardest part of a code-first policy isn't the initial setup. It's keeping it accurate.

You write your `openpolicy.ts`, fill in `data.collected`, list your third-party services, and ship. Six months later you've added Stripe, integrated PostHog, and started storing phone numbers. The policy still describes your product from launch day. Nothing warned you — it just drifted.

This is the version of the drift problem that no amount of "policies in code" solves on its own. As long as `data.collected` and `thirdParties` are fields you maintain by hand, they will go stale. It's not a discipline problem; it's a workflow problem. The signal is in the wrong place.

Auto-collect moves the signal to where the behaviour actually lives: the call site.

## Two mechanisms, one pipeline

`@openpolicy/vite` gives you two ways to declare what your app collects and which services it uses — both of which the build pipeline reads automatically when it compiles your policy.

**`collecting()`** — wrap your data storage calls to annotate what's being stored.

**`thirdParty()`** — declare a third-party integration at the point where you initialise the SDK.

There's also a zero-annotation path for common packages, covered below. But these two functions are the core of the system.

## `collecting()` — annotate at the point of storage

Somewhere in your app, you're writing data to a database. That's the right place to say what category it belongs to and what fields it includes. Not in a separate config file — right there, where the write happens.

Before:

```ts
export async function createUser(name: string, email: string) {
	return db.insert(users).values({ name, email });
}
```

After:

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

The three arguments are: the data category (appears as a section in your policy), the value to pass through, and a label record that names each field in plain English.

`collecting()` returns the value argument unchanged. Your existing call signature doesn't change. There's no wrapping type to thread through, no middleware to add, no runtime cost. You're just annotating a call that was already there.

The label record is also where you control what appears in the policy. If your insert includes `hashedPassword`, leave it out of the labels and it won't appear in the policy. The scan only surfaces what you explicitly name.

At build time, the plugin walks your source files, finds every `collecting()` call, extracts the category and labels, and merges them into the `data.collected` field of your policy config — before your `openpolicy.ts` is evaluated.

## `thirdParty()` — annotate at the integration point

Third-party services are the other half of the drift problem. You add an analytics provider, a payments SDK, a support widget — and the `thirdParties` array in your policy config stays unchanged until someone remembers to update it.

`thirdParty()` is a no-op at runtime. It exists purely as a declaration that the plugin reads at build time.

```ts
import { thirdParty } from "@openpolicy/sdk";
import { PostHog } from "posthog-js";

thirdParty("PostHog", "Product analytics", "https://posthog.com/privacy");
export const posthog = new PostHog(process.env.POSTHOG_KEY);
```

Put it right next to the SDK initialisation. The annotation and the usage live in the same file, so when someone removes the integration, the declaration goes with it. There's no separate manifest to update.

The plugin collects all `thirdParty()` calls across your codebase and merges them into `thirdParties` at build time.

## `usePackageJson` — zero-annotation detection

For common packages, you don't need to write `thirdParty()` calls at all.

Enable `usePackageJson: true` in the plugin config and the plugin reads your `dependencies` and `devDependencies` against a built-in registry of known services. If it finds a match, it populates the entry automatically.

```ts
// vite.config.ts
import { openPolicy } from "@openpolicy/vite";

export default defineConfig({
	plugins: [openPolicy({ thirdParties: { usePackageJson: true } })],
});
```

The registry covers services like Stripe, Sentry, PostHog, Datadog, Vercel Analytics, Intercom, and more — see the [full list in the docs](https://docs.openpolicy.sh/policies/auto-collect). If your `package.json` already has these as dependencies, your policy will include them without any annotations required.

Explicit `thirdParty()` calls always take precedence over auto-detected entries. If you need a custom description or privacy URL for a known package, annotate it directly and the registry entry is ignored.

## Setup

Install the plugin and add it to your Vite config:

```sh
bun add -D @openpolicy/vite
```

```ts
// vite.config.ts
import { openPolicy } from "@openpolicy/vite";

export default defineConfig({
	plugins: [openPolicy({ thirdParties: { usePackageJson: true } })],
});
```

## The policy that doesn't drift

In the [code-first post](/blog/code-first), the case for policies as code rested on one claim: a policy defined in your codebase updates when your product updates, because it's reviewed in the same PRs and tracked in the same git history.

Auto-collect makes that claim hold for the parts that matter most. The fields that most often go stale — what data you collect, which services have access to it — are now derived from the code directly. You don't have to remember to update `openpolicy.ts` when you add a new field to a user schema or integrate a new analytics provider. The build does it.

The discipline-based version of "keep your policy accurate" works until it doesn't. The annotation-based version works as long as the code does.

---

Full docs at [docs.openpolicy.sh/policies/auto-collect](https://docs.openpolicy.sh/policies/auto-collect). Examples in the [GitHub repo](https://github.com/jamiedavenport/openpolicy/tree/main/examples).

If you have feedback or ideas, [open an issue on GitHub](https://github.com/jamiedavenport/openpolicy/issues) — we read everything.

If you're integrating OpenPolicy and want a hand, [book a demo call](https://cal.eu/jamie-openpolicy/openpolicy-chat-demo) and we'd be happy to help.
