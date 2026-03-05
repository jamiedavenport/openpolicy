# `@openpolicy/core`

> Compilation engine for [OpenPolicy](https://openpolicy.sh) policy documents.

This is an internal package used by `@openpolicy/sdk`, `@openpolicy/vite`, and `@openpolicy/astro`. You generally do not need to install or import it directly.

## What it does

- Compiles `PrivacyPolicyConfig` and `TermsOfServiceConfig` definitions to Markdown and HTML
- Validates policy configs and returns structured warnings and errors
- Exports section builders, renderers, and all core types

## Direct usage

If you're building a custom integration (e.g. a framework plugin not covered by the official packages), you can use `compilePolicy` directly:

```ts
import { compilePolicy } from "@openpolicy/core";

const results = compilePolicy(
  {
    type: "privacy",
    effectiveDate: "2026-01-01",
    company: { name: "Acme", legalName: "Acme, Inc.", address: "...", contact: "privacy@acme.com" },
    // ... rest of config
  },
  { formats: ["markdown", "html"] },
);

for (const result of results) {
  console.log(result.format, result.content);
}
```

## Links

- [GitHub](https://github.com/jamiedavenport/openpolicy)
- [openpolicy.sh](https://openpolicy.sh)
- [npm](https://www.npmjs.com/package/@openpolicy/core)
