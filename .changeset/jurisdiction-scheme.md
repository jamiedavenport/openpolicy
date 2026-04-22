---
"@openpolicy/sdk": patch
"@openpolicy/core": patch
"@openpolicy/cli": patch
"@openpolicy/vite": patch
"@openpolicy/react": patch
"@openpolicy/vue": patch
"@openpolicy/renderers": patch
---

Canonical jurisdiction scheme + UK-GDPR support (OP-209, OP-181).

**Breaking:** `Jurisdiction` values have been replaced with a canonical region-code scheme. Unknown codes are now rejected by the config validator at compile time.

Old union: `"us" | "eu" | "ca" | "au" | "nz" | "other"`
New union: `"eu" | "uk" | "us-ca" | "us-va" | "us-co" | "br" | "ca" | "au" | "jp" | "sg"`

- `"us"` is **removed** — there is no federal US privacy regime shipping content. List specific state codes (e.g. `"us-ca"`) for the states you cover.
- `"ca"` **semantics flipped** from California → Canada. Consumers using `"ca"` for CCPA must migrate to `"us-ca"`. `"ca"` is now a reserved code for Canada and produces no gated content yet.
- `"nz"` and `"other"` are removed.
- New `"uk"` code triggers a UK-GDPR supplement citing the ICO and the Data Protection Act 2018 (closes OP-181).
- Reserved codes `"us-va"`, `"us-co"`, `"br"`, `"ca"`, `"au"`, `"jp"`, `"sg"` are type-valid today but produce no gated content in 0.1.0.
- `Compliance.CCPA` preset now expands to `{ jurisdictions: ["us-ca"] }`. New `Compliance.UK_GDPR` preset provides `{ jurisdictions: ["uk"], legalBasis: ["legitimate_interests"] }`.
- Runtime validator rejects unknown jurisdiction codes with a helpful error listing the full valid set.

Migration: search your `openpolicy.ts` for `jurisdictions: [...]` and replace `"us"` with the specific state(s) you cover, and `"ca"` (if meant as California) with `"us-ca"`. UK-regulated businesses should add `"uk"`.
