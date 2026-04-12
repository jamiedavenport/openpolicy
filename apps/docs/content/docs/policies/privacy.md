---
title: Privacy Policy
description: Generate and render a privacy policy from your openpolicy.ts config
---

See the [Quick Start](/policies/quick-start) to add a privacy policy page to your app.

Add a `privacy` section to your config:

```ts
// openpolicy.ts
privacy: {
  effectiveDate: "2026-01-01",
  dataCollected: {
    "Account Information": ["Name", "Email address"],
    "Usage Data": ["Pages visited", "IP address"],
  },
  legalBasis: "Legitimate interests and consent",
  retention: {
    "Account data": "Until account deletion",
    "Usage logs": "90 days",
  },
  cookies: { essential: true, analytics: false, marketing: false },
  thirdParties: [],
  userRights: ["access", "erasure"],
  jurisdictions: ["us", "eu"],
},
```

The `dataCollected` and `thirdParties` fields can be populated automatically — see [Auto-collect](/policies/auto-collect).

Then render it:

```tsx
import { OpenPolicy, PrivacyPolicy } from "@openpolicy/react";
import openpolicy from "@/openpolicy";

export function PrivacyPolicyPage() {
  return (
    <OpenPolicy config={openpolicy}>
      <PrivacyPolicy />
    </OpenPolicy>
  );
}
```

