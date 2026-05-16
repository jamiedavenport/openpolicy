import { readFileSync, readdirSync, statSync } from "node:fs";
import { basename, extname, join, relative } from "node:path";
import { parseFile } from "./parser";
import type { Hit, Rule, ScanResult, Ungated, VendorRegistry } from "./types";
import { walk } from "./visit";

export function runRule(file: string, source: string, rule: Rule): Hit[] {
	return runRules(file, source, [rule]);
}

export function runRules(
	file: string,
	source: string,
	rules: Rule[],
	registry: VendorRegistry = [],
): Hit[] {
	const parsed = parseFile(file, source);
	if (!parsed) return [];
	return walk(parsed, rules, registry).hits;
}

type FixtureCase = {
	name: string;
	file: string;
	source: string;
	expected: ScanResult;
};

export function loadFixtures(dir: string): FixtureCase[] {
	const out: FixtureCase[] = [];
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry);
		if (!statSync(full).isFile()) continue;
		if (entry.endsWith(".expected.json")) continue;
		const ext = extname(entry);
		if (![".ts", ".tsx", ".js", ".jsx", ".vue", ".svelte"].includes(ext)) continue;
		const stem = basename(entry, ext);
		const expectedPath = join(dir, `${stem}.expected.json`);
		const source = readFileSync(full, "utf8");
		let expected: ScanResult = { cookies: [], vendors: [], ungated: [] };
		try {
			expected = JSON.parse(readFileSync(expectedPath, "utf8")) as ScanResult;
		} catch {
			// expected may be omitted for "should-not-match" cases
		}
		out.push({ name: stem, file: relative(process.cwd(), full), source, expected });
	}
	return out.sort((a, b) => a.name.localeCompare(b.name));
}

export function partition(hits: Hit[], ungated: Ungated[] = []): ScanResult {
	const cookies: ScanResult["cookies"] = [];
	const vendors: ScanResult["vendors"] = [];
	for (const h of hits) {
		if ("kind" in h) cookies.push(h);
		else vendors.push(h);
	}
	return { cookies, vendors, ungated };
}
