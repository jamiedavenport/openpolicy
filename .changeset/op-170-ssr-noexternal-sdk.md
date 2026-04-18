---
"@openpolicy/vite-auto-collect": patch
---

Fix `dataCollected` / `thirdParties` being empty in SSR builds (e.g. TanStack Start + Nitro).
The plugin now pins `@openpolicy/sdk` to `ssr.noExternal` so Vite bundles the SDK into the
server build and the plugin's `resolveId` / `load` interception of `./auto-collected.js`
fires server-side the same way it already does on the client. Resolves empty config passed
to `@openpolicy/plus`'s `client.consent()` from server functions and the flash of empty
privacy data during hydration (OP-170).
