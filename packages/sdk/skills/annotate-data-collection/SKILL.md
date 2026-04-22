---
name: annotate-data-collection
description: >
  Mark data collection points in source code with collecting(category, value,
  labels) so the openPolicy() Vite plugin can populate privacy.dataCollected
  automatically at build time via static AST analysis. All arguments must be
  string literals. Spread the dataCollected sentinel from @openpolicy/sdk into
  the config for plugin output to take effect.
type: core
library: openpolicy
library_version: "0.0.19"
requires:
  - openpolicy/vite-setup
sources:
  - jamiedavenport/openpolicy:packages/sdk/src/auto-collected.ts
  - jamiedavenport/openpolicy:packages/vite/src/analyse.ts
---

This skill builds on openpolicy/vite-setup. Read it first.

## How it works

`collecting(category, value, labels)` is a **pass-through at runtime** — it returns `value` unchanged. Its purpose is to serve as a static marker. During a Vite build, `openPolicy()` scans your source files using oxc-parser, finds every `collecting()` call, and merges the extracted category/label data into the `dataCollected` virtual module exported from `@openpolicy/sdk`.

The scanned data only reaches your policy config if you import the `dataCollected` sentinel and spread it into the top-level `dataCollected` field. Without the spread, all collected annotations are silently discarded.

**Critical constraint: every argument that the plugin reads must be a string literal.** The AST scanner does not evaluate expressions. Variables, template literals, and computed values are silently skipped with no warning.

## Setup

Install and wire `openPolicy()` first (see openpolicy/vite-setup). Then follow these three steps:

**Step 1 — Annotate a data collection point in your app code:**

```ts
// src/users/create.ts
import { collecting } from "@openpolicy/sdk";

export async function createUser(name: string, email: string) {
  return db.insert(users).values(
    collecting(
      "Account Information",          // category — must be a string literal
      { name, email },                // value — returned unchanged at runtime
      { name: "Name", email: "Email address" }, // labels — values must be string literals
    ),
  );
}
```

**Step 2 — Spread the sentinel into your config:**

```ts
// openpolicy.ts
import { defineConfig, dataCollected } from "@openpolicy/sdk";

export default defineConfig({
  company: {
    name: "Acme",
    legalName: "Acme, Inc.",
    address: "123 Main St, San Francisco, CA 94105",
    contact: "privacy@acme.com",
  },
  effectiveDate: "2026-01-01",
  dataCollected: {
    ...dataCollected,              // populated by openPolicy() at build time
    // add manually-tracked categories here if needed
  },
});
```

**Step 3 — Verify the plugin is active in vite.config.ts:**

```ts
// vite.config.ts
import { defineConfig } from "vite";
import { openPolicy } from "@openpolicy/vite";

export default defineConfig({
  plugins: [openPolicy()],
});
```

At build time, `openPolicy()` scans `src/` for `collecting()` calls and injects the result into the `dataCollected` sentinel before your config module is evaluated.

## Core Patterns

### 1. Basic annotation

Wrap the value you are storing at any data collection point. The third argument maps your field names to human-readable policy labels. Fields you omit from the label record are not included in the policy.

```ts
import { collecting } from "@openpolicy/sdk";

// Database insert
const row = collecting(
  "Contact Information",
  { email, phone },
  { email: "Email address", phone: "Phone number" },
);
await db.insert(contacts).values(row);

// Form submission
const payload = collecting(
  "Support Request",
  { subject, body, userId },
  { subject: "Subject line", body: "Message content" },
  // userId omitted — not included in the policy
);
```

### 2. Using DataCategories presets

`DataCategories` provides preset category names and label arrays aligned with common GDPR/CCPA categories. Use these to keep your annotations consistent with the generated policy text.

```ts
import { collecting, DataCategories } from "@openpolicy/sdk";

// DataCategories.AccountInfo = { "Account Information": ["Name", "Email address"] }
// Use the category string from the preset key
const user = collecting(
  "Account Information",
  { name, email },
  { name: "Name", email: "Email address" },
);

// DataCategories.SessionData = { "Session Data": ["IP address", "User agent", "Browser type"] }
const session = collecting(
  "Session Data",
  { ip, userAgent },
  { ip: "IP address", userAgent: "User agent" },
);
```

Available presets: `AccountInfo`, `SessionData`, `PaymentInfo`, `UsageData`, `DeviceInfo`, `LocationData`, `Communications`.

Note: `DataCategories` values are objects for spreading into `dataCollected` manually; the string keys are the category names to use in `collecting()` calls.

### 3. Spreading the sentinel into config

The sentinel must be spread with `...dataCollected` — not assigned directly. You can add manually-tracked categories alongside the auto-collected ones.

```ts
import { defineConfig, dataCollected } from "@openpolicy/sdk";

export default defineConfig({
  company: { /* ... */ },
  effectiveDate: "2026-01-01",
  jurisdictions: ["eu", "us-ca"],
  legalBasis: "legitimate_interests",
  dataCollected: {
    ...dataCollected,                              // auto-collected at build time
    "Analytics": ["Page views", "Click events"],  // manually declared
  },
});
```

## Common Mistakes

### MISTAKE 1 (HIGH) — Dynamic values in `collecting()` arguments

The plugin uses static AST analysis and only recognises string literal nodes. Any non-literal — a variable, template literal, or computed expression — causes the entire call to be silently skipped. No warning is emitted.

```ts
// WRONG: variable in category position — silently skipped
const category = "Account Information";
collecting(category, { name, email }, { name: "Name", email: "Email address" });

// WRONG: template literal — silently skipped
collecting(`${"Account"} Information`, { name, email }, { name: "Name", email: "Email address" });

// WRONG: dynamic label value — silently skipped
const label = "Email address";
collecting("Account Information", { name, email }, { name: "Name", email: label });
```

```ts
// CORRECT: every argument the plugin reads is a string literal
collecting(
  "Account Information",
  { name, email },
  { name: "Name", email: "Email address" },
);
```

The `value` argument (second position) is never read by the scanner and can be any expression.

### MISTAKE 2 (HIGH) — Not spreading `dataCollected` into the config

Even with `collecting()` calls throughout your codebase and `openPolicy()` wired up in Vite, the plugin output has no effect unless you import `dataCollected` from `@openpolicy/sdk` and spread it into the top-level `dataCollected` field. Without the spread the sentinel is an empty object `{}` and the policy compiles with no auto-collected data.

```ts
// WRONG: sentinel not imported or spread
export default defineConfig({
  dataCollected: {
    "Account Information": ["Email"],  // only manually-declared items appear
  },
});
```

```ts
// CORRECT: sentinel imported and spread
import { defineConfig, dataCollected } from "@openpolicy/sdk";

export default defineConfig({
  dataCollected: {
    ...dataCollected,                  // auto-collected entries merged here
    "Account Information": ["Email"],  // any manual additions
  },
});
```

### MISTAKE 3 (MEDIUM) — Calling `collecting()` with fewer than 3 arguments

The plugin requires all three positional arguments: `category`, `value`, and `labels`. Calls with fewer than 3 arguments are silently skipped by the scanner. There is no runtime error because `collecting()` is a pass-through — it still returns `value` — but the call is never recorded in the policy.

```ts
// WRONG: missing labels argument — silently skipped by plugin
collecting("Account Information", { name, email });

// WRONG: only one argument — silently skipped
collecting("Account Information");
```

```ts
// CORRECT: all three arguments present
collecting(
  "Account Information",
  { name, email },
  { name: "Name", email: "Email address" },
);
```
