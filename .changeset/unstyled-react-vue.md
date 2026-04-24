---
"@openpolicy/react": patch
"@openpolicy/vue": patch
---

Breaking: `@openpolicy/react` and `@openpolicy/vue` no longer ship default
styles. The inline `<style>` injection and the `./styles.css` export have
been removed, the `className`/`class="op-*"` strings are gone, and the
`PolicyTheme` type and `defaultStyles` export are no longer exported.
Components still emit `data-op-*` attributes — use them as styling hooks
(see the TanStack example's `/tailwind` and `/css-vars` routes).

The React peer dependency widens to `>=18`. The `<style precedence>` API
was the only React 19–specific dependency; removing it unblocks React 18
apps (Next.js 14, older shadcn setups).

To restore the old look, copy the CSS from the v0.0.25 release into your
own stylesheet.
