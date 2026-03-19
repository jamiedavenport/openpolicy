[![OpenPolicy](https://openpolicy.sh/og.png)](https://openpolicy.sh)

# TanStack Start Example — Vite + React + OpenPolicy

A TanStack Start (React + Vite) app showcasing three different ways to style `@openpolicy/react` components: Tailwind utility classes, CSS custom properties, and shadcn component overrides.

## What it demonstrates

- Unified `defineConfig()` covering all three policy types (privacy, terms, cookie) in a single file
- Three styling approaches across three routes:
  - **`/tailwind`** — policies styled with Tailwind utility classes
  - **`/css-vars`** — policies styled with CSS custom properties
  - **`/shadcn`** — policies with a custom `Heading` component using shadcn `Tooltip` to surface `node.context.reason` on hover
- `@openpolicy/react` components (`PrivacyPolicy`, `TermsOfService`, `CookiePolicy`) rendered directly as React components
- Configuring the `openPolicy()` plugin in `vite.config.ts` alongside TanStack Start

## Project structure

```
vite.config.ts                ← openPolicy() plugin + TanStack Start + Tailwind
src/openpolicy.ts             ← defineConfig() — all three policies in one file
src/routes/__root.tsx         ← root layout: OpenPolicy provider + TooltipProvider + nav
src/routes/index.tsx          ← "/" — placeholder
src/routes/tailwind.tsx       ← "/tailwind" — policies styled with Tailwind classes
src/routes/css-vars.tsx       ← "/css-vars" — policies styled with CSS custom properties
src/routes/shadcn.tsx         ← "/shadcn" — policies with custom Heading + shadcn Tooltip
src/policies/                 ← generated HTML output (build artifact)
src/components/ui/tooltip.tsx ← Radix UI Tooltip wrapper
```

## Running locally

```sh
bun install
bun run dev      # start dev server on http://localhost:3000 — policies are generated on startup
bun run build    # production build
```

## Learn more

- [OpenPolicy docs](https://openpolicy.dev/docs)
- [`@openpolicy/vite` plugin](https://openpolicy.dev/docs/vite)
- [`@openpolicy/sdk` reference](https://openpolicy.dev/docs/sdk)
