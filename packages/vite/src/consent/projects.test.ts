import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vite-plus/test";
import { scan } from "./scan";

const PROJECTS_DIR = join(dirname(fileURLToPath(import.meta.url)), "__fixtures__", "projects");

type Expectation = {
	cookies: { count?: number; minCount?: number; kinds?: string[] };
	vendors: { count?: number; minCount?: number; vendors?: string[] };
	ungated: { min?: number; exact?: number; files?: string[] };
};

const projects = readdirSync(PROJECTS_DIR).filter((p) =>
	statSync(join(PROJECTS_DIR, p)).isDirectory(),
);

describe("integrated projects", () => {
	for (const name of projects) {
		it(name, async () => {
			const dir = join(PROJECTS_DIR, name);
			const expected = JSON.parse(readFileSync(join(dir, "expected.json"), "utf8")) as Expectation;
			const result = await scan({ cwd: dir });

			if (typeof expected.cookies.count === "number") {
				expect(result.cookies).toHaveLength(expected.cookies.count);
			}
			if (typeof expected.cookies.minCount === "number") {
				expect(result.cookies.length).toBeGreaterThanOrEqual(expected.cookies.minCount);
			}
			if (expected.cookies.kinds) {
				expect(result.cookies.map((c) => c.kind).sort()).toEqual(
					expected.cookies.kinds.slice().sort(),
				);
			}

			if (typeof expected.vendors.count === "number") {
				expect(result.vendors).toHaveLength(expected.vendors.count);
			}
			if (typeof expected.vendors.minCount === "number") {
				expect(result.vendors.length).toBeGreaterThanOrEqual(expected.vendors.minCount);
			}
			if (expected.vendors.vendors) {
				for (const v of expected.vendors.vendors) {
					expect(result.vendors.map((h) => h.vendor)).toContain(v);
				}
			}

			if (typeof expected.ungated.min === "number") {
				expect(result.ungated.length).toBeGreaterThanOrEqual(expected.ungated.min);
			}
			if (typeof expected.ungated.exact === "number") {
				expect(result.ungated).toHaveLength(expected.ungated.exact);
			}
			if (expected.ungated.files) {
				for (const f of expected.ungated.files) {
					expect(result.ungated.some((u) => u.file.endsWith(f))).toBe(true);
				}
			}
		});
	}
});
