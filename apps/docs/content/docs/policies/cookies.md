---
title: Cookie Policy
description: Generate and render a cookie policy from your openpolicy.ts config
---

See the [Quick Start](/policies/quick-start) to add a cookie policy page to your app.

Add cookie fields to your config — the cookie policy is auto-detected from the presence of fields like `cookies`, `consentMechanism`, and `trackingTechnologies`:

```ts
// openpolicy.ts
import { defineConfig, LegalBases } from "@openpolicy/sdk";

effectiveDate: "2026-01-01",
jurisdictions: ["eu", "us-ca"],
cookies: {
  used: {
    essential: true,
    analytics: true,
    functional: false,
    marketing: false,
  },
  lawfulBasis: {
    essential: LegalBases.LegalObligation,
    analytics: LegalBases.Consent,
    functional: LegalBases.Consent,
    marketing: LegalBases.Consent,
  },
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
```

`cookies.used` always requires `essential: true`; other keys are `boolean` and act as additional categories. Every key in `cookies.used` must have a matching Article 6 basis in `cookies.lawfulBasis` — `defineConfig` enforces this at type-check time, and the rendered "Cookies and Tracking" section appends the basis to each enabled category.

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
