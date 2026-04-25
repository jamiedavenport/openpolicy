---
"@openpolicy/core": patch
"@openpolicy/sdk": patch
"@openpolicy/cli": patch
"@openpolicy/vite": patch
"@openpolicy/react": patch
"@openpolicy/vue": patch
---

**Breaking:** top-level `dataCollected` moves to `data.collected`, and a sibling `data.purposes` is newly required — one prose string per collected category, disclosing _why_ you process it. Satisfies GDPR Article 13(1)(c), which was previously unaddressed.

`defineConfig` now enforces purpose coverage at type-check time: every key in `data.collected` must have a matching entry in `data.purposes`. The `openPolicy()` Vite plugin emits `openpolicy.gen.ts` next to your `openpolicy.ts`, augmenting a `ScannedCollectionKeys` interface so the same constraint applies to scanned `collecting()` categories. Commit `openpolicy.gen.ts` — that keeps the type-level constraint live in CI without needing to run the Vite plugin first.

Migration: nest `dataCollected` under `data.collected`, then add a `data.purposes` map keyed by the same category names.

```ts
// before
defineConfig({
	dataCollected: { "Account Information": ["Name", "Email"] },
});

// after
defineConfig({
	data: {
		collected: { "Account Information": ["Name", "Email"] },
		purposes: { "Account Information": "To authenticate users and send service notifications" },
	},
});
```
