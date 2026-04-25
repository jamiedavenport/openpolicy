---
title: Privacy Policy
description: Generate and render a privacy policy from your openpolicy.ts config
---

See the [Quick Start](/policies/quick-start) to add a privacy policy page to your app.

Add the `data` block to your config — the privacy policy is auto-detected from its presence. User rights (access, erasure, portability, etc.) are derived automatically from your `jurisdictions`:

```ts
// openpolicy.ts
import { defineConfig, LegalBases } from "@openpolicy/sdk";

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
  lawfulBasis: {
    "Account Information": LegalBases.Contract,
    "Usage Data": LegalBases.LegitimateInterests,
  },
  retention: {
    "Account Information": "Until account deletion",
    "Usage Data": "90 days",
  },
},
thirdParties: [],
automatedDecisionMaking: [],
```

Set `automatedDecisionMaking: []` to declare that you don't use automated decision-making or profiling (GDPR Art. 13(2)(f) / Art. 22). To declare activities, list each with `name`, `logic`, and `significance` — see [Configuration](/configuration#automated-decision-making-and-profiling).

The four sub-maps inside `data` (`collected`, `purposes`, `lawfulBasis`, `retention`) all share the same set of category keys. Every category in `data.collected` must appear in the other three — `defineConfig` enforces this at type-check time, and the `openPolicy()` Vite plugin re-validates it at build time. The renderer joins them into a single Article 13(1)(c) line per category: **Account Information** — used for [purpose] — [Article 6 basis]. With auto-collect, the plugin emits `openpolicy.gen.ts` alongside your config — commit it so the same constraint applies to scanned categories in CI.

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
