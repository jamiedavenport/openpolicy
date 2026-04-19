[![OpenPolicy](https://openpolicy.sh/og.png)](https://openpolicy.sh)

# SvelteKit Example — OpenPolicy Vite Plugin

A minimal SvelteKit app showing how to use the `@openpolicy/vite` plugin to generate policy documents at build time. Policies are compiled from a typed TypeScript config and rendered as SvelteKit routes.

## What it demonstrates

- Adding `openPolicy()` to the Vite config inside a SvelteKit project
- Defining a Privacy Policy and Cookie Policy using `@openpolicy/sdk`
- Generating HTML output to `src/lib/policies/` at build time and with hot-reload in dev
- Importing generated HTML files as raw strings and rendering them with `{@html}`

## Project structure

```
openpolicy.ts         ← defineConfig() — unified policy definition (privacy, cookie)
vite.config.ts        ← openPolicy() plugin configured here
src/
  lib/policies/       ← generated output (privacy-policy.html, cookie-policy.html)
  routes/
    +page.svelte      ← home page with links to policy pages
    privacy/
      +page.svelte    ← renders privacy-policy.html
    cookie/
      +page.svelte    ← renders cookie-policy.html
```

## Running locally

```sh
bun install
bun run dev      # start dev server — policies are generated on startup and hot-reloaded on save
bun run build    # production build
```

## Learn more

- [OpenPolicy docs](https://openpolicy.dev/docs)
- [`@openpolicy/vite` plugin](https://openpolicy.dev/docs/getting-started/vite)
- [`@openpolicy/sdk` reference](https://openpolicy.dev/docs/reference/openpolicy-config)
