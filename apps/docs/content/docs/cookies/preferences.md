---
title: Cookie Preferences
description: The CookiePreferences component
---

See the [Quick Start](/cookies/quick-start) to add preferences to your app.

`CookiePreferences` is a modal panel that lists each cookie category with a toggle. It opens when the user clicks "Preferences" in the banner, or when triggered programmatically.

```tsx
import { CookiePreferences } from "@/components/ui/cookie-banner";

// Place inside <OpenPolicy> in your root layout, alongside CookieBanner
<CookiePreferences />;
```

Categories marked `essential` are always enabled and their toggles are locked. All other categories can be toggled individually. Changes are not saved until the user clicks "Save preferences".

## Opening programmatically

```tsx
import { useCookies } from "@openpolicy/react";

function Footer() {
	const { setRoute } = useCookies();
	return <button onClick={() => setRoute("preferences")}>Cookie preferences</button>;
}
```

## Props

No props required. All state is read from the nearest `<OpenPolicy>` provider.
