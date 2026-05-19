import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vite-plus/test";
import { loadFixtures, partition } from "../test-helpers";
import { parseFile } from "../parser";
import { walk } from "../visit";
import type { Rule } from "../types";
import { cookiesNextRule } from "./cookies-next";
import { jsCookieRule } from "./js-cookie";
import { nextHeadersRule } from "./next-headers";
import { reactCookieRule } from "./react-cookie";
import { setCookieHeaderRule } from "./set-cookie-header";

const RULES_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "__fixtures__", "rules");

const cases: { name: string; rule: Rule }[] = [
	{ name: "js-cookie", rule: jsCookieRule },
	{ name: "cookies-next", rule: cookiesNextRule },
	{ name: "react-cookie", rule: reactCookieRule },
	{ name: "next-headers", rule: nextHeadersRule },
	{ name: "set-cookie-header", rule: setCookieHeaderRule },
];

for (const { name, rule } of cases) {
	describe(`${name} rule`, () => {
		for (const fx of loadFixtures(join(RULES_DIR, name))) {
			it(fx.name, () => {
				const parsed = parseFile(fx.file, fx.source)!;
				const { hits } = walk(parsed, [rule], []);
				const got = partition(hits);
				expect(got.cookies).toHaveLength(fx.expected.cookies.length);
				for (let i = 0; i < fx.expected.cookies.length; i++) {
					expect(got.cookies[i]).toMatchObject(fx.expected.cookies[i]!);
				}
			});
		}
	});
}
