---
title: Privacy Policy
description: Generate and render a privacy policy from your openpolicy.ts config
---

See the [Quick Start](/policies/quick-start) to add a privacy policy page to your app.

Add privacy fields to your config — the privacy policy is auto-detected from the presence of fields like `data`, `legalBasis`, and `retention`. User rights (access, erasure, portability, etc.) are derived automatically from your `jurisdictions`:

```ts
// openpolicy.ts
effectiveDate: "2026-01-01",
jurisdictions: ["eu", "us-ca"],
data: {
  collected: {
    "Account Information": ["Name", "Email address"],
    "Usage Data": ["Pages visited", "IP address"],
  },
  purposes: {
    "Account Information": "To authenticate users and send service notifications",
    "Usage Data": "To understand product usage and improve the service",
  },
},
legalBasis: ["legitimate_interests", "consent"],
retention: {
  "Account data": "Until account deletion",
  "Usage logs": "90 days",
},
thirdParties: [],
```

Each key in `data.collected` must have a matching entry in `data.purposes` disclosing _why_ you process that category (GDPR Article 13(1)(c)). `defineConfig` enforces this at type-check time, and the `openPolicy()` Vite plugin re-validates it at build time. With auto-collect, the plugin emits `openpolicy.gen.ts` alongside your config — commit it so the same constraint applies to scanned categories in CI.

`data.collected` and `thirdParties` can also be populated automatically — see [Auto-collect](/policies/auto-collect).

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
