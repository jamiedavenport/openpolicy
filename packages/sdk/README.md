# `@openpolicy/sdk`

> TypeScript SDK for defining privacy policies and terms of service as code.

Part of [OpenPolicy](https://openpolicy.sh) — a policy-as-code framework that compiles legal agreements from TypeScript at build time.

## Install

```sh
bun add @openpolicy/sdk
# or: npm install @openpolicy/sdk
```

## Usage

### Privacy policy

```ts
// openpolicy.ts
import { defineConfig } from "@openpolicy/sdk";

export default defineConfig({
  company: {
    name: "Acme",
    legalName: "Acme, Inc.",
    address: "123 Main St, San Francisco, CA 94105",
    contact: "privacy@acme.com",
  },
  privacy: {
    effectiveDate: "2026-01-01",
    dataCollected: {
      "Account information": ["Email address", "Display name"],
      "Usage data": ["Pages visited", "Session duration"],
    },
    legalBasis: "Legitimate interests and user consent",
    retention: {
      "Account data": "Until account deletion",
      "Analytics data": "13 months",
    },
    cookies: { essential: true, analytics: true, marketing: false },
    thirdParties: [
      { name: "Vercel", purpose: "Hosting" },
      { name: "Plausible", purpose: "Privacy-friendly analytics" },
    ],
    userRights: ["access", "erasure", "portability"],
    jurisdictions: ["us", "eu"],
  },
});
```

### Terms of service

```ts
// terms.config.ts
import { defineConfig } from "@openpolicy/sdk";

export default defineConfig({
  company: {
    name: "Acme",
    legalName: "Acme, Inc.",
    address: "123 Main St, San Francisco, CA 94105",
    contact: "legal@acme.com",
  },
  terms: {
    effectiveDate: "2026-01-01",
    acceptance: { methods: ["using the service", "creating an account"] },
    eligibility: { minimumAge: 13 },
    disclaimers: { serviceProvidedAsIs: true, noWarranties: true },
    limitationOfLiability: { excludesIndirectDamages: true },
    governingLaw: { jurisdiction: "Delaware, USA" },
    changesPolicy: {
      noticeMethod: "email or prominent notice on the website",
      noticePeriodDays: 30,
    },
  },
});
```

## Compiling policies

The SDK exports types and helper functions for _defining_ policies. To compile them to Markdown or HTML, pair it with one of:

- **[`@openpolicy/vite`](https://openpolicy.sh/docs/getting-started/vite)** — Vite plugin (build-time, with hot-reload in dev)
- **[`@openpolicy/astro`](https://openpolicy.sh/docs/getting-started/astro)** — Astro integration
- **[`@openpolicy/cli`](https://openpolicy.sh/docs/getting-started/cli)** — `openpolicy generate` CLI command

## Documentation

Full field reference and guides: [openpolicy.sh/docs](https://openpolicy.sh/docs)

## AI Agents

If you use an AI coding agent (Claude Code, Cursor, Copilot, etc.), run:

```sh
npx @tanstack/intent@latest install
```

This installs skill files that give your agent accurate, up-to-date guidance for OpenPolicy APIs.

## Links

- [GitHub](https://github.com/jamiedavenport/openpolicy)
- [openpolicy.sh](https://openpolicy.sh)
- [npm](https://www.npmjs.com/package/@openpolicy/sdk)
