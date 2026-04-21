---
name: annotate-third-parties
description: >
  Mark third-party service dependencies in source code using thirdParty() so
  the openPolicy() Vite plugin can populate the thirdParties sentinel for the
  privacy policy config. Covers manual annotation, usePackageJson auto-detection
  from the KNOWN_PACKAGES registry, combining both approaches, and the Providers
  preset as a static alternative.
type: core
library: openpolicy
library_version: "0.0.19"
requires:
  - openpolicy/vite-setup
sources:
  - jamiedavenport/openpolicy:packages/sdk/src/third-parties.ts
  - jamiedavenport/openpolicy:packages/vite/src/known-packages.ts
---

This skill builds on openpolicy/vite-setup. Read it first.

## How It Works

`thirdParty()` is a **runtime no-op**. It is a build-time marker — `openPolicy()` scans source files statically via `oxc-parser` and extracts the three string literal arguments. The plugin then populates the `thirdParties` sentinel exported from `@openpolicy/sdk`. Without the plugin, `thirdParty()` calls have no effect whatsoever.

The populated sentinel must be spread into the top-level `thirdParties` field in the config file. Without the spread, the plugin output is discarded and the policy renders with no third parties listed.

## Setup

Three moving parts must all be in place:

**1. `vite.config.ts` — enable the plugin**

```ts
import { defineConfig } from "vite";
import { openPolicy } from "@openpolicy/vite";

export default defineConfig({
  plugins: [
    openPolicy({
      thirdParties: { usePackageJson: true }, // optional — see below
    }),
  ],
});
```

**2. Source file — annotate next to the usage**

```ts
import { thirdParty } from "@openpolicy/sdk";

// Place next to where you initialise or use the third-party SDK
thirdParty("Stripe", "Payment processing", "https://stripe.com/privacy");

// ... rest of your Stripe integration
```

**3. `openpolicy.ts` — spread the sentinel into config**

```ts
import { defineConfig, thirdParties } from "@openpolicy/sdk";

export default defineConfig({
  company: {
    name: "Acme",
    legalName: "Acme, Inc.",
    address: "123 Main St, San Francisco, CA 94105",
    contact: "privacy@acme.com",
  },
  effectiveDate: "2026-01-01",
  thirdParties: [...thirdParties],
});
```

## Core Patterns

### 1. Manual thirdParty() annotation

Call `thirdParty(name, purpose, policyUrl)` with three string literals next to wherever you initialise the third-party integration. All three arguments must be string literals — dynamic values are silently skipped by the static analyser.

```ts
import { thirdParty } from "@openpolicy/sdk";

// Correct: all string literals
thirdParty("Intercom", "Customer messaging", "https://www.intercom.com/legal/privacy");

// Wrong: variable — silently skipped at build time
const name = "Intercom";
thirdParty(name, "Customer messaging", "https://www.intercom.com/legal/privacy");
```

Deduplication is by `name` — the first occurrence wins when files are walked in sorted alphabetical order. Calling `thirdParty()` with the same name from multiple files is safe.

### 2. usePackageJson auto-detection

`openPolicy({ thirdParties: { usePackageJson: true } })` reads `package.json` at build time and cross-references every entry in `dependencies` and `devDependencies` against the built-in KNOWN_PACKAGES registry. Matched packages are merged into `thirdParties` automatically, with deduplication by service name.

This is the fastest way to cover common services (Stripe, Sentry, PostHog, Vercel, etc.) without any source annotations.

```ts
// vite.config.ts
openPolicy({ thirdParties: { usePackageJson: true } })
```

See [references/known-packages.md](references/known-packages.md) for the full list of ~30 auto-detected packages.

### 3. Combining both approaches

`thirdParty()` annotations and `usePackageJson` are merged at build time. The plugin deduplicates by service name — `thirdParty()` entries from source files are added first (sorted file order), then package.json detections fill in any remaining services not already seen.

Use this combination when:
- Most services are covered by the KNOWN_PACKAGES registry (`usePackageJson: true`)
- A few services are not in the registry and need explicit `thirdParty()` calls

```ts
// vite.config.ts
openPolicy({ thirdParties: { usePackageJson: true } })

// src/lib/custom-analytics.ts
import { thirdParty } from "@openpolicy/sdk";
thirdParty("Fathom Analytics", "Privacy-friendly web analytics", "https://usefathom.com/privacy");
```

```ts
// openpolicy.ts — one spread covers both sources
import { defineConfig, thirdParties } from "@openpolicy/sdk";

export default defineConfig({
  thirdParties: [...thirdParties],
});
```

### 4. Providers presets as a static alternative

`Providers` from `@openpolicy/sdk` is a collection of pre-filled third-party objects for common services. Use this when you want to declare third parties statically in `openpolicy.ts` without any source annotations or plugin scanning.

```ts
import { defineConfig, Providers } from "@openpolicy/sdk";

export default defineConfig({
  thirdParties: [
    Providers.Stripe,
    Providers.Sentry,
    Providers.Vercel,
    { name: "Custom Service", purpose: "Internal logging", policyUrl: "https://example.com/privacy" },
  ],
});
```

Available presets: `Stripe`, `Paddle`, `LemonSqueezy`, `PayPal`, `GoogleAnalytics`, `PostHog`, `Plausible`, `Mixpanel`, `Vercel`, `Cloudflare`, `AWS`, `Auth0`, `Clerk`, `Resend`, `Postmark`, `SendGrid`, `Loops`, `Sentry`, `Datadog`.

Note: when using `Providers` statically, you can still spread `thirdParties` alongside it to capture any additional auto-collected services:

```ts
thirdParties: [...thirdParties, Providers.Cloudflare],
```

## Common Mistakes

### HIGH — Using thirdParty() without the openPolicy() plugin and expecting a runtime effect

`thirdParty()` is defined as a no-op function that immediately returns `undefined`. It has no runtime behaviour. The only way it produces output in the policy is when `openPolicy()` is present in `vite.config.ts` and scans the file at build time.

```ts
// WRONG: calling thirdParty() and expecting it to affect the policy at runtime
import { thirdParty } from "@openpolicy/sdk";
thirdParty("Stripe", "Payment processing", "https://stripe.com/privacy");
// Without openPolicy() in vite.config.ts, this does nothing
```

```ts
// Correct: openPolicy() in vite.config.ts is the required prerequisite
// vite.config.ts
import { openPolicy } from "@openpolicy/vite";
export default defineConfig({ plugins: [openPolicy()] });

// src/lib/stripe.ts — scanned at build time by the plugin
import { thirdParty } from "@openpolicy/sdk";
thirdParty("Stripe", "Payment processing", "https://stripe.com/privacy");
```

### HIGH — Not spreading thirdParties sentinel into thirdParties

Even when `openPolicy()` scans the source and populates the sentinel, the populated value is discarded unless it is imported and spread into the top-level `thirdParties` field in the config. The privacy policy then renders with an empty third-party section, which may be legally invalid.

```ts
// WRONG: thirdParties not imported or spread
export default defineConfig({
  thirdParties: [], // static empty array, discards plugin output
});
```

```ts
// Correct
import { defineConfig, thirdParties } from "@openpolicy/sdk";

export default defineConfig({
  thirdParties: [...thirdParties],
  // or combine with static entries:
  // thirdParties: [...thirdParties, Providers.Cloudflare],
});
```

### MEDIUM — Not enabling usePackageJson when known packages are used

The KNOWN_PACKAGES registry covers ~30 common npm packages. Without `usePackageJson: true`, packages like `@sentry/browser`, `posthog-js`, or `@stripe/stripe-js` are not auto-detected and must each be annotated manually with `thirdParty()`. Enabling the option costs nothing and eliminates this annotation burden for any covered package.

```ts
// WRONG: usePackageJson not enabled — known packages not auto-detected
openPolicy()
```

```ts
// Correct
openPolicy({ thirdParties: { usePackageJson: true } })
```

## References

- [Known packages registry](references/known-packages.md) — full table of npm packages auto-detected by `usePackageJson: true`
- `packages/sdk/src/third-parties.ts` — thirdParty() implementation (runtime no-op)
- `packages/sdk/src/providers.ts` — Providers preset objects
- `packages/sdk/src/auto-collected.ts` — thirdParties sentinel definition
- `packages/vite/src/index.ts` — openPolicy() plugin, OpenPolicyOptions type
- `packages/vite/src/analyse.ts` — static AST extraction logic
- `packages/vite/src/known-packages.ts` — KNOWN_PACKAGES registry source
