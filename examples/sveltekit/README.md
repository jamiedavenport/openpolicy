[![OpenPolicy](https://openpolicy.sh/og.png)](https://openpolicy.sh)

# SvelteKit Example — OpenPolicy

A minimal SvelteKit app showing how to render OpenPolicy privacy and cookie policies as SvelteKit routes.

## What it demonstrates

- Defining a Privacy Policy and Cookie Policy using `@openpolicy/sdk`
- Rendering each policy as its own SvelteKit route

## Project structure

```
openpolicy.ts         ← defineConfig() — unified policy definition (privacy, cookie)
src/
  lib/policies/       ← pre-rendered HTML (privacy-policy.html, cookie-policy.html)
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
bun run dev      # start dev server
bun run build    # production build
```

## Learn more

- [OpenPolicy docs](https://docs.openpolicy.sh)
- [`@openpolicy/cli`](https://docs.openpolicy.sh/cli)
