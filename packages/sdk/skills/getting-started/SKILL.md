---
name: getting-started
description: >
  End-to-end setup for OpenPolicy: install @openpolicy/sdk, @openpolicy/react, and
  @openpolicy/vite; create openpolicy.ts with defineConfig(); wire openPolicy()
  into vite.config.ts; wrap the React app with <OpenPolicy>; render <PrivacyPolicy>.
type: lifecycle
library: openpolicy
library_version: "0.0.19"
sources:
  - jamiedavenport/openpolicy:packages/sdk/README.md
  - jamiedavenport/openpolicy:packages/react/src/context.tsx
  - jamiedavenport/openpolicy:packages/vite/src/index.ts
---

## Setup

Install packages:

```sh
bun add @openpolicy/sdk @openpolicy/react @openpolicy/vite
```

Create `openpolicy.ts` at the project root:

```ts
import { defineConfig, dataCollected, thirdParties } from "@openpolicy/sdk";

export default defineConfig({
	company: {
		name: "Acme",
		legalName: "Acme, Inc.",
		address: "123 Main St, San Francisco, CA 94105",
		contact: "privacy@acme.com",
	},
	effectiveDate: "2026-01-01",
	dataCollected: {
		...dataCollected,
		"Account Information": ["Email address", "Display name"],
	},
	thirdParties: [...thirdParties],
});
```

Add `openPolicy()` to `vite.config.ts` — it must appear before any React plugin:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { openPolicy } from "@openpolicy/vite";

export default defineConfig({
	plugins: [openPolicy({ thirdParties: { usePackageJson: true } }), react()],
});
```

Wrap the application root with `<OpenPolicy>`:

```tsx
// main.tsx or _app.tsx or layout.tsx
import { OpenPolicy } from "@openpolicy/react";
import config from "./openpolicy";

export function App({ children }: { children: React.ReactNode }) {
	return <OpenPolicy config={config}>{children}</OpenPolicy>;
}
```

Render a policy page:

```tsx
import { PrivacyPolicy } from "@openpolicy/react";

export default function PrivacyPage() {
	return <PrivacyPolicy />;
}
```

Components ship unstyled and emit `data-op-*` attributes. Hook Tailwind or your own CSS onto `data-op-policy`, `data-op-heading`, `data-op-section`, `data-op-paragraph`, `data-op-list` to theme them.

## Core Patterns

### Mark data collection inline with `collecting()`

```ts
import { collecting } from "@openpolicy/sdk";

// Call next to the point of collection; openPolicy() scans for these at build time
export async function createUser(name: string, email: string) {
	const user = collecting(
		"Account Information",
		{ name, email },
		{ name: "Display name", email: "Email address" },
	);
	return db.users.create(user);
}
```

The category and label arguments must be string literals — dynamic variables are silently skipped by the static scanner.

### Mark third-party integrations with `thirdParty()`

```ts
import { thirdParty } from "@openpolicy/sdk";

// Place next to the integration's initialisation
thirdParty("Stripe", "Payment processing", "https://stripe.com/privacy");
```

The `openPolicy({ thirdParties: { usePackageJson: true } })` option also auto-detects ~30 known packages (Stripe, Sentry, PostHog, etc.) from `package.json`.

### Spread both sentinels in `openpolicy.ts`

```ts
import { defineConfig, dataCollected, thirdParties } from "@openpolicy/sdk";

export default defineConfig({
	company: {
		name: "Acme",
		legalName: "Acme, Inc.",
		address: "123 Main St, San Francisco, CA 94105",
		contact: "privacy@acme.com",
	},
	effectiveDate: "2026-01-01",
	dataCollected: {
		...dataCollected, // populated by openPolicy() at build time
		"Manual Category": ["Manually added field"], // additional hand-declared entries
	},
	thirdParties: [...thirdParties], // populated by openPolicy() at build time
});
```

Both `dataCollected` and `thirdParties` are placeholder objects in `@openpolicy/sdk`; `openPolicy()` replaces them via virtual module injection during the Vite build.

## Common Mistakes

### HIGH: Rendering policy components without `<OpenPolicy>` provider

Wrong:

```tsx
// privacy-page.tsx
import { PrivacyPolicy } from "@openpolicy/react";

export default function PrivacyPage() {
	return <PrivacyPolicy />;
}
```

Correct:

```tsx
// layout.tsx — wrap at the root
import { OpenPolicy } from "@openpolicy/react";
import config from "./openpolicy";

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return <OpenPolicy config={config}>{children}</OpenPolicy>;
}

// privacy-page.tsx — component reads from context
import { PrivacyPolicy } from "@openpolicy/react";

export default function PrivacyPage() {
	return <PrivacyPolicy />;
}
```

`PrivacyPolicy` and `CookiePolicy` read config from React context; without the provider they silently render `null` with no visible error.

Source: packages/react/src/context.tsx

---

### HIGH: Not spreading `dataCollected` and `thirdParties` sentinels into config

Wrong:

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
	effectiveDate: "2026-01-01",
	dataCollected: { "Account Information": ["Email address"] },
	thirdParties: [],
});
```

Correct:

```ts
// openpolicy.ts
import { defineConfig, dataCollected, thirdParties } from "@openpolicy/sdk";

export default defineConfig({
	company: {
		name: "Acme",
		legalName: "Acme, Inc.",
		address: "123 Main St, San Francisco, CA 94105",
		contact: "privacy@acme.com",
	},
	effectiveDate: "2026-01-01",
	dataCollected: { ...dataCollected, "Account Information": ["Email address"] },
	thirdParties: [...thirdParties],
});
```

Without spreading the sentinels, `openPolicy()` plugin output is discarded and the policy compiles with only the hand-declared entries — all `collecting()` and `thirdParty()` call annotations are silently ignored.

Source: packages/sdk/src/auto-collected.ts
