[![OpenPolicy](https://openpolicy.sh/og.png)](https://openpolicy.sh)

# Astro Example — OpenPolicy

A minimal Astro static site showing how to render privacy, terms, and cookie policies using `@openpolicy/core` directly in page frontmatter. No Astro integration, no generated files.

## What it demonstrates

- Defining a unified policy config with `@openpolicy/sdk`
- Splitting it into individual policies with `expandOpenPolicyConfig`
- Compiling and rendering each policy to HTML with `compile` + `renderHTML`
- Rendering the output in Astro pages using `set:html`

## Project structure

```
src/lib/openpolicy.ts   ← defineConfig() — all policy definitions
src/pages/privacy.astro ← privacy policy page
src/pages/terms.astro   ← terms of service page
src/pages/cookie.astro  ← cookie policy page
astro.config.mjs        ← empty — no integrations needed
```

## Running locally

```sh
bun install
bun run dev
bun run build
```

## Learn more

- [Blog post: Zero-build privacy policies with Astro](https://openpolicy.sh/blog/no-build-astro)
- [OpenPolicy docs](https://openpolicy.sh/docs)
- [`@openpolicy/sdk` reference](https://openpolicy.sh/docs/configuration)
