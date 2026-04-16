---
"@openpolicy/sdk": minor
"@openpolicy/vite-auto-collect": minor
---

`collecting()` label record keys are now required — every key of `value` must appear in the label record. To exclude a field from the compiled privacy policy, pass the new `Ignore` sentinel (re-exported from `@openpolicy/sdk`) as the value: `{ name: "Name", hashedPassword: Ignore }`. The build-time analyser in `@openpolicy/vite-auto-collect` recognises `Ignore` (including renamed imports) and drops those fields from the compiled labels.
