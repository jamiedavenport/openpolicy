// Snapshots the two canonical generated artifacts to disk: the `llms.txt` that
// `@policystack/sdk` ships (PS-27) and the repo-root `plugin/` skill-pack tree
// + marketplace manifest (PS-32). Runs after `vp pack` so it reads the same
// built artifact consumers import. The single source of truth is
// `renderLlmsTxt()` / `renderSkillPack()` in src/; this only writes their
// output to disk. `llms.test.ts` and `skills.test.ts` guard the snapshots.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { renderLlmsTxt, renderSkillPack } from "../dist/index.js";

const here = dirname(fileURLToPath(import.meta.url));

const llmsOut = join(here, "..", "llms.txt");
writeFileSync(llmsOut, renderLlmsTxt());
process.stdout.write(`Wrote ${llmsOut}\n`);

const repoRoot = join(here, "..", "..", "..");
for (const { path, content } of renderSkillPack()) {
	const out = join(repoRoot, path);
	mkdirSync(dirname(out), { recursive: true });
	writeFileSync(out, content);
	process.stdout.write(`Wrote ${out}\n`);
}
