---
title: "Announcing OpenCookies"
description: "We've split the cookie banner, preferences panel, and consent runtime out of OpenPolicy into a sibling project: OpenCookies. Headless consent primitives, a much better fit for the problem, and still designed to compose with OpenPolicy."
pubDate: 2026-04-29
author: "OpenPolicy Team"
---

If you've been using OpenPolicy's cookie banner, the components have moved. They now live in a sibling project: [OpenCookies](https://github.com/jamiedavenport/opencookies). The tagline is **"Consent logic, not consent UI."** — and that's the whole shape of the change.

OpenPolicy keeps doing what it's good at: turning a typed config into a privacy policy and a cookie policy that can't drift from your code. The runtime side of consent — the banner, the preferences panel, `<ConsentGate>`, the storage layer — is now a project of its own with the room it needed.

## Why split a working thing?

The banner was working. That isn't the problem. The problem is that "compile a config into a document" and "run a consent state machine in the browser" are two different jobs with two different lifecycles, and bundling them was forcing compromises on each.

OpenPolicy is build-time. Its job is to be the source of truth for **what your product does**, expressed as a typed config that compiles into a document. Predictable, static, single-output.

A consent runtime is the opposite. It runs in every visitor's browser. It has to react to user choices, persist them, sync across tabs, respect Global Privacy Control, re-prompt when categories change, and gate third-party scripts before they execute. It's a state machine with storage adapters, framework hooks, and jurisdiction-aware defaults. None of that wanted to live next to the markdown renderer.

Trying to grow both inside one repo meant the parts of OpenCookies that needed to move quickly were tied to the release cadence of a doc-generation library, and the SDK kept accreting surface area that had nothing to do with policies. Splitting them lets each project have the API and the velocity it actually needs.

## What moved, what stayed

| Stays in OpenPolicy                                                  | Moved to OpenCookies (across React, Vue, Svelte, Solid)                          |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `<PrivacyPolicy />` and `<CookiePolicy />`                           | `<CookieBanner />` and `<CookiePreferences />`                                   |
| `defineConfig()` and the `@openpolicy/sdk` types                     | `useConsent()`, `useCategory(key)`, and the `createConsentStore()` core API      |
| `collecting()`, `thirdParty()`, `defineCookie()`                     | `<ConsentGate>` for component gating, `defineScript` + `gateScript` for vendor scripts |
| `@openpolicy/vite` auto-collect for `data` / `cookies` / `thirdParties` | Pluggable storage (localStorage / cookie / SSR / custom), cross-tab sync, GPC, jurisdiction resolvers, versioned re-consent |
| The compiled cookie *policy* (the legal document)                    | A Vite plugin that flags ungated cookie usage at build time                      |

The short version: OpenPolicy still owns the words on your `/privacy` and `/cookies` pages. OpenCookies owns the banner that decides what runs.

## They compose — you wire it yourself

One thing to be straight about: the two projects don't share a single config out of the box yet. OpenPolicy uses `cookies.used` / `cookies.context` inside `defineConfig`. OpenCookies takes a `categories` array. They're aligned in shape, not yet stitched together for you.

That's intentional for now. OpenCookies is finding its API, and we'd rather let the two projects settle independently than freeze a brittle bridge between them this early. In the meantime, you can wire it yourself in a few lines:

```ts
import openpolicy from "@/openpolicy";

const cookieCategories = Object.entries(openpolicy.cookies.used).map(
	([key]) => ({
		key,
		label: openpolicy.cookies.context[key]?.label ?? key,
		locked: key === "essential",
	}),
);
```

Pass `cookieCategories` into `<OpenCookiesProvider>` and the banner picks up whatever your `openpolicy.ts` already declares. Add or remove a category there and both the policy document and the banner follow. Closing the loop so this happens automatically is on the roadmap; the manual bridge is short enough that it shouldn't get in the way.

## What the new banner looks like

OpenCookies is headless — there are no styles, no DOM opinions, no markup you have to override. You wrap your app in a provider, read state with a hook, and render whatever you'd render anyway.

```tsx
import {
	ConsentGate,
	OpenCookiesProvider,
	useConsent,
} from "@opencookies/react";

const config = {
	categories: [
		{ key: "essential", label: "Essential", locked: true },
		{ key: "analytics", label: "Analytics" },
		{ key: "marketing", label: "Marketing" },
	],
};

export function Providers({ children }) {
	return (
		<OpenCookiesProvider config={config}>
			{children}
			<CookieBanner />
		</OpenCookiesProvider>
	);
}
```

A banner is whatever shape you want it to be:

```tsx
function CookieBanner() {
	const { route, acceptAll, acceptNecessary, setRoute } = useConsent();
	if (route !== "cookie") return null;

	return (
		<div className="fixed inset-x-0 bottom-0 border-t bg-background p-4">
			<p>We use cookies to improve your experience.</p>
			<div className="flex gap-2">
				<button onClick={acceptAll}>Accept all</button>
				<button onClick={acceptNecessary}>Necessary only</button>
				<button onClick={() => setRoute("preferences")}>Customise</button>
			</div>
		</div>
	);
}
```

And gating a feature on a category is a single component:

```tsx
<ConsentGate requires="functional">
	<LiveChatWidget />
</ConsentGate>
```

The widget mounts only when the user has granted `functional` consent and unmounts cleanly when it's revoked. `requires` accepts boolean expressions too — `{ and: ["analytics", "marketing"] }`, `{ or: [...] }`, `{ not: "..." }` — for features that depend on more than one category.

## Beyond `<ConsentGate>`

A lot has landed since the split. The headline pieces:

### `defineScript` for vendor scripts that queue calls

`<ConsentGate>` is the right tool when you control the markup. It's the wrong tool for vendor scripts like GA4, PostHog, or Meta Pixel — where your app code calls `dataLayer.push(...)` or `posthog.capture(...)` long before (and after) the script tag actually loads. Wrap the script in a gate and every call made before consent is granted just disappears.

`defineScript` and `gateScript` solve that. You declare the script and the globals it owns; OpenCookies installs a stub at each global before consent, queues every call your app makes, then replays them into the real client once consent is granted and the script loads. Revoke consent and it disposes cleanly.

```ts
import { defineScript } from "@opencookies/core";

export const ga4 = defineScript({
	id: "ga4",
	requires: "analytics",
	src: "https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX",
	queue: ["dataLayer.push"],
	init: () => {
		window.dataLayer = window.dataLayer || [];
		window.gtag = (...args) => window.dataLayer.push(args);
		window.gtag("js", new Date());
		window.gtag("config", "G-XXXXXXX");
	},
});
```

If you'd rather not write your own, `@opencookies/scripts` ships pre-built `defineScript` factories for the common ones — GA4, GTM, PostHog, Segment, Meta Pixel, Hotjar — each with sensible defaults you can override.

### Persistence is pluggable

Three storage adapters ship in the box and you can write your own. The default is `localStorage` with cross-tab sync, but you'll want one of the others for SSR or shared subdomains:

```ts
import { createConsentStore } from "@opencookies/core";
import { cookieStorage } from "@opencookies/core/storage/cookie";

const store = createConsentStore({
	categories,
	storage: cookieStorage({ domain: ".example.com", maxAge: "13 months" }),
});
```

`@opencookies/core/storage/server` reads request headers and emits `Set-Cookie` for header-based SSR (Next/Astro/Remix). Custom adapters implement `read` / `write` / `clear` / `subscribe` — useful if you want consent stored in a backend keyed to a user ID.

### Jurisdiction is a resolver

Consent rules aren't the same in Berlin and California, and OpenCookies doesn't pretend they are. Pick where the visitor's region comes from:

- `headerResolver()` — reads `cf-ipcountry` / `x-vercel-ip-country` on the edge.
- `timezoneResolver()` — derives jurisdiction from `Intl.DateTimeFormat` on the client.
- `manualResolver(jurisdiction)` — pin a value for tests or SSR.
- `clientGeoResolver({ endpoint })` — fetches from your own geo endpoint.

Categories can default differently per jurisdiction (consent-required in the EU, opt-out in California), GPC support can be scoped to the US states that legally require it via `GPC_LEGALLY_REQUIRED_JURISDICTIONS`, and `store.refreshJurisdiction()` re-resolves after navigation.

### Versioned re-consent

Stored decisions are pinned to your policy version, the visitor's jurisdiction, and the categories that existed at decide-time. Bump the policy or add a new category and the store fires `oncookies:reprompt` on `globalThis` — you decide whether to show the banner immediately, on next session, or never:

```ts
triggers: {
	policyVersionChanged: true,
	categoriesAdded: true,
	jurisdictionChanged: true,
	expiresAfter: "13 months",
}
```

The full record (`getConsentRecord()`) includes `decisions`, `policyVersion`, `decidedAt`, `jurisdiction`, `locale`, and `source` — enough to satisfy an audit without bolting on a separate consent log.

### Same shape across React, Vue, Svelte, and Solid

`<OpenCookiesProvider>`, `useConsent()` (composable in Vue, runes in Svelte, signals in Solid), `useCategory(key)`, and `<ConsentGate>` are exposed identically across all four adapters. The store and `defineScript` definitions live in `@opencookies/core` regardless of UI framework, so you can share consent code across a multi-framework monorepo without re-writing it.

## Why headless was the right call

Three reasons it earned its keep:

- **Every banner ends up restyled.** Whatever we shipped, you'd have to override it to match your design system. Owning the markup beats fighting an opinionated component you didn't pick.
- **It's tiny.** `@opencookies/core` is under 4kb gzipped. The framework adapters are smaller than that. There's no design-system payload riding along.
- **It made room for the runtime work.** `defineScript`, the storage adapters, the jurisdiction resolvers, and versioned re-consent are all things that didn't fit cleanly inside a doc-generation SDK. Splitting them out is what made shipping them possible.

## Headless doesn't mean DIY

"Headless" usually comes with a tax: you save on bundle size and design freedom, and you pay it back in afternoons of plumbing. We don't think that trade is necessary. OpenCookies still aims for the kind of DX where you're up and running in a few minutes — the hooks are small, the state machine is documented, and the routing between `cookie`, `preferences`, and `closed` states is something you read with `useConsent()` and react to in JSX. No reducers to build, no storage layer to wire, no GPC logic to write yourself.

It's also built to work well with coding agents. The components are plain markup with named hooks and stable props — exactly the shape Claude Code, Cursor, or Copilot are good at generating. Point an agent at `@opencookies/react`, ask it for a banner that matches your design system, and you'll get something that looks like the rest of your app on the first try. The tedious parts — consent storage, cross-tab sync, GPC, versioned re-prompts, script gating — are handled. The styling is the part you (or your agent) actually want to own.

## Try it

Pick the framework you're on:

```sh
npm install @opencookies/core @opencookies/react       # React
npm install @opencookies/core @opencookies/vue         # Vue
npm install @opencookies/core @opencookies/solid       # Solid
npm install @opencookies/core @opencookies/svelte      # Svelte
```

The full README, examples, and the Vite plugin live at [github.com/jamiedavenport/opencookies](https://github.com/jamiedavenport/opencookies). If you're already using the old OpenPolicy banner, the migration note at [docs.openpolicy.sh/cookies/overview](https://docs.openpolicy.sh/cookies/overview) walks through what to swap out.

---

OpenCookies lives at **[github.com/jamiedavenport/opencookies](https://github.com/jamiedavenport/opencookies)** — star it, fork it, file issues, send PRs. If you've shipped a banner on top of it, or you're trying to and hit something awkward, [open an issue](https://github.com/jamiedavenport/opencookies/issues) or [book a call](https://cal.eu/jamie-openpolicy/openpolicy-chat-demo). Both projects are pre-1.0 and we're shaping them in the open.
