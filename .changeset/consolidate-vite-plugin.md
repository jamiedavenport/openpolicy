---
"@openpolicy/vite": patch
---

**Breaking:** consolidate the two Vite plugins into a single `@openpolicy/vite`.

- `@openpolicy/vite-auto-collect` and `@openpolicy/astro` are removed from the monorepo. Their published npm versions will be deprecated separately.
- `@openpolicy/vite`'s `openPolicy()` no longer writes policy files. Its options are now `{ srcDir, extensions, ignore, thirdParties }` — identical to the former `autoCollect()`. Use `openpolicy generate` (CLI) if you still need static HTML/Markdown output.
- Astro users should add the Vite plugin directly via `astro.config.mjs` → `vite.plugins: [openPolicy()]`, or compile policies in page frontmatter with `@openpolicy/core`.
