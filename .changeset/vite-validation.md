---
"@openpolicy/sdk": patch
"@openpolicy/core": patch
"@openpolicy/vite": patch
"@openpolicy/cli": patch
"@openpolicy/react": patch
"@openpolicy/vue": patch
"@openpolicy/renderers": patch
---

The `openPolicy()` Vite plugin now runs the validators from `@openpolicy/core` against your resolved `openpolicy.ts` on every build. Errors that previously only fired when you called `validateOpenPolicyConfig()` manually (missing `effectiveDate`, GDPR lawful basis incomplete, retention missing, etc.) now surface inline:

- `vite build` aborts with a non-zero exit code listing `[openpolicy] code: message` for each error. Warnings (CCPA phone, DPO disclosure, etc.) print via Rollup's warning channel without blocking.
- `vite dev` streams both errors and warnings to the dev-server logger. HMR keeps working — fix the issues and the next save replays validation.

Validation runs against the _resolved_ config — auto-collected `collecting()` / `defineCookie()` data is shimmed in via the same path the consumer's bundle uses, so a scanned category without a matching `data.context` entry now fails validation at build time, not just at type-check.

If you want the auto-collect virtual module without the validation step, opt out:

```ts
// vite.config.ts
openPolicy({ validate: false });
```

Internally this adds `bundle-require` (the same primitive Vite uses for `vite.config.ts`) and `@openpolicy/core` as runtime dependencies of `@openpolicy/vite`.
