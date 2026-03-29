---
title: Hooks
description: React hooks for reading and managing cookie consent state
---

See the [Quick Start](/cookies/quick-start) to get set up first.

## useCookies

The primary hook for working with consent state. Powers `CookieBanner`, `CookiePreferences`, and `ConsentGate` internally — use it directly when building custom UIs or gating content in application code.

```tsx
import { useCookies } from "@openpolicy/react";

const { route, categories, acceptAll, acceptNecessary, setRoute, has } = useCookies();
```

Must be called inside an `<OpenPolicy>` provider.

### Return value

| Property | Type | Description |
|---|---|---|
| `route` | `"cookie" \| "preferences" \| "closed"` | Which UI screen to show |
| `categories` | `{ key, label, enabled, locked }[]` | Consent categories from config |
| `acceptAll` | `() => void` | Enable all categories and close |
| `acceptNecessary` | `() => void` | Enable only essential categories and close |
| `toggle` | `(key: string) => void` | Toggle a category in the preferences panel |
| `save` | `() => void` | Persist current toggle state and close |
| `reject` | `() => void` | Disable all non-essential categories and close |
| `setRoute` | `(screen: "cookie" \| "preferences" \| "closed") => void` | Programmatically set which UI screen to show |
| `has` | `(expr: string \| ConsentExpr) => boolean` | Check consent for a category or expression |

### Consent storage

Decisions are stored in `localStorage` under `op_consent` as a map of category keys to booleans:

```json
{ "essential": true, "analytics": true, "marketing": false }
```

## ConsentGate

A component that renders its children only when the required consent is granted.

```tsx
import { ConsentGate } from "@openpolicy/react";

<ConsentGate requires="analytics">
  <GoogleAnalytics />
</ConsentGate>

<ConsentGate requires={{ and: ["analytics", "marketing"] }} fallback={<p>Consent required.</p>}>
  <RetargetingPixel />
</ConsentGate>
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `requires` | `string \| ConsentExpr` | — | Category key or `{ and }` / `{ or }` expression |
| `fallback` | `ReactNode` | `null` | Rendered when consent is not granted |
