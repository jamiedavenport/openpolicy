---
title: Supported jurisdictions
description: The canonical list of jurisdiction codes Policy accepts and what each one ships
product: policy
---

Policy uses lowercase-kebab region codes for the `jurisdictions` field in your `policystack.ts`. The set is a **frozen, eleven-member union** as of 1.0 — `JurisdictionId`. TypeScript accepts only these codes and the runtime validator rejects anything else; there is no second enum and no migration alias.

There are no regulation-name aliases like `"gdpr"` or `"ccpa"` — use the region code the regulation applies to. The code for the EU/EEA is `"eea"`, not `"eu"`: GDPR applies EEA-wide.

## Codes

Every code is **type-valid**. Each one resolves to one of two tiers:

- **`specific`** — hand-authored, jurisdiction-precise policy text and user rights.
- **`equivalent`** — posture-correct (opt-in vs. opt-out) with parent-jurisdiction text, plus a suppressible `jurisdiction-generic-policy-text` validator warning so the honesty gap is visible. A legitimate, shippable tier — a member's tier may be upgraded post-1.0 without a breaking change.

| Code    | Region                  | Regulation(s)               | Tier         |
| ------- | ----------------------- | --------------------------- | ------------ |
| `eea`   | European Economic Area  | GDPR                        | `specific`   |
| `uk`    | United Kingdom          | UK-GDPR + PECR              | `specific`   |
| `us-ca` | California, USA         | CCPA / CPRA                 | `specific`   |
| `ch`    | Switzerland             | revFADP                     | `equivalent` |
| `br`    | Brazil                  | LGPD                        | `equivalent` |
| `ca`    | Canada                  | PIPEDA (+ Quebec Law 25)    | `equivalent` |
| `us`    | United States (federal) | Federal baseline, opt-out   | `equivalent` |
| `us-co` | Colorado, USA           | CPA                         | `equivalent` |
| `us-ct` | Connecticut, USA        | CTDPA                       | `equivalent` |
| `us-va` | Virginia, USA           | VCDPA                       | `equivalent` |
| `row`   | Rest of world           | Conservative opt-in default | `equivalent` |

US privacy law is state-level. `"us"` is the federal opt-out baseline; pick the specific state codes that apply to your users (e.g. `"us-ca"` for California) for state-precise text. The US state codes inherit text and posture from `"us"` as their parent.

## What each `specific` code adds

### `eea` — GDPR

- **Legal basis** section (Article 13)
- **GDPR supplemental disclosures** (data controller, transfer safeguards, complaint rights)
- **User rights**: access, rectification, erasure, portability, restriction, objection
- **Cookie policy**: European-user disclosure under ePrivacy + GDPR consent rules

### `uk` — UK-GDPR

- **Legal basis** section (Article 13)
- **UK-GDPR supplemental disclosures**: Information Commissioner's Office (ICO) named as the supervisory authority, link to the ICO complaint portal, Data Protection Act 2018 referenced as the implementing statute, UK international transfer safeguards
- **User rights**: same six rights as GDPR
- **Cookie policy**: UK-user disclosure under PECR + UK-GDPR consent rules

### `us-ca` — CCPA / CPRA

- **California Privacy Rights** supplement (Right to Know, Right to Delete, Right to Opt-Out, Right to Non-Discrimination)
- **User rights**: access, erasure, opt_out_sale, non_discrimination

## Combining codes

When multiple codes apply, their content is combined — user rights are deduplicated and ordered canonically, and each jurisdiction-specific supplement renders once. For example:

```ts
jurisdictions: ["eea", "uk", "us-ca"],
```

produces a policy with GDPR, UK-GDPR, and CCPA supplements, plus the union of all three rights sets.

## Validation

The runtime validator rejects any code that isn't a member of the union with a helpful error:

```
Unknown jurisdiction "eu" — valid codes: eea, uk, ch, br, ca, us, us-ca, us-co, us-ct, us-va, row
```

If you are upgrading from a pre-1.0 release, the common migration is `"eu"` → `"eea"`. The codes `"au"`, `"jp"`, and `"sg"` are not part of the 1.0 union and are rejected — declare `"row"` for a conservative opt-in fallback if you serve those regions.
