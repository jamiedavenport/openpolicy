# `@openpolicy/sdk`

> TypeScript SDK for defining privacy and cookie policies as code.

Part of [OpenPolicy](https://openpolicy.sh) — a policy-as-code framework that compiles legal agreements from TypeScript at build time.

> **Not legal advice.** OpenPolicy generates policy documents from your config. It does not provide legal advice. Have a lawyer review your policies before publication. See the [legal notice](https://openpolicy.sh/legal-notice).

## Install

```sh
bun add @openpolicy/sdk
# or: npm install @openpolicy/sdk
```

## Usage

### Privacy policy

```ts
// openpolicy.ts
import { defineConfig } from "@openpolicy/sdk";

export default defineConfig({
	company: {
		name: "Acme",
		legalName: "Acme, Inc.",
		address: "123 Main St, San Francisco, CA 94105",
		contact: "privacy@acme.com",
	},
	privacy: {
		effectiveDate: "2026-01-01",
		dataCollected: {
			"Account information": ["Email address", "Display name"],
			"Usage data": ["Pages visited", "Session duration"],
		},
		legalBasis: "Legitimate interests and user consent",
		retention: {
			"Account data": "Until account deletion",
			"Analytics data": "13 months",
		},
		cookies: { essential: true, analytics: true, marketing: false },
		thirdParties: [
			{ name: "Vercel", purpose: "Hosting" },
			{ name: "Plausible", purpose: "Privacy-friendly analytics" },
		],
		jurisdictions: ["eu", "us-ca"],
	},
});
```

### Cookie policy

```ts
// cookies.config.ts
import { defineConfig } from "@openpolicy/sdk";

export default defineConfig({
	company: {
		name: "Acme",
		legalName: "Acme, Inc.",
		address: "123 Main St, San Francisco, CA 94105",
		contact: "privacy@acme.com",
	},
	cookie: {
		effectiveDate: "2026-01-01",
		cookies: { essential: true, analytics: true, marketing: false },
		jurisdictions: ["eu", "us-ca"],
	},
});
```

## Rendering policies

The SDK exports types and helper functions for _defining_ policies. To render them in your app, pair it with one of:

- **[`@openpolicy/react`](https://docs.openpolicy.sh)** — `<PrivacyPolicy />` / `<CookiePolicy />` components for React
- **[`@openpolicy/vue`](https://docs.openpolicy.sh)** — Vue 3 components
- **[`@openpolicy/vite`](https://docs.openpolicy.sh)** — Vite plugin that scans source for `collecting()` / `thirdParty()` annotations at build time
- **[`@openpolicy/cli`](https://docs.openpolicy.sh/cli)** — one-command project setup: installs the right packages, scaffolds a config, and prints a prompt for your coding agent

## Documentation

Full field reference and guides: [openpolicy.sh/docs](https://openpolicy.sh/docs)

## AI Agents

If you use an AI coding agent (Claude Code, Cursor, Copilot, etc.), run:

```sh
npx @tanstack/intent@latest install
```

This installs skill files that give your agent accurate, up-to-date guidance for OpenPolicy APIs.

## Links

- [GitHub](https://github.com/jamiedavenport/openpolicy)
- [openpolicy.sh](https://openpolicy.sh)
- [npm](https://www.npmjs.com/package/@openpolicy/sdk)
