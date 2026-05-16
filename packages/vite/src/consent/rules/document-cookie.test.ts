import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vite-plus/test";
import { loadFixtures, partition, runRule } from "../test-helpers";
import { documentCookieRule } from "./document-cookie";

const FIXTURES = join(
	dirname(fileURLToPath(import.meta.url)),
	"..",
	"__fixtures__",
	"rules",
	"document-cookie",
);

describe("document-cookie rule", () => {
	for (const fx of loadFixtures(FIXTURES)) {
		it(fx.name, () => {
			const hits = runRule(fx.file, fx.source, documentCookieRule);
			const got = partition(hits);
			const expected = fx.expected;
			expect(got.cookies).toHaveLength(expected.cookies.length);
			for (let i = 0; i < expected.cookies.length; i++) {
				expect(got.cookies[i]).toMatchObject(expected.cookies[i]!);
			}
		});
	}
});
