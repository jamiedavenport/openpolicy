---
"@openpolicy/cli": patch
---

Bundle `citty` and `consola` into the CLI's `dist/cli.js` and drop them from runtime `dependencies`. The published tarball now ships a single self-contained binary, so installing `@openpolicy/cli` no longer pulls in a dep tree (~470K → one ~126K file) and consumers can't end up on a mismatched dependency version.
