# Cookie Banner

## Requirements

- Prefer composition over render props
- Works seamlessly with shadcn/ui
- Include relevant data props such as `data-state=open/closed` so that it can be targeted by CSS/Tailwind

## Configuration

- Uses the same `openpolicy.ts` configuration file
- The same config that defines cookie categories and third parties drives both the banner **and** the generated cookie policy document — one source of truth

## OpenPolicy's take

Where OpenPolicy differs:

- **Unified**: one config produces the banner UI, the consent logic, *and* the compiled cookie policy document (HTML/Markdown/PDF).
- **Policy-linked**: the banner's "Learn more" / "Cookie Policy" link points to the auto-generated policy document.
- **Simpler default**: offline storage (browser cookie) works out of the box — no backend, no account, no tracking.
- **Vite-native**: the Vite plugin validates config at build time, not at runtime.
- **Composition-first**: compound components from day one, no wrapper component tax.

## Features

### Now

Core consent experience:

- **Compound components** — `CookieBanner`, `CookiePreferencePanel`, and `CookiePolicy` are each decomposed into named sub-components (`Root`, `Card`, `Overlay`, `Header`, `Title`, `Description`, `Footer`, `AcceptButton`, `RejectButton`, `CustomizeButton`, etc.) for full layout control without fighting a black-box
- **`useCookieConsent()` hook** — reactive consent state; returns `consent`, `status`, `accept`, `reject`, `update`, `reset`
- **4 built-in categories** — `essential` (always on), `analytics`, `functional`, `marketing`
- **Status model** — 4-state: `undecided` | `accepted` | `rejected` | `custom`
- **Offline storage** — consent persisted to `op_consent` browser cookie (JSON); no backend required
- **Data attributes** — `data-state="open/closed"` on banner/dialog root; `data-status` on body; `data-consent-{category}="true/false"` per category
- **Unstyled by default** — zero default styles; wire up Tailwind or shadcn/ui yourself
- **Cookie policy document generation** — `CookiePolicyConfig` compiles to HTML, Markdown, or PDF via `compileCookieDocument()`
- **React, Next.js, Vue** — React 19+ and Vue 3.5+ supported

### Soon

- **`has()` with boolean logic** — expressive consent checks: `has("analytics")`, `has({ and: ["analytics", "marketing"] })`, `has({ or: ["functional", "analytics"] })`, `has({ not: "marketing" })`; nestable
- **`<ConsentGate>`** — wrapper component that renders children only when consent is given for a category; falls back to a placeholder slot; replaces manual `has()` guards in JSX
- **Custom consent categories** — define arbitrary categories beyond the 4 built-ins; `CookiePolicyConfig.cookies` extended to accept dynamic keys; banner UI auto-expands
- **Astro integration** — `@openpolicy/astro` wraps the Vite plugin; server-side consent pre-check via cookie header
- **Scroll/focus lock** — `scrollLock` and `trapFocus` props on `CookieBanner.Root`; focus returns to trigger element on close
- **i18n** — pass a `translations` object to `CookieBanner.Root`; sensible English defaults; tree-shakable per-locale bundles planned

### Later

- **Geo-based jurisdiction detection** — show banner only when required (EU for GDPR, California for CCPA); driven by IP geolocation edge function or a `jurisdiction` prop override; `locationInfo` exposed from `useCookieConsent()`
- **Hosted consent storage** — opt-in backend adapter (`mode: "hosted"`) for server-side consent checks, audit logging, cross-subdomain sync, and consent history; uses cookies + localStorage in tandem for SSR
- **`identifyUser(id)`** — link a consent record to an authenticated user account; useful when consent must follow the user across devices
- **Custom storage adapters** — `storage` prop on provider accepts a `{ get, set, clear }` interface; enables Redis, Supabase, IndexedDB, etc.
- **SvelteKit, Solid, Qwik** — framework adapters following the same compound component pattern

## React API

### Components

#### `CookieBanner`

Renders only when `status === "undecided"`.

```tsx
// Minimal — all defaults
<CookieBanner />

// Composed
<CookieBanner.Root>
  <CookieBanner.Overlay />
  <CookieBanner.Card>
    <CookieBanner.Header>
      <CookieBanner.Title>We use cookies</CookieBanner.Title>
      <CookieBanner.Description>
        We use cookies to improve your experience.
      </CookieBanner.Description>
    </CookieBanner.Header>
    <CookieBanner.Footer>
      <CookieBanner.RejectButton />
      <CookieBanner.CustomizeButton onClick={() => setOpen(true)} />
      <CookieBanner.AcceptButton />
    </CookieBanner.Footer>
  </CookieBanner.Card>
</CookieBanner.Root>
```

**`CookieBanner.Root` props:**
| Prop | Type | Default | Description |
|---|---|---|---|
| `scrollLock` | `boolean` | `false` | Prevents page scroll until consent is given |
| `trapFocus` | `boolean` | `true` | Traps keyboard focus inside the banner |
| `disableAnimation` | `boolean` | `false` | Disables open/close transitions |

**Data attributes on `CookieBanner.Root`:**
- `data-state="open"` | `data-state="closed"` — drives CSS/Tailwind transitions
- `data-status="undecided"` | `"accepted"` | `"rejected"` | `"custom"`

#### `CookiePreferencePanel`

Granular per-category control. Typically opened via `CookieBanner.CustomizeButton`.

```tsx
<CookiePreferencePanel.Root open={open} onOpenChange={setOpen}>
  <CookiePreferencePanel.Overlay />
  <CookiePreferencePanel.Card>
    <CookiePreferencePanel.Header>
      <CookiePreferencePanel.Title>Manage preferences</CookiePreferencePanel.Title>
    </CookiePreferencePanel.Header>
    <CookiePreferencePanel.CategoryList>
      {/* Essential is rendered locked/disabled automatically */}
      <CookiePreferencePanel.Category name="analytics" />
      <CookiePreferencePanel.Category name="functional" />
      <CookiePreferencePanel.Category name="marketing" />
    </CookiePreferencePanel.CategoryList>
    <CookiePreferencePanel.Footer>
      <CookiePreferencePanel.RejectAllButton />
      <CookiePreferencePanel.SaveButton />
    </CookiePreferencePanel.Footer>
  </CookiePreferencePanel.Card>
</CookiePreferencePanel.Root>
```

**`CookiePreferencePanel.Root` props:**
| Prop | Type | Description |
|---|---|---|
| `open` | `boolean` | Controlled visibility |
| `onOpenChange` | `(open: boolean) => void` | Called on close |
| `trapFocus` | `boolean` | Default `true` |

**Data attributes on `CookiePreferencePanel.Root`:**
- `data-state="open"` | `data-state="closed"`

#### `CookiePolicy`

Renders the compiled cookie policy document inside your page layout.

```tsx
import config from "../openpolicy"
<CookiePolicy config={config} />
```

Accepts `OpenPolicyConfig` or `CookiePolicyConfig` directly. Renders sections as semantic HTML via the standard document renderer.

### Hooks

#### `useCookieConsent()`

```ts
const {
  consent,  // { essential: true, analytics: boolean, functional: boolean, marketing: boolean }
  status,   // "undecided" | "accepted" | "rejected" | "custom"
  accept,   // () => void — accept all non-essential categories
  reject,   // () => void — reject all non-essential, keep essential
  update,   // (Partial<CookieConsent>) => void — save custom preferences
  reset,    // () => void — clear consent cookie; banner reappears
} = useCookieConsent()
```

Uses `useSyncExternalStore` internally — safe for React concurrent mode and SSR. Cross-tab updates are propagated via a listener pattern.

**Soon:** `has()` will be added to the return value:

```ts
has("analytics")                              // boolean
has({ and: ["analytics", "functional"] })     // all must be true
has({ or: ["marketing", "analytics"] })       // at least one
has({ not: "marketing" })                     // negation
has({ and: ["functional", { not: "marketing" }] }) // nestable
```

## Styling

- Unstyled by default — no stylesheet is injected
- Styling via:
  - **Tailwind** — use `className` on any sub-component; combine with `data-state` variants (`data-[state=open]:animate-in`)
  - **shadcn/ui** — sub-components accept `asChild` (Radix slot pattern) so you can swap in shadcn `Button`, `Dialog`, `Card`, etc. with zero wrapper overhead
  - **CSS variables** — (later) a `theme` prop on `Root` for design-token overrides without custom components

Example with Tailwind:

```tsx
<CookieBanner.Root className="fixed bottom-4 left-4 right-4 z-50 data-[state=closed]:animate-out data-[state=open]:animate-in">
  <CookieBanner.Card className="rounded-lg border bg-background p-4 shadow-lg">
    ...
  </CookieBanner.Card>
</CookieBanner.Root>
```

### shadcn/ui

Sub-components accept `asChild`, which merges props onto the child element and renders it instead of the default wrapper. This lets you drop in shadcn primitives with no extra DOM nodes.

**Banner with shadcn Card + Button:**

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CookieBanner } from "@openpolicy/react"

export function Banner() {
  const [prefOpen, setPrefOpen] = useState(false)

  return (
    <>
      <CookieBanner.Root className="fixed bottom-4 right-4 z-50 max-w-sm data-[state=closed]:fade-out data-[state=open]:fade-in">
        <CookieBanner.Card asChild>
          <Card>
            <CardHeader>
              <CookieBanner.Title asChild>
                <CardTitle>We use cookies</CardTitle>
              </CookieBanner.Title>
              <CookieBanner.Description asChild>
                <CardDescription>
                  We use cookies to improve your experience and analyse site traffic.{" "}
                  <a href="/cookie-policy" className="underline underline-offset-2">Cookie policy</a>
                </CardDescription>
              </CookieBanner.Description>
            </CardHeader>
            <CardFooter className="gap-2">
              <CookieBanner.RejectButton asChild>
                <Button variant="ghost" size="sm">Reject</Button>
              </CookieBanner.RejectButton>
              <CookieBanner.CustomizeButton asChild onClick={() => setPrefOpen(true)}>
                <Button variant="outline" size="sm">Manage</Button>
              </CookieBanner.CustomizeButton>
              <CookieBanner.AcceptButton asChild>
                <Button size="sm">Accept all</Button>
              </CookieBanner.AcceptButton>
            </CardFooter>
          </Card>
        </CookieBanner.Card>
      </CookieBanner.Root>

      <PreferenceDialog open={prefOpen} onOpenChange={setPrefOpen} />
    </>
  )
}
```

**Preference panel with shadcn Dialog + Switch:**

```tsx
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { CookiePreferencePanel } from "@openpolicy/react"

const CATEGORIES = [
  { name: "analytics",   label: "Analytics",   description: "Help us understand how visitors use the site." },
  { name: "functional",  label: "Functional",   description: "Remember your preferences and settings." },
  { name: "marketing",   label: "Marketing",    description: "Personalise ads and measure their performance." },
] as const

export function PreferenceDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <CookiePreferencePanel.Root open={open} onOpenChange={onOpenChange}>
      <CookiePreferencePanel.Card asChild>
        <DialogContent>
          <CookiePreferencePanel.Header asChild>
            <DialogHeader>
              <CookiePreferencePanel.Title asChild>
                <DialogTitle>Manage cookie preferences</DialogTitle>
              </CookiePreferencePanel.Title>
            </DialogHeader>
          </CookiePreferencePanel.Header>

          <CookiePreferencePanel.CategoryList className="space-y-4 py-2">
            {/* Essential — always on, rendered locked */}
            <div className="flex items-center justify-between opacity-50">
              <Label>Essential</Label>
              <Switch checked disabled />
            </div>

            {CATEGORIES.map(({ name, label, description }) => (
              <CookiePreferencePanel.Category key={name} name={name} asChild>
                {({ checked, onCheckedChange }) => (
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label htmlFor={name}>{label}</Label>
                      <p className="text-xs text-muted-foreground">{description}</p>
                    </div>
                    <Switch
                      id={name}
                      checked={checked}
                      onCheckedChange={onCheckedChange}
                    />
                  </div>
                )}
              </CookiePreferencePanel.Category>
            ))}
          </CookiePreferencePanel.CategoryList>

          <CookiePreferencePanel.Footer asChild>
            <DialogFooter>
              <CookiePreferencePanel.RejectAllButton asChild>
                <Button variant="ghost">Reject all</Button>
              </CookiePreferencePanel.RejectAllButton>
              <CookiePreferencePanel.SaveButton asChild>
                <Button>Save preferences</Button>
              </CookiePreferencePanel.SaveButton>
            </DialogFooter>
          </CookiePreferencePanel.Footer>
        </DialogContent>
      </CookiePreferencePanel.Card>
    </CookiePreferencePanel.Root>
  )
}
```

## Persistence

**Default (offline):** Consent is stored as a JSON-serialised cookie named `op_consent` with a 1-year max-age. `essential` is always forced to `true`. Reading is synchronous — no flicker on mount.

```
op_consent={"essential":true,"analytics":false,"functional":true,"marketing":false}
```

**Soon:** localStorage mirror for cross-tab reactivity without polling.

**Later:** Hosted adapter — consent written to a managed or self-hosted backend (audit log, user identity linking, cross-subdomain sync via shared cookie domain). Opt-in via `mode="hosted"` on the provider with a `backendURL`.
