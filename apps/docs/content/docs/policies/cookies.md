---
title: Cookie Policy
description: Generate and render a cookie policy from your openpolicy.ts config
---

See the [Quick Start](/policies/quick-start) to add a cookie policy page to your app.

Add a `cookie` section to your config:

```ts
// openpolicy.ts
cookie: {
  effectiveDate: "2026-01-01",
  cookies: {
    essential: true,
    analytics: true,
    functional: false,
    marketing: false,
  },
  thirdParties: [
    {
      name: "Google Analytics",
      purpose: "Website analytics and performance monitoring",
      policyUrl: "https://policies.google.com/privacy",
    },
  ],
  consentMechanism: {
    hasBanner: true,
    hasPreferencePanel: true,
    canWithdraw: true,
  },
  jurisdictions: ["us", "eu"],
},
```

Then render it:

```tsx
import { OpenPolicy, CookiePolicy } from "@openpolicy/react";
import openpolicy from "@/openpolicy";

export function CookiePolicyPage() {
  return (
    <OpenPolicy config={openpolicy}>
      <CookiePolicy />
    </OpenPolicy>
  );
}
```

Looking to add a consent banner? See [Cookie Banner →](/docs/cookies).
