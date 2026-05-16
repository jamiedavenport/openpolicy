import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vite-plus/test";
import { scan } from "./scan";

// Encodes PS-19's acceptance criterion as a regression test: the one canonical
// scanner-wired example must stay "green" — i.e. the folded consent scanner
// finds zero ungated cookie/vendor usage in it. src/consent → src → vite →
// packages → repo root → examples/tanstack.
const EXAMPLE = join(
	dirname(fileURLToPath(import.meta.url)),
	"..",
	"..",
	"..",
	"..",
	"examples",
	"tanstack",
);

describe("canonical example stays green", () => {
	it("has zero ungated consent findings", async () => {
		const result = await scan({ cwd: EXAMPLE });
		expect(result.ungated).toEqual([]);
	});
});
