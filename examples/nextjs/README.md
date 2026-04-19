[![OpenPolicy](https://openpolicy.sh/og.png)](https://openpolicy.sh)

# Next.js Example — OpenPolicy React

A minimal Next.js App Router app showing how to render policy documents directly using `@openpolicy/react`. Policies are compiled and rendered at runtime — no build step, no generated files.

## What it demonstrates

- Wrapping the app in `<OpenPolicy>` via a `"use client"` provider in `app/providers.tsx`
- Rendering `<PrivacyPolicy />` as a client component in App Router
- Defining policies using `defineConfig()` from `@openpolicy/sdk`

## Project structure

```
openpolicy.ts            ← defineConfig() — privacy config
app/providers.tsx        ← "use client" wrapper around <OpenPolicy>
app/layout.tsx           ← root layout that renders <Providers>
app/privacy/page.tsx     ← renders <PrivacyPolicy />
```

## Running locally

```sh
bun install
bun run dev
```

## Learn more

- [Next.js + React components guide](https://openpolicy.sh/docs/react/next)
- [`@openpolicy/react` reference](https://openpolicy.sh/docs/react)
- [`@openpolicy/sdk` reference](https://openpolicy.sh/docs/reference/openpolicy-config)
