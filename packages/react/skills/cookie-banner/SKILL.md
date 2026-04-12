---
name: cookie-banner
description: >
  Cookie consent banner with useCookies hook, route state machine (cookie | preferences | closed), acceptAll, acceptNecessary, save, categories, toggle, ConsentGate conditional rendering, has expression DSL, localStorage persistence under op_consent key.
type: framework
library: openpolicy
framework: react
library_version: "0.0.19"
requires:
  - openpolicy/define-config
  - openpolicy/render-policies
sources:
  - jamiedavenport/openpolicy:packages/react/src/context.tsx
  - jamiedavenport/openpolicy:apps/www/registry/cookie-banner.tsx
---

This skill builds on openpolicy/define-config and openpolicy/render-policies. Read them first.

## Route State Machine

`useCookies()` exposes a `route` value that drives which UI to show:

```
"cookie"       — consent not yet given; show the banner
"preferences"  — user clicked "Manage"; show the preferences panel
"closed"       — consent resolved; render nothing
```

The provider sets `route` to `"cookie"` automatically when `status === "undecided"` (no prior consent in localStorage). Once the user acts (`acceptAll`, `acceptNecessary`, or `save`), the provider sets `route` to `"closed"`. `setRoute` lets you navigate between `"cookie"` and `"preferences"` manually.

## Setup

The following is a complete minimal implementation using plain divs and buttons — no UI library required.

### 1. Config — include a `cookie` section

```ts
// openpolicy.ts
import { defineConfig } from "@openpolicy/sdk";

export default defineConfig({
  company: {
    name: "Acme",
    legalName: "Acme, Inc.",
    address: "123 Main St, San Francisco, CA",
    contact: "privacy@acme.com",
  },
  cookie: {
    cookies: {
      essential: true,
      analytics: true,
      marketing: false,
    },
  },
});
```

### 2. Provider — wrap your app root

```tsx
// App.tsx
import { OpenPolicy } from "@openpolicy/react";
import config from "./openpolicy";
import { CookieBanner } from "./CookieBanner";
import { CookiePreferences } from "./CookiePreferences";

export function App() {
  return (
    <OpenPolicy config={config}>
      <CookieBanner />
      <CookiePreferences />
      {/* rest of app */}
    </OpenPolicy>
  );
}
```

### 3. Banner — gate on `route === "cookie"`

```tsx
// CookieBanner.tsx
import { useCookies } from "@openpolicy/react";

export function CookieBanner() {
  const { route, setRoute, acceptAll, acceptNecessary } = useCookies();

  if (route !== "cookie") return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "1rem",
        right: "1rem",
        padding: "1.5rem",
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "0.5rem",
        maxWidth: "24rem",
        zIndex: 50,
      }}
    >
      <p style={{ marginBottom: "1rem" }}>
        We use cookies to improve your experience and analyse site traffic.
      </p>
      <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
        <button onClick={() => setRoute("preferences")}>Manage Cookies</button>
        <button onClick={acceptNecessary}>Necessary Only</button>
        <button onClick={acceptAll}>Accept All</button>
      </div>
    </div>
  );
}
```

### 4. Preferences panel — toggle categories, then save

```tsx
// CookiePreferences.tsx
import { useCookies } from "@openpolicy/react";

export function CookiePreferences() {
  const { route, setRoute, categories, toggle, save, acceptNecessary } =
    useCookies();

  if (route !== "preferences") return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "2rem",
          borderRadius: "0.5rem",
          minWidth: "20rem",
        }}
      >
        <h2>Cookie preferences</h2>
        <p>Choose which cookies you allow.</p>

        <ul style={{ listStyle: "none", padding: 0 }}>
          {categories.map(({ key, label, enabled, locked }) => (
            <li
              key={key}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "0.5rem 0",
              }}
            >
              <span>{label}</span>
              <input
                type="checkbox"
                checked={enabled}
                disabled={locked}
                onChange={() => toggle(key)}
              />
            </li>
          ))}
        </ul>

        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
          <button onClick={acceptNecessary}>Reject All</button>
          <button onClick={() => save()}>Save Preferences</button>
        </div>
      </div>
    </div>
  );
}
```

## Core Patterns

### 1. Route-gated rendering

Always check `route` before rendering. Each component owns one route value and returns `null` for all others.

```tsx
// Banner owns "cookie"
if (route !== "cookie") return null;

// Preferences owns "preferences"
if (route !== "preferences") return null;
```

Navigating between them:

```tsx
// Open preferences from banner
<button onClick={() => setRoute("preferences")}>Manage Cookies</button>

// Close preferences without saving (returns to "closed", not back to "cookie")
<button onClick={() => setRoute("closed")}>Cancel</button>
```

### 2. Preferences panel with categories, toggle, and save

`categories` is derived from your config's `cookie.cookies` keys. Each entry:

```ts
type CookieCategory = {
  key: string;    // "essential" | "analytics" | "marketing" | ...
  label: string;  // human-readable, e.g. "Analytics"
  enabled: boolean;
  locked: boolean; // true for "essential" — cannot be toggled
};
```

`toggle(key)` updates local draft state without persisting. `save()` merges draft into localStorage and closes the banner. Until `save()` is called, the user's changes are not committed.

```tsx
{categories.map(({ key, label, enabled, locked }) => (
  <label key={key}>
    <input
      type="checkbox"
      checked={enabled}
      disabled={locked}
      onChange={() => toggle(key)}
    />
    {label}
  </label>
))}
<button onClick={() => save()}>Save</button>
```

### 3. ConsentGate — conditional rendering by consent

Wrap any content that should only appear when a category has consent:

```tsx
import { ConsentGate } from "@openpolicy/react";

// Simple category string
<ConsentGate requires="analytics">
  <AnalyticsDashboard />
</ConsentGate>

// Compound expression
<ConsentGate requires={{ and: ["analytics", "marketing"] }}>
  <RetargetingPixel />
</ConsentGate>

<ConsentGate requires={{ or: ["analytics", "functional"] }}>
  <EnhancedFeatures />
</ConsentGate>
```

`has()` from `useCookies()` evaluates the same `HasExpression` DSL imperatively:

```tsx
const { has } = useCookies();

// Load analytics script only when consent is given
useEffect(() => {
  if (has("analytics")) {
    loadAnalytics();
  }
}, [has]);
```

`HasExpression` type: `string | { and: HasExpression[] } | { or: HasExpression[] } | { not: HasExpression }`

### 4. shadcn registry shortcut

For a pre-styled banner and preferences panel that matches your shadcn/ui theme:

```sh
shadcn add @openpolicy/cookie-banner
```

This installs `CookieBanner` and `CookiePreferences` components using shadcn Card, Dialog, Switch, and Button primitives. The logic is identical to the manual implementation above — only the styling differs.

## Common Mistakes

### Mistake 1 — Not gating banner render on `route === "cookie"` (HIGH)

Without the route check the banner renders permanently, ignoring whether consent has already been given.

```tsx
// WRONG: renders always, no route check
function CookieBanner() {
  const { acceptAll, acceptNecessary } = useCookies();
  return <div>...</div>;
}

// Correct
function CookieBanner() {
  const { route, acceptAll, acceptNecessary } = useCookies();
  if (route !== "cookie") return null;
  return <div>...</div>;
}
```

### Mistake 2 — Building custom consent state with `useState` instead of `useCookies()` (HIGH)

Manual `useState` consent flags miss localStorage persistence, cross-tab sync, and the `document.body` `data-consent-*` attributes that `useCookies()` maintains automatically.

```tsx
// WRONG: custom state, no persistence or sync
const [accepted, setAccepted] = useState(false);
// manually writing to localStorage, missing cross-tab broadcast

// Correct: use the hook
const { status, acceptAll, acceptNecessary, has } = useCookies();
```

The provider writes consent under key `"op_consent"` in localStorage and syncs via `useSyncExternalStore` — all tabs sharing the same origin update simultaneously.

### Mistake 3 — Using `useCookies()` without `<OpenPolicy>` provider (HIGH)

Without the provider, `useCookies()` reads from the default context: `consent: null`, `categories: []`, `route: "closed"`. The banner never appears and the preferences panel renders no toggles. There is no thrown error — it fails silently.

```tsx
// WRONG: no provider
function App() {
  return <CookieBanner />;
}

// Correct: provider at root, banner and preferences inside it
function App() {
  return (
    <OpenPolicy config={config}>
      <CookieBanner />
      <CookiePreferences />
    </OpenPolicy>
  );
}
```
