# OpenPolicy

Policy-as-code framework for generating legal agreements from TypeScript.

> **Early alpha.** OpenPolicy is under active development and the API may change. We're actively looking for feedback, contributors, maintainers, and sponsors. If you're using it, [open an issue](https://github.com/jamiedavenport/openpolicy/issues) to share what's working, what's broken, or what you'd like to see. If you'd like to sponsor the project, reach out via GitHub.

Define privacy policies, terms of service, and other compliance documents in code — then compile them to HTML, PDF, Markdown, and React components at build time.

## Packages

| Package | Description |
|---|---|
| `@openpolicy/sdk` | Public API — `definePrivacyPolicy()`, `defineTermsOfService()`, and related types |
| `@openpolicy/core` | Compilation engine — published to npm as a dependency of sdk and vite |
| `@openpolicy/vite` | Vite plugin for build-time compilation |
| `@openpolicy/cli` | CLI tool for generating policy documents |

## Quick Start

```bash
bun install
```

### 1. Define a policy

```ts
// privacy.config.ts
import { definePrivacyPolicy } from '@openpolicy/sdk'

export default definePrivacyPolicy({
  effectiveDate: '2026-01-01',
  company: {
    name: 'Acme Inc.',
    legalName: 'Acme Incorporated',
    address: '123 Market St, San Francisco, CA 94105',
    contact: 'privacy@acme.com',
  },
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
})
```

Or define terms of service:

```ts
// terms.config.ts
import { defineTermsOfService } from '@openpolicy/sdk'

export default defineTermsOfService({
  effectiveDate: '2026-01-01',
  company: {
    name: 'Acme Inc.',
    legalName: 'Acme Incorporated',
    address: '123 Market St, San Francisco, CA 94105',
    contact: 'legal@acme.com',
  },
  acceptance: { methods: ['using the service', 'creating an account'] },
  disclaimers: { serviceProvidedAsIs: true, noWarranties: true },
  limitationOfLiability: { excludesIndirectDamages: true },
  governingLaw: { jurisdiction: 'Delaware, USA' },
})
```

### 2. Add the Vite plugin

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { openPolicy } from '@openpolicy/vite'

export default defineConfig({
  plugins: [
    openPolicy({
      configs: ['privacy.config.ts', 'terms.config.ts'],
      formats: ['markdown', 'html'],
    }),
  ],
})
```

Policy type is auto-detected from the filename — files containing `"terms"` compile as terms of service, all others as privacy policy. Pass an explicit type to override:

```ts
openPolicy({
  configs: [
    'privacy.config.ts',
    { config: 'legal.config.ts', type: 'terms' },
  ],
  formats: ['markdown', 'html'],
})
```

The legacy single-config form (`config` + `type`) still works unchanged.

### 3. Use generated output

```tsx
// src/privacy-policy.tsx
import privacyPolicy from './policies/privacy-policy.html?raw'

export default function PrivacyPolicyPage() {
  return <div dangerouslySetInnerHTML={{ __html: privacyPolicy }} />
}
```

## Policy Types

### Privacy Policy — `PrivacyPolicyConfig`

| Field | Type | Description |
|---|---|---|
| `effectiveDate` | `string` | ISO date the policy takes effect |
| `company` | `object` | Legal name, address, contact email |
| `dataCollected` | `Record<string, string[]>` | Categories and fields of collected data |
| `legalBasis` | `string` | e.g. `'Legitimate interests and consent'` |
| `retention` | `Record<string, string>` | Data retention periods per category |
| `cookies` | `object` | `essential`, `analytics`, `marketing` toggles |
| `thirdParties` | `array` | Name and purpose of each third-party service |
| `userRights` | `string[]` | e.g. `['access', 'erasure', 'portability']` |
| `jurisdictions` | `Jurisdiction[]` | `'us'`, `'eu'`, `'ca'`, etc. |

See the [policy.config.ts reference](https://openpolicy.dev/reference/policy) for full field documentation.

### Terms of Service — `TermsOfServiceConfig`

| Field | Type | Description |
|---|---|---|
| `effectiveDate` | `string` | ISO date the terms take effect |
| `company` | `object` | Legal name, address, contact email |
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

See the [terms.config.ts reference](https://openpolicy.dev/reference/terms) for full field documentation.

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
# Interactive setup wizard — privacy policy (default)
openpolicy init

# Interactive setup wizard — terms of service
openpolicy init --type terms

# Compile a privacy policy config
openpolicy generate ./privacy.config.ts --format markdown,html --out ./output

# Compile a terms of service config (auto-detected from filename)
openpolicy generate ./terms.config.ts --format markdown,html --out ./output

# Validate a privacy policy
openpolicy validate ./privacy.config.ts --jurisdiction gdpr

# Validate terms of service (auto-detected from filename)
openpolicy validate ./terms.config.ts
```

| Command | Description |
|---|---|
| `init [--type privacy\|terms]` | Interactive wizard that scaffolds a config file |
| `generate [config] [--type privacy\|terms]` | Compiles the policy to the requested output formats |
| `validate [config] [--type privacy\|terms]` | Validates the policy config |

`--format` accepts a comma-separated list: `markdown`, `html` (default: `markdown`).
`--type` is auto-detected from the config filename — files containing `"terms"` are treated as terms of service configs.
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