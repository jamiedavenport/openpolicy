---
title: Privacy Policy
description: Generate and render a privacy policy from your openpolicy.ts config
---

See the [Quick Start](/policies/quick-start) to add a privacy policy page to your app.

Add privacy fields to your config — the privacy policy is auto-detected from the presence of fields like `dataCollected`, `legalBasis`, and `retention`. User rights (access, erasure, portability, etc.) are derived automatically from your `jurisdictions`:

```ts
// openpolicy.ts
effectiveDate: "2026-01-01",
jurisdictions: ["us", "eu"],
dataCollected: {
  "Account Information": ["Name", "Email address"],
  "Usage Data": ["Pages visited", "IP address"],
},
legalBasis: ["legitimate_interests", "consent"],
retention: {
  "Account data": "Until account deletion",
  "Usage logs": "90 days",
},
thirdParties: [],
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

