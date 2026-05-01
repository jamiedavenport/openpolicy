---
"@openpolicy/vue": patch
---

Rewrite `@openpolicy/vue` with idiomatic Vue 3 internals.

The previous implementation passed children to customizable renderers as both a `children` prop and a default slot, kept all dispatch logic in one 120-line `renderNode` switch, and duplicated config-resolution between `PrivacyPolicy` and `CookiePolicy`. The package is now slot-based throughout, with per-category renderer modules (`renderInline` / `renderBlock` / `renderTable`) and a shared `usePolicyDocument` composable.

The example consumer (`examples/vue`) is unchanged — `OpenPolicy`, `PrivacyPolicy`, and `CookiePolicy` keep the same prop shapes and usage pattern.

Breaking changes:

- `PolicyComponents` no longer types `children` as a prop. Custom renderers (`Section`, `Paragraph`, `List`, `Table*`) must read children from the default slot (e.g. `<slot />` or `slots.default?.()`), matching standard Vue conventions.
- `renderNode` is no longer exported from `@openpolicy/vue`. Use `renderDocument(doc, components?)` as the public entry; it covers every node type internally.
- `DefaultItalic` is now exported alongside the other default renderers (it was defined but missing from the public surface).
