---
"@openpolicy/cli": patch
---

Fix broken `openpolicy` bin in the published package. The CLI's `bin` entry was relying on `publishConfig.bin` to override a dev-only `./src/cli.ts` path to `./dist/cli.js` at publish time, but the override wasn't applied — so the published tarball shipped a bin pointing at a TypeScript source file with no shebang, and invoking `openpolicy` fell through to bash and exited 1. `bin` now points directly at `./dist/cli.js`.
