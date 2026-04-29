---
title: "Legal pages as components, not scripts"
description: "OpenPolicy is on the shadcn registry. Install privacy policy and cookie policy components with a single command — code you own, styled with Tailwind."
pubDate: 2026-03-27
author: "OpenPolicy Team"
---

The old way: find a template, copy-paste the HTML, swap in your company name, commit it to a static route, and forget about it. Or paste an embed script from a compliance tool and depend on a third party's uptime forever. Either way, you own nothing.

The shadcn model flips that. You run a command, code lands in your repo, and it's yours. OpenPolicy takes it further — your privacy policy renders from your config, so when your product changes, you update one file and rebuild.

## Install

```sh
bunx shadcn@latest add @openpolicy/privacy-policy
```

That one command installs three registry items: `@openpolicy/config` (your starter `openpolicy.ts`), `@openpolicy/policy-components` (the primitive renderers), and `@openpolicy/privacy-policy` (the composed component). Registry dependencies resolve automatically — you don't need to install them separately.

All four available items:

- `@openpolicy/config` — starter `openpolicy.ts` config file
- `@openpolicy/policy-components` — 5 primitive render components (`PolicySection`, `PolicyHeading`, etc.)
- `@openpolicy/privacy-policy` — full privacy policy component
- `@openpolicy/cookie-policy` — full cookie policy component

Install the cookie policy the same way:

```sh
bunx shadcn@latest add @openpolicy/cookie-policy
```

## What you get

After install you'll have three things:

**`openpolicy.ts`** — a config starter at your project root:

```ts
import { defineConfig } from "@openpolicy/sdk";

export default defineConfig({
	company: {
		name: "Acme",
		legalName: "Acme, Inc.",
		address: "123 Main St, San Francisco, CA 94105",
		contact: { email: "legal@acme.com" },
	},
	effectiveDate: "2026-03-27",
	// ... fill in your data practices
});
```

**`components/ui/openpolicy/`** — Tailwind-styled primitive components (`PolicySection`, `PolicyHeading`, `PolicyParagraph`, `PolicyList`, `PolicyListItem`). Edit them like any other component in your project.

**`components/ui/privacy-policy.tsx`** — a ~28-line composed component that wires the primitives together:

```tsx
import { PrivacyPolicy as OpenPolicyPrivacy } from "@openpolicy/react";
import {
	PolicyHeading,
	PolicyList,
	PolicyListItem,
	PolicyParagraph,
	PolicySection,
} from "@/components/ui/openpolicy/policy-components";

const components = {
	Section: PolicySection,
	Heading: PolicyHeading,
	Paragraph: PolicyParagraph,
	List: PolicyList,
	ListItem: PolicyListItem,
};

export function PrivacyPolicy() {
	return <OpenPolicyPrivacy components={components} />;
}
```

## Wire it up

Two steps.

**1. Fill in your config.** Open `openpolicy.ts` and replace the placeholder values with your company name, contact email, effective date, and the data practices that apply to your product. The easiest way is to ask Claude to scan your codebase and fill it in — it can infer your data practices from your routes, integrations, and dependencies.

**2. Wrap with the `<OpenPolicy>` provider.** The registry installs the component but can't wire the context for you — that's a manual step. Import `OpenPolicy` from `@openpolicy/react` and pass your config as the `config` prop:

```tsx
import openpolicy from "@/lib/openpolicy";
import { OpenPolicy } from "@openpolicy/react";
import { PrivacyPolicy } from "@/components/ui/privacy-policy";

export default function PrivacyPolicyPage() {
	return (
		<main className="max-w-2xl mx-auto px-6 py-16">
			<OpenPolicy config={openpolicy}>
				<PrivacyPolicy />
			</OpenPolicy>
		</main>
	);
}
```

That's the complete setup. The provider reads your config and passes the compiled document tree down to the component.

## Why shadcn is the right distribution model

Embed scripts load legal content from an external CDN at runtime. That means a third-party DNS lookup on every page load, a flash of unstyled content while the widget initialises, and a hard dependency on someone else's uptime and pricing. You also can't change the markup or the styles — you get what they ship.

The shadcn model has none of those tradeoffs:

- **Code in your repo.** No external requests. No CDN dependency. The component works offline.
- **Tailwind classes you control.** Edit `policy-components.tsx` to match your design system. The registry is a starting point, not a constraint.
- **Full TypeScript types.** Props are typed end-to-end. Your editor autocompletes config fields; the compiler catches mistakes.
- **No vendor lock-in.** Once installed, the code is yours. You don't need OpenPolicy's infrastructure to render it.

## Extend it

The components are regular React. Override any renderer by passing a `components` prop directly:

```tsx
<PrivacyPolicy
	components={{
		Heading: ({ node }) => (
			<h2 className="text-3xl font-black tracking-tight mb-4">{node.value}</h2>
		),
	}}
/>
```

Add shadcn `Tooltip` to annotate headings with plain-English explanations — the `context.reason` field is attached to every heading the compiler generates.

For static generation, use the [Vite plugin](https://docs.openpolicy.sh/generative/vite) or CLI to output your policy as HTML, Markdown, or PDF — no React required.

## What's available

| Registry item                   | What it installs               |
| ------------------------------- | ------------------------------ |
| `@openpolicy/config`            | Starter `openpolicy.ts` config |
| `@openpolicy/policy-components` | 5 primitive render components  |
| `@openpolicy/privacy-policy`    | Full privacy policy component  |
| `@openpolicy/cookie-policy`     | Full cookie policy component   |

Start with whichever policy you need. The config and primitive components install automatically as dependencies of each policy component, so you only need one command.

Check the [docs](https://docs.openpolicy.sh) for the full config reference.
