import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vite-plus/test";
import { scan } from "./scan";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "__fixtures__", "real-world");

const cleanFiles = [
	"calcom/utils.ts",
	"calcom/Button.tsx",
	"documenso/server-utils.ts",
	"documenso/Card.tsx",
];

type Expectation = {
	file: string;
	cookies?: string[];
	vendors?: string[];
};

const expectations: Expectation[] = [
	{ file: "calcom/posthog-provider.tsx", vendors: ["posthog"] },
	{ file: "calcom/auth-cookie.ts", cookies: ["cookies-next"] },
	{ file: "calcom/sentry-init.ts", vendors: ["sentry"] },
	{ file: "calcom/middleware.ts", cookies: [] },
	{ file: "documenso/posthog.ts", vendors: ["posthog"] },
	{ file: "documenso/cookies.ts", cookies: ["next-headers"] },
	{ file: "documenso/route-handler.ts", cookies: ["set-cookie-header"] },
];

describe("real-world snippets", () => {
	it("produces zero hits on clean files", async () => {
		const result = await scan({ cwd: ROOT });
		for (const clean of cleanFiles) {
			const fromFile = [
				...result.cookies.filter((h) => h.file.endsWith(clean)),
				...result.vendors.filter((h) => h.file.endsWith(clean)),
			];
			expect(fromFile, `expected zero hits in ${clean}`).toEqual([]);
		}
	});

	it("detects every expected hit", async () => {
		const result = await scan({ cwd: ROOT });
		for (const exp of expectations) {
			const hits = {
				cookies: result.cookies.filter((h) => h.file.endsWith(exp.file)),
				vendors: result.vendors.filter((h) => h.file.endsWith(exp.file)),
			};
			if (exp.cookies) {
				expect(hits.cookies.map((h) => h.kind).sort(), `cookie kinds in ${exp.file}`).toEqual(
					exp.cookies.slice().sort(),
				);
			}
			if (exp.vendors) {
				for (const v of exp.vendors) {
					expect(
						hits.vendors.map((h) => h.vendor),
						`${v} hit in ${exp.file}`,
					).toContain(v);
				}
			}
		}
	});
});
