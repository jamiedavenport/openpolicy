---
title: Terms of Service
description: Generate and render terms of service from your openpolicy.ts config
---

See the [Quick Start](/policies/quick-start) to add a terms of service page to your app.

Add a `terms` section to your config:

```ts
// openpolicy.ts
terms: {
  effectiveDate: "2026-01-01",
  acceptance: { methods: ["using the service", "creating an account"] },
  eligibility: { minimumAge: 13 },
  prohibitedUses: [
    "Violating any applicable laws or regulations",
    "Transmitting spam or malicious content",
  ],
  termination: {
    companyCanTerminate: true,
    userCanTerminate: true,
  },
  disclaimers: {
    serviceProvidedAsIs: true,
    noWarranties: true,
  },
  limitationOfLiability: {
    excludesIndirectDamages: true,
  },
  governingLaw: { jurisdiction: "Delaware, USA" },
  changesPolicy: {
    noticeMethod: "email or prominent notice on our website",
    noticePeriodDays: 30,
  },
},
```

Then render it:

```tsx
import { OpenPolicy, TermsOfService } from "@openpolicy/react";
import openpolicy from "@/openpolicy";

export function TermsPage() {
  return (
    <OpenPolicy config={openpolicy}>
      <TermsOfService />
    </OpenPolicy>
  );
}
```

