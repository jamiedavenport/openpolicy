---
title: Cookie Banner
description: The CookieBanner component
---

See the [Quick Start](/cookies/quick-start) to add the banner to your app.

`CookieBanner` is the initial consent prompt shown to visitors who haven't made a consent choice yet. It offers three actions: accept all, accept necessary only, and open preferences.

```tsx
import { CookieBanner } from "@/components/ui/cookie-banner";

// Place inside <OpenPolicy> in your root layout
<CookieBanner />;
```

The banner reads available categories from your `openpolicy.ts` config and disappears once the user makes a choice.

## Reopening the banner

To let users revisit their consent decision — for example from a footer link — call `setRoute()` from the `useCookies()` hook:

```tsx
import { useCookies } from "@openpolicy/react";

function Footer() {
	const { setRoute } = useCookies();
	return <button onClick={() => setRoute("cookie")}>Cookie settings</button>;
}
```

## Props

No props required. All state is read from the nearest `<OpenPolicy>` provider.
