---
title: Quick Start
description: Add a cookie banner to your React app in minutes
---

## Using shadcn (recommended)

Install the cookie banner from the OpenPolicy shadcn registry. This copies `CookieBanner` and `CookiePreferences` components into your project alongside a starter config.

```sh
bunx shadcn@latest add @openpolicy/cookie-banner
bun add @openpolicy/react @openpolicy/sdk
```

Fill out the cookie-related fields in your `openpolicy.ts`, then wrap your app with the `<OpenPolicy>` provider and place the components in your root layout:

```tsx
import { OpenPolicy } from "@openpolicy/react";
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

## Manual

Install the packages:

```sh
bun add @openpolicy/react @openpolicy/sdk
```

Add cookie fields to your `openpolicy.ts` — the cookie policy is auto-detected from the presence of `cookies` and related fields:

```ts
effectiveDate: "2026-01-01",
jurisdictions: ["eu", "us-ca"],
cookies: {
  essential: true,
  analytics: true,
  functional: false,
  marketing: false,
},
consentMechanism: {
  hasBanner: true,
  hasPreferencePanel: true,
  canWithdraw: true,
},
```

Then build your own banner UI using the `useCookies()` hook:

```tsx
import { OpenPolicy, useCookies } from "@openpolicy/react";
import openpolicy from "@/openpolicy";

function Banner() {
	const { route, acceptAll, acceptNecessary, setRoute } = useCookies();
	if (route !== "cookie") return null;

	return (
		<div>
			<p>We use cookies to improve your experience.</p>
			<button onClick={acceptAll}>Accept all</button>
			<button onClick={acceptNecessary}>Accept necessary only</button>
			<button onClick={() => setRoute("preferences")}>Preferences</button>
		</div>
	);
}

export default function RootLayout({ children }) {
	return (
		<OpenPolicy config={openpolicy}>
			{children}
			<Banner />
		</OpenPolicy>
	);
}
```

See [Hooks](/cookies/hooks) for the full `useCookies()` API.
