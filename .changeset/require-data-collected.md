---
"@openpolicy/core": patch
"@openpolicy/sdk": patch
"@openpolicy/cli": patch
"@openpolicy/vite": patch
"@openpolicy/react": patch
"@openpolicy/vue": patch
---

**Breaking:** `compile()` now throws when `dataCollected` is empty. Previously, an
empty `dataCollected` produced an "Information We Collect" section with the
intro sentence "We collect the following categories of information:" followed
by an empty list, which fails GDPR's categories-of-data disclosure
requirement. To fix, populate `dataCollected` in your config, or instrument
`collecting()` calls and use `autoCollect()` from `@openpolicy/vite-auto-collect`.
