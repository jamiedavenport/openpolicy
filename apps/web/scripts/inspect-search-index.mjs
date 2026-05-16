#!/usr/bin/env node
// Decompress every Pagefind fragment in the most recent build and print
// `<url>\t<title>` for each indexed page. Use this to confirm the URLs the
// search index points at without spinning up a browser.
//
//   pnpm build && node scripts/inspect-search-index.mjs

import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const ROOT = path.resolve(import.meta.dirname, "..");
const SEARCH_ROOTS = [
	".output/public/pagefind",
	".vercel/output/static/pagefind",
	".netlify/static/pagefind",
	".netlify/v1/static/pagefind",
];

const root = SEARCH_ROOTS.map((p) => path.join(ROOT, p)).find((p) => fs.existsSync(p));
if (!root) {
	console.error(
		`[inspect] no pagefind output directory found. Looked in: ${SEARCH_ROOTS.join(", ")}`,
	);
	process.exit(1);
}

const fragmentDir = path.join(root, "fragment");
const files = fs.readdirSync(fragmentDir).filter((f) => f.endsWith(".pf_fragment"));
const rows = [];

for (const file of files) {
	const raw = fs.readFileSync(path.join(fragmentDir, file));
	const text = zlib.gunzipSync(raw).toString("utf8");
	// Each fragment is prefixed with `pagefind_dcd` followed by JSON
	const json = text.replace(/^[^{]*/, "");
	try {
		const parsed = JSON.parse(json);
		rows.push({
			url: parsed.url,
			title: parsed.meta?.title ?? "(no title)",
		});
	} catch {
		rows.push({ url: "(parse error)", title: file });
	}
}

rows.sort((a, b) => a.url.localeCompare(b.url));
console.log(
	`[inspect] ${rows.length} indexed page${rows.length === 1 ? "" : "s"} in ${path.relative(ROOT, root)}\n`,
);
for (const r of rows) {
	console.log(`${r.url}\t${r.title}`);
}
