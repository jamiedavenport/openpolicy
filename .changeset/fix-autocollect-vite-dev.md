---
"@openpolicy/vite-auto-collect": patch
---

Fix `dataCollected` / `thirdParties` being empty under the Vite dev server.
The plugin now excludes `@openpolicy/sdk` from Vite's dep pre-bundler
(both `optimizeDeps.exclude` and `ssr.optimizeDeps.exclude`), so the
plugin's `resolveId`/`load` interception of the SDK's internal
`./auto-collected.js` import fires in dev the same way it already does
under `vite build`. Fixes OSS-7 / #57.
