---
title: Quick Start
description: Add policy pages to your React app in minutes
---

## Using shadcn (recommended)

Install a ready-to-use policy component from the OpenPolicy shadcn registry. This copies Tailwind-styled components into your project alongside a starter config.

```sh
# Privacy Policy
bunx shadcn@latest add @openpolicy/privacy-policy

# Cookie Policy
bunx shadcn@latest add @openpolicy/cookie-policy
```

Each command installs the component, a `policy-components.tsx` base renderer, and an `openpolicy.ts` starter config. Fill out the config then wrap your app with the `<OpenPolicy>` provider:

```tsx
import { OpenPolicy } from "@openpolicy/react";
import openpolicy from "@/openpolicy";

export default function RootLayout({ children }) {
	return <OpenPolicy config={openpolicy}>{children}</OpenPolicy>;
}
```

Then render the component on the relevant page:

```tsx
import { PrivacyPolicy } from "@/components/ui/openpolicy/privacy-policy";

export default function PrivacyPolicyPage() {
	return <PrivacyPolicy />;
}
```

## Manual

Install the packages:

```sh
bun add @openpolicy/react @openpolicy/sdk
```

Wrap your app with the provider, then render whichever components you need:

```tsx
import { OpenPolicy, PrivacyPolicy, CookiePolicy } from "@openpolicy/react";
import openpolicy from "@/openpolicy";

export function PrivacyPolicyPage() {
	return (
		<OpenPolicy config={openpolicy}>
			<PrivacyPolicy />
		</OpenPolicy>
	);
}
```

The components render unstyled by default. Pass a `components` prop to supply your own renderers for headings, paragraphs, lists, and links, or add the `style` prop for inline styles.
