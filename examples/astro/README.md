[![OpenPolicy](https://openpolicy.sh/og.png)](https://openpolicy.sh)

# Landing Page Example — Astro + OpenPolicy

A minimal Astro static site showing how to integrate OpenPolicy using the `@openpolicy/astro` integration. Policy documents are compiled at build time.

## What it demonstrates

- Configuring the `@openpolicy/astro` integration inside `astro.config.mjs`
- Defining a Privacy Policy and Terms of Service using `@openpolicy/sdk`
- Generating Markdown and HTML output to `src/policies/` at build time
- (Bonus) Using `openpolicy generate` via the CLI as an alternative one-off generation step

## Project structure

```
astro.config.mjs      ← openPolicy() plugin configured here
policy.config.ts      ← defineConfig() — privacy policy definition
terms.config.ts       ← defineConfig() — terms of service definition
src/policies/         ← generated output (privacy-policy.{md,html}, terms-of-service.{md,html})
```

## Running locally

```sh
bun install
bun run dev      # start dev server — policies are generated on startup
bun run build    # production build
```

To regenerate policies without starting the dev server:

```sh
bun run generate:policy
```

## Learn more

- [OpenPolicy docs](https://openpolicy.dev/docs)
- [`@openpolicy/astro` integration](https://openpolicy.dev/docs/astro)
- [`@openpolicy/sdk` reference](https://openpolicy.dev/docs/sdk)
