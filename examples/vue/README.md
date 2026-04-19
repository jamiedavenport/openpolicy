# Vue Example — OpenPolicy Vue Components

A minimal Vite + Vue app showing how to render OpenPolicy documents at runtime with `@openpolicy/vue`.

## What it demonstrates

- Using `@openpolicy/vue` runtime components (`OpenPolicy`, `PrivacyPolicy`, `CookiePolicy`)
- Defining a unified policy config with `@openpolicy/sdk`
- Routing policy pages with `vue-router`
- Styling policies via the default injected styles and page-level app styles

## Project structure

```
openpolicy.ts        ← defineConfig() — unified policy definition (privacy, cookie)
src/
  main.ts            ← Vue app + router + policy routes
  styles.css         ← app-level styles
```

## Running locally

```sh
bun install
bun run --cwd examples/vue dev
```

Build for production:

```sh
bun run --cwd examples/vue build
```
