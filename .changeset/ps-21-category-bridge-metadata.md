---
"@openpolicy/core": patch
"@openpolicy/sdk": patch
---

Carry GDPR lawful basis onto the consent `Category` and derive consent-gating from it instead of the category key name.

`Category` (the `@openpolicy/core/consent` runtime type) gains three optional bridge-metadata fields: `lawfulBasis?: LegalBasis`, `vendor?: string`, and `purpose?: string`. The `@openpolicy/sdk/consent` bridge `toOpenCookiesConfig(policy)` now reads `policy.cookies.context[key].lawfulBasis` and:

- carries it through onto each derived `Category.lawfulBasis`, and
- derives `locked` from it — `consent` ⇒ consent-gated (not locked); any other lawful basis (`legal_obligation`, `legitimate_interests`, `contract`, `vital_interests`, `public_task`) ⇒ not gated. An enabled cookie with no declared basis stays gated (privacy-safe; `validate()` already flags this as `cookie-lawful-basis-missing`).

`vendor` / `purpose` are forward-looking slots left unset by the bridge until the scanner / `sharing()` work fills them.

**Behavioral change:** `locked` previously followed the literal `key === "essential"` heuristic. It now follows the declared lawful basis, so a category named `essential` with `lawfulBasis: "consent"` is gated, and a differently-named category with a non-consent basis is locked. Stored consent records are unaffected — `Category` metadata is config-derived and never persisted, so legacy-tolerant record parsing is unchanged. The `@openpolicy/core` `./consent` subpath is unstable pre-1.0 (ADR 0002 §5).
