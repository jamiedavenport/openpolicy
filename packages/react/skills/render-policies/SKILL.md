---
name: render-policies
description: >
  Render OpenPolicy privacy and cookie policy documents as
  React components using @openpolicy/react. Components — PrivacyPolicy,
  CookiePolicy — read config from the OpenPolicyProvider
  (alias OpenPolicy) context and accept optional config and components props
  for per-page overrides and full rendering customization via PolicyComponents.
type: framework
library: openpolicy
framework: react
library_version: "0.0.19"
requires:
  - openpolicy/define-config
sources:
  - jamiedavenport/openpolicy:packages/react/src/context.tsx
  - jamiedavenport/openpolicy:packages/react/src/render.tsx
  - jamiedavenport/openpolicy:packages/react/src/types.ts
---

This skill builds on openpolicy/define-config. Read it first.

## Setup

Install the package:

```sh
bun add @openpolicy/react
```

Wrap your app with the provider, import styles, and render a policy page:

```tsx
// layout.tsx (or _app.tsx)
import '@openpolicy/react/styles.css';
import { OpenPolicy } from '@openpolicy/react';
import config from './openpolicy';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <OpenPolicy config={config}>
      {children}
    </OpenPolicy>
  );
}
```

```tsx
// app/privacy/page.tsx
import { PrivacyPolicy } from '@openpolicy/react';

export default function PrivacyPage() {
  return <PrivacyPolicy />;
}
```

## Core Patterns

### 1. Provider at app root

`OpenPolicyProvider` (exported as `OpenPolicy`) must wrap the entire application. All policy components and hooks read from this context.

```tsx
import { OpenPolicy } from '@openpolicy/react';
import config from './openpolicy';

<OpenPolicy config={config}>
  <App />
</OpenPolicy>
```

`config` must be an `OpenPolicyConfig` (the nested shape produced by `defineConfig()`). The provider also injects default styles via a React `<style>` tag, so the CSS import is optional when using the provider — but import it explicitly for non-provider rendering paths.

### 2. Rendering both policy types

Each component reads its slice of the config from context automatically:

```tsx
import { PrivacyPolicy, CookiePolicy } from '@openpolicy/react';

// Privacy policy page
export default function PrivacyPage() {
  return <PrivacyPolicy />;
}

// Cookie policy page
export default function CookiePolicyPage() {
  return <CookiePolicy />;
}
```

Both components accept the same optional props:

| Prop | Type | Description |
|------|------|-------------|
| `config` | `OpenPolicyConfig \| PrivacyPolicyConfig` (or equivalent) | Per-page config override; falls back to context |
| `components` | `PolicyComponents` | Override default renderers for individual node types |
| `style` | `CSSProperties` | Inline styles applied to the wrapper `<div>` |

### 3. Component customization with PolicyComponents

Override any node renderer by passing a `components` prop. The `PolicyComponents` interface:

```ts
type PolicyComponents = {
  Section?: ComponentType<{ section: DocumentSection; children: ReactNode }>;
  Heading?: ComponentType<{ node: HeadingNode }>;
  Paragraph?: ComponentType<{ node: ParagraphNode; children: ReactNode }>;
  List?: ComponentType<{ node: ListNode; children: ReactNode }>;
  Text?: ComponentType<{ node: TextNode }>;
  Bold?: ComponentType<{ node: BoldNode }>;
  Italic?: ComponentType<{ node: ItalicNode }>;
  Link?: ComponentType<{ node: LinkNode }>;
}
```

All fields are optional — unspecified slots use the default renderers. Example: swap in a custom heading:

```tsx
import { PrivacyPolicy } from '@openpolicy/react';
import type { HeadingNode } from '@openpolicy/core';

function MyHeading({ node }: { node: HeadingNode }) {
  return <h2 className="text-2xl font-bold text-slate-900">{node.text}</h2>;
}

export default function PrivacyPage() {
  return <PrivacyPolicy components={{ Heading: MyHeading }} />;
}
```

### 4. Theming with CSS custom properties

The `.op-policy` wrapper exposes CSS custom properties. Override them globally or scoped:

```css
.op-policy {
  --op-heading-color: #0f172a;
  --op-body-color: #475569;
  --op-link-color: #6366f1;
  --op-link-color-hover: #4f46e5;
  --op-font-family: 'Inter', sans-serif;
  --op-font-size-body: 0.9375rem;
  --op-font-size-heading: 1.125rem;
  --op-font-weight-heading: 600;
  --op-line-height: 1.75;
  --op-section-gap: 2.5rem;
  --op-border-color: #e2e8f0;
  --op-border-radius: 0.5rem;
}
```

### 5. shadcn/ui registry install

Pre-styled variants are available via the shadcn registry. Install individual components:

```sh
shadcn add @openpolicy/privacy-policy
shadcn add @openpolicy/cookie-policy
```

This copies styled component files into your project that you can edit freely. They use the same `PolicyComponents` customization interface under the hood.

## Common Mistakes

### CRITICAL — Using `openPolicy()` from `@openpolicy/vite` to generate static files

The `openPolicy()` Vite plugin emits `.md` / `.html` / `.pdf` files at build time. It is a separate, legacy path. Agents trained on older docs may reach for it when asked to "add a privacy policy page."

```ts
// vite.config.ts — WRONG
import { openPolicy } from '@openpolicy/vite';
plugins: [openPolicy({ formats: ['html'], outDir: 'public' })]
```

The correct approach is React runtime rendering — render `<PrivacyPolicy />` as a page component. The static files produced by `openPolicy()` are never read by the React components.

```tsx
// correct: render as a React page
import { PrivacyPolicy } from '@openpolicy/react';
export default function PrivacyPage() {
  return <PrivacyPolicy />;
}
```

### HIGH — Rendering policy components outside `<OpenPolicy>` provider

`PrivacyPolicy` and `CookiePolicy` call `useContext(OpenPolicyContext)` and return `null` when no config is found. Without the provider, nothing renders and no error is thrown — the bug is invisible in development.

```tsx
// privacy-page.tsx — WRONG: no provider anywhere in the tree
export default function PrivacyPage() {
  return <PrivacyPolicy />;
}
```

Wrap at the application root, not inside individual pages:

```tsx
// layout.tsx — correct
import config from './openpolicy';
export default function RootLayout({ children }) {
  return (
    <OpenPolicy config={config}>
      {children}
    </OpenPolicy>
  );
}

// privacy-page.tsx — correct: provider is already in the tree
export default function PrivacyPage() {
  return <PrivacyPolicy />;
}
```

### MEDIUM — Not importing `@openpolicy/react/styles.css`

Without the CSS import, policy components render as unstyled HTML. The provider injects inline styles via a React `<style>` tag, but this may not work in all SSR or bundler setups.

```tsx
// WRONG: no styles imported
import { PrivacyPolicy } from '@openpolicy/react';
```

```tsx
// correct
import '@openpolicy/react/styles.css';
import { PrivacyPolicy } from '@openpolicy/react';
```

The default styles scope all rules to `.op-policy` so they do not leak to the rest of the page.
