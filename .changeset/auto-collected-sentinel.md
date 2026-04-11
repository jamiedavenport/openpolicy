---
"@openpolicy/sdk": patch
"@openpolicy/vite-auto-collect": patch
---

Add `autoCollected` sentinel to `@openpolicy/sdk` and new `@openpolicy/vite-auto-collect` Vite plugin that scans source files for `collecting()` calls and inlines the discovered categories into the sentinel at build time. Spread `autoCollected` into `dataCollected` in your `openpolicy.ts` — the plugin composes cleanly without requiring `@openpolicy/vite`.
