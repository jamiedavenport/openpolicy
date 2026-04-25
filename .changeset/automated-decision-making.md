---
"@openpolicy/core": patch
"@openpolicy/sdk": patch
"@openpolicy/vite": patch
"@openpolicy/react": patch
"@openpolicy/vue": patch
---

Adds `automatedDecisionMaking` to fix the GDPR Art. 13(2)(f) / Art. 22 validator error (`automated-decision-making`). Each entry declares one activity with `name`, `logic`, and `significance` fields; an empty array `[]` explicitly declares that no automated decision-making is used.

Under EU/UK jurisdictions, the rendered privacy policy now includes an "Automated Decision-Making and Profiling" section, and validation emits a warning if the field is omitted entirely (controllers must make an explicit declaration either way). When at least one activity is listed, the section automatically appends the Art. 22(3) right-to-human-review paragraph referencing `company.contact`.

Example:

```ts
defineConfig({
	// ... existing fields ...
	automatedDecisionMaking: [], // explicit "we don't"
	// or:
	automatedDecisionMaking: [
		{
			name: "Fraud scoring",
			logic:
				"Transactions are scored by a rules engine combining device fingerprint and historical patterns.",
			significance:
				"A high score may delay or decline a transaction; you can request human review.",
		},
	],
});
```
