# TanStack Start Example — Vite + React + OpenPolicy

A minimal TanStack Start (React + Vite) app showing how to use the `@openpolicy/vite` plugin to compile policy documents at build time and serve them as routes.

## What it demonstrates

- Configuring the `openPolicy()` plugin in `vite.config.ts` alongside TanStack Start
- Defining a Privacy Policy and Terms of Service using `@openpolicy/sdk`
- Generating HTML output to `src/policies/` at build time
- Serving policy pages as dedicated routes (`/privacy`, `/terms`) using TanStack Router

## Project structure

```
vite.config.ts           ← openPolicy() plugin configured here
policy.config.ts         ← defineConfig() — privacy policy definition
terms.config.ts          ← defineTermsOfService() — terms of service definition
src/policies/            ← generated output (privacy-policy.html, terms-of-service.html)
src/routes/privacy.tsx   ← /privacy route — renders generated HTML
src/routes/terms.tsx     ← /terms route — renders generated HTML
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
