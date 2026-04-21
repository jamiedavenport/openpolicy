[![OpenPolicy](https://openpolicy.sh/og.png)](https://openpolicy.sh)

# SvelteKit Example — OpenPolicy CLI

A minimal SvelteKit app showing how to use the `@openpolicy/cli` `generate` command to produce policy documents from a typed TypeScript config. Policies are rendered as SvelteKit routes from pre-generated HTML files.

## What it demonstrates

- Defining a Privacy Policy and Cookie Policy using `@openpolicy/sdk`
- Generating HTML output to `src/lib/policies/` via `bunx openpolicy generate`
- Importing generated HTML files as raw strings and rendering them with `{@html}`

## Project structure

```
openpolicy.ts         ← defineConfig() — unified policy definition (privacy, cookie)
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
bunx openpolicy generate --format html --out src/lib/policies
bun run dev      # start dev server
bun run build    # production build
```

## Learn more

- [OpenPolicy docs](https://openpolicy.dev/docs)
- [`@openpolicy/cli`](https://openpolicy.dev/docs/generation/cli)
- [`@openpolicy/sdk` reference](https://openpolicy.dev/docs/reference/openpolicy-config)
