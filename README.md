[![OpenPolicy](https://openpolicy.sh/og.png)](https://openpolicy.sh)

# OpenPolicy

Policy-as-code framework for generating legal agreements from TypeScript.

> **Early alpha.** OpenPolicy is under active development and the API may change. We're actively looking for feedback, contributors, maintainers, and sponsors. If you're using it, [open an issue](https://github.com/jamiedavenport/openpolicy/issues) to share what's working, what's broken, or what you'd like to see. If you'd like to sponsor the project, reach out via GitHub.

Define privacy policies, terms of service, and other compliance documents in code — then compile them to HTML, PDF, Markdown, and React components at build time.

## Packages

| Package | Description |
|---|---|
| `@openpolicy/sdk` | Public API — `defineConfig()`, `defineTermsOfService()`, and related types |
| `@openpolicy/core` | Compilation engine — published to npm as a dependency of sdk and vite |
| `@openpolicy/vite` | Vite plugin for build-time compilation |
| `@openpolicy/cli` | CLI tool for generating policy documents |

## Quick Start

```bash
bun install
```

### 1. Define your policies

Create a single `openpolicy.ts` at the root of your project. `defineConfig()` lets you define all policies in one file with a shared `company` block:

```ts
// openpolicy.ts
import { defineConfig } from '@openpolicy/sdk'

export default defineConfig({
  company: {
    name: 'Acme Inc.',
    legalName: 'Acme Incorporated',
    address: '123 Market St, San Francisco, CA 94105',
    contact: 'privacy@acme.com',
  },
  privacy: {
    effectiveDate: '2026-01-01',
    dataCollected: {
      'Account Information': ['Email', 'Name'],
      'Usage Data': ['IP address', 'Browser', 'Pages visited'],
    },
    legalBasis: 'Legitimate interests and consent',
    retention: { 'Account data': '3 years after account closure', 'Usage logs': '90 days' },
    cookies: { essential: true, analytics: true, marketing: false },
    thirdParties: [{ name: 'Stripe', purpose: 'Payment processing' }],
    userRights: ['access', 'rectification', 'erasure', 'portability'],
    jurisdictions: ['us', 'eu'],
  },
  terms: {
    effectiveDate: '2026-01-01',
    acceptance: { methods: ['using the service', 'creating an account'] },
    disclaimers: { serviceProvidedAsIs: true, noWarranties: true },
    limitationOfLiability: { excludesIndirectDamages: true },
    governingLaw: { jurisdiction: 'Delaware, USA' },
  },
})
```

### 2. Add the Vite plugin

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { openPolicy } from '@openpolicy/vite'

export default defineConfig({
  plugins: [
    openPolicy({ formats: ['markdown', 'html'] }),
  ],
})
```

With no `configs` option, the plugin looks for `openpolicy.ts` by default and compiles all sections present in a single pass. Pass `configs` to use separate files or override the detected type:

```ts
openPolicy({
  configs: [
    'privacy.config.ts',
    { config: 'legal.config.ts', type: 'terms' },
  ],
  formats: ['markdown', 'html'],
})
```

### 3. Use generated output

```tsx
// src/privacy-policy.tsx
import privacyPolicy from './policies/privacy-policy.html?raw'

export default function PrivacyPolicyPage() {
  return <div dangerouslySetInnerHTML={{ __html: privacyPolicy }} />
}
```

## Policy Types

### Unified config — `OpenPolicyConfig`

The recommended approach. Define all policies in one file with a shared `company` block:

| Field | Type | Description |
|---|---|---|
| `company` | `object` | Shared legal name, address, contact email |
| `privacy` | `object?` | Privacy policy fields (see below) |
| `terms` | `object?` | Terms of service fields (see below) |
| `cookie` | `object?` | Cookie policy fields |

### Privacy Policy — `PrivacyPolicyConfig`

| Field | Type | Description |
|---|---|---|
| `effectiveDate` | `string` | ISO date the policy takes effect |
| `dataCollected` | `Record<string, string[]>` | Categories and fields of collected data |
| `legalBasis` | `string` | e.g. `'Legitimate interests and consent'` |
| `retention` | `Record<string, string>` | Data retention periods per category |
| `cookies` | `object` | `essential`, `analytics`, `marketing` toggles |
| `thirdParties` | `array` | Name and purpose of each third-party service |
| `userRights` | `string[]` | e.g. `['access', 'erasure', 'portability']` |
| `jurisdictions` | `Jurisdiction[]` | `'us'`, `'eu'`, `'ca'`, etc. |

### Terms of Service — `TermsOfServiceConfig`

| Field | Type | Description |
|---|---|---|
| `effectiveDate` | `string` | ISO date the terms take effect |
| `acceptance` | `object` | Methods by which users accept the terms |
| `governingLaw` | `object` | Jurisdiction whose laws govern the agreement |
| `eligibility` | `object?` | Minimum age and jurisdiction restrictions |
| `accounts` | `object?` | Registration, credential, and termination rules |
| `prohibitedUses` | `string[]?` | List of forbidden activities |
| `payments` | `object?` | Paid features, refund policy, price changes |
| `disclaimers` | `object?` | Disclaimer of warranties |
| `limitationOfLiability` | `object?` | Liability exclusions and cap |
| `disputeResolution` | `object?` | Arbitration, litigation, or mediation |
| `changesPolicy` | `object?` | How users are notified of updates |

See the [openpolicy.ts reference](https://docs.openpolicy.sh/reference/openpolicy-config) for full field documentation.

## Output Formats

- **`jsx`** — React component (`<PrivacyPolicy />`)
- **`pdf`** — Static PDF file
- **`markdown`** — Plain Markdown document

## Compliance

Pre-built templates for:
- GDPR (EU)
- CCPA (California)
- Multi-jurisdiction

## CLI

Use the `openpolicy` CLI to generate and validate policies outside of a Vite build.

```bash
# Generate all policies from openpolicy.ts (default)
openpolicy generate

# Generate with custom format and output directory
openpolicy generate --format markdown,html --out ./output

# Interactive setup wizard — privacy policy (default)
openpolicy init

# Interactive setup wizard — terms of service
openpolicy init --type terms

# Validate policies
openpolicy validate ./openpolicy.ts --jurisdiction gdpr
```

| Command | Description |
|---|---|
| `init [--type privacy\|terms]` | Interactive wizard that scaffolds a config file |
| `generate [config] [--type privacy\|terms\|cookie]` | Compiles the policy to the requested output formats. Defaults to `./openpolicy.ts`. |
| `validate [config] [--type privacy\|terms\|cookie]` | Validates the policy config |

`--format` accepts a comma-separated list: `markdown`, `html` (default: `markdown`).
`--type` is auto-detected from the config filename — files containing `"terms"` are treated as terms of service, `"cookie"` as cookie policy. Ignored for unified configs.
`--jurisdiction` accepts `gdpr`, `ccpa`, or `all` (default: `all`, privacy only).

## Development

```bash
# Install dependencies
bun install

# Install lefthook (pre-commit formatting, pre-push type checking)
bun lefthook install

# Run tests
bun test

# Build packages (produces dist/*.js + dist/*.d.ts)
bun run build
```

### Releasing

This repo uses [Changesets](https://github.com/changesets/changesets). To cut a release:

1. Run `bun run changeset` and describe your change.
2. Merge to `main` — CI opens a "Version Packages" PR automatically.
3. Merge the PR — CI publishes the updated packages to NPM.

## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://www.jxd.dev/"><img src="https://avatars.githubusercontent.com/u/1329874?v=4?s=100" width="100px;" alt="Jamie Davenport"/><br /><sub><b>Jamie Davenport</b></sub></a><br /><a href="https://github.com/jamiedavenport/openpolicy/commits?author=jamiedavenport" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/jimbobware"><img src="https://avatars.githubusercontent.com/u/121758727?v=4?s=100" width="100px;" alt="James"/><br /><sub><b>James</b></sub></a><br /><a href="https://github.com/jamiedavenport/openpolicy/commits?author=jimbobware" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.vishvish.com/"><img src="https://avatars.githubusercontent.com/u/184423?v=4?s=100" width="100px;" alt="Vish"/><br /><sub><b>Vish</b></sub></a><br /><a href="https://github.com/jamiedavenport/openpolicy/commits?author=vishvish" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/kdoroszewicz"><img src="https://avatars.githubusercontent.com/u/7294362?v=4?s=100" width="100px;" alt="Kamil Doroszewicz"/><br /><sub><b>Kamil Doroszewicz</b></sub></a><br /><a href="https://github.com/jamiedavenport/openpolicy/commits?author=kdoroszewicz" title="Code">💻</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

## AI Integration

OpenPolicy ships an `llms.txt` reference. AI assistants (Claude, Cursor, Copilot) can read your codebase and auto-generate policy configurations that reflect your actual data flows and third-party integrations.

## Stargazers

[![RepoStars](https://repostars.dev/api/embed?repo=jamiedavenport%2Fopenpolicy&theme=light)](https://repostars.dev/?repos=jamiedavenport%2Fopenpolicy&theme=light)