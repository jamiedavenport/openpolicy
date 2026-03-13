# Next.js Example — OpenPolicy CLI

A minimal Next.js app showing how to use the `@openpolicy/cli` to generate policy documents as part of a Next.js build. Policies are generated to `public/policies/` before each build so they're served as static files.

## What it demonstrates

- Using `openpolicy generate` in a `prebuild` script so policies are always up to date before `next build`
- Defining policies using `@openpolicy/sdk` and pointing the CLI at the config files
- Serving generated HTML policy files as static assets from `public/`

## Project structure

```
policy.config.ts         ← defineConfig() — privacy policy definition
terms.config.ts          ← defineTermsOfService() — terms of service definition
public/policies/         ← generated output (privacy-policy.html, terms-of-service.html)
```

## Running locally

```sh
bun install
bun run dev     # starts Next.js dev server (policies are NOT auto-regenerated in dev)
bun run build   # runs generate:policies first, then next build
```

To regenerate policies manually:

```sh
bun run generate:policies
```

## Learn more

- [OpenPolicy docs](https://openpolicy.dev/docs)
- [`@openpolicy/cli` reference](https://openpolicy.dev/docs/cli)
- [`@openpolicy/sdk` reference](https://openpolicy.dev/docs/sdk)
