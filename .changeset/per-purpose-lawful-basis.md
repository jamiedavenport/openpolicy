---
"@openpolicy/core": patch
"@openpolicy/sdk": patch
"@openpolicy/vite": patch
"@openpolicy/react": patch
"@openpolicy/vue": patch
---

**Breaking:** `legalBasis` is now `Record<PurposeName, LegalBasis>` (alias `LegalBasisMap`) instead of `LegalBasis | LegalBasis[]`. Each named processing purpose maps to its Article 6 lawful basis, fixing the `lawful-basis-per-purpose` validator error (GDPR Art. 13(1)(c) requires the lawful basis to be stated for each distinct processing purpose).

When any purpose's basis is `"consent"`, the rendered policy now automatically appends a GDPR Art. 13(2)(c) right-to-withdraw paragraph — disclosing the right to withdraw consent at any time without affecting the lawfulness of pre-withdrawal processing. No new config field is required; the disclosure references `company.contact`.

Validation issues now carry a stable `code` field (in addition to `level` and `message`) so consumers can assert on `code` instead of message substrings. The new code `lawful-basis-per-purpose` fires when an EU/UK policy has an empty `legalBasis` map or any purpose with an empty basis. `Compliance.GDPR` and `Compliance.UK_GDPR` presets now expose `legalBasis` as a single-purpose map by default.

Migration:

```ts
// before
defineConfig({
	legalBasis: ["legitimate_interests", "consent"],
});

// after
defineConfig({
	legalBasis: {
		"Providing the service": "legitimate_interests",
		"Marketing communications": "consent",
	},
});
```
