---
"@openpolicy/core": patch
---

Promote the GDPR Article 7(3) right-to-withdraw-consent disclosure to its own `consent-withdrawal` section under EU / UK jurisdictions, and broaden the trigger so it also fires when only cookies use `consent` as their lawful basis.

Resolves the `right-to-withdraw-consent` validator error. Previously the disclosure was an inline paragraph inside `legal-basis` that only fired when at least one `data.lawfulBasis` entry was `consent` — meaning configs where consent was used solely for cookies (or where consent records were retained on a `legal_obligation` basis) silently lost the disclosure.
