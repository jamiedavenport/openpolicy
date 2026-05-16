import { readFile } from "node:fs/promises";
import { parseFile } from "./parser";
import { applySuppressions } from "./suppress";
import { defaultRules, defaultVendors, scan } from "./scan";
import {
	formatHitLocation,
	formatUngated,
	type Logger,
	type Mode,
	report,
	reportFileDelta,
} from "./reporter";
import type { Hit, ScanResult, Ungated } from "./types";
import { walk } from "./visit";

/**
 * Co-located OpenCookies consent scanner (PS-19). Structural fold only: this is
 * a *second, separate* oxc walk + `tinyglobby` discovery living inside the one
 * `openPolicy()` plugin — it never touches `openpolicy.gen.ts` and contributes
 * no policy data. Unifying it with the policy walk is PS-25.
 *
 * Behaviour preserved verbatim from the old standalone `@opencookies/vite`
 * plugin: full scan on `buildStart`, per-file delta on dev rescans, and a
 * build-failing throw from `buildEnd` when `mode === "error"`.
 */
export type ConsentRunnerOptions = {
	root: string;
	mode: Mode;
	include?: string[];
	exclude?: string[];
};

export type ConsentRunner = {
	/** Full scan + report. Called from the plugin's `buildStart`. */
	build(logger: Logger): Promise<void>;
	/** Single-file rescan + ungated delta. Called from the dev watcher. */
	hotUpdate(file: string, logger: Logger): Promise<void>;
	/** Throws on remaining ungated findings when `mode === "error"`. */
	buildEnd(buildError?: Error): void;
};

export function createConsentRunner(opts: ConsentRunnerOptions): ConsentRunner {
	let lastScan: ScanResult | undefined;
	const ungatedByFile = new Map<string, Ungated[]>();
	const cookiesByFile = new Map<string, Hit[]>();
	const vendorsByFile = new Map<string, Hit[]>();

	function indexResult(result: ScanResult): void {
		ungatedByFile.clear();
		cookiesByFile.clear();
		vendorsByFile.clear();
		for (const u of result.ungated) push(ungatedByFile, u.hit.file, u);
		for (const c of result.cookies) push(cookiesByFile, c.file, c);
		for (const v of result.vendors) push(vendorsByFile, v.file, v);
	}

	return {
		async build(logger: Logger): Promise<void> {
			if (opts.mode === "off") return;
			const result = await scan({
				cwd: opts.root,
				include: opts.include,
				exclude: opts.exclude,
			});
			lastScan = result;
			indexResult(result);
			report(result, logger, { mode: opts.mode, root: opts.root });
		},

		async hotUpdate(file: string, logger: Logger): Promise<void> {
			if (opts.mode === "off") return;
			if (!shouldScan(file)) return;

			let source: string;
			try {
				source = await readFile(file, "utf8");
			} catch {
				return;
			}

			const fileResult = scanOneFile(file, source);
			if (!fileResult) return;

			const prevUngated = ungatedByFile.get(file) ?? [];

			if (fileResult.cookies.length === 0 && fileResult.vendors.length === 0) {
				cookiesByFile.delete(file);
				vendorsByFile.delete(file);
			} else {
				cookiesByFile.set(file, fileResult.cookies);
				vendorsByFile.set(file, fileResult.vendors);
			}
			if (fileResult.ungated.length === 0) ungatedByFile.delete(file);
			else ungatedByFile.set(file, fileResult.ungated);

			lastScan = rebuildResult(cookiesByFile, vendorsByFile, ungatedByFile);

			reportFileDelta(prevUngated, fileResult.ungated, logger, {
				mode: opts.mode,
				root: opts.root,
				file,
			});
		},

		buildEnd(buildError?: Error): void {
			if (buildError) return;
			if (opts.mode !== "error") return;
			const result = lastScan;
			if (!result || result.ungated.length === 0) return;
			const first = result.ungated[0]!;
			const loc = formatHitLocation(first.hit, opts.root);
			const summary = formatUngated(first, opts.root);
			const more = result.ungated.length > 1 ? ` (+${result.ungated.length - 1} more)` : "";
			throw new Error(`[opencookies] ungated finding at ${loc}${more}\n${summary}`);
		},
	};
}

function push<T>(map: Map<string, T[]>, key: string, value: T): void {
	const arr = map.get(key);
	if (arr) arr.push(value);
	else map.set(key, [value]);
}

function shouldScan(file: string): boolean {
	return /\.(?:[mc]?[jt]sx?|vue|svelte)$/.test(file);
}

type FileScanResult = {
	cookies: Hit[];
	vendors: Hit[];
	ungated: Ungated[];
};

function scanOneFile(file: string, source: string): FileScanResult | null {
	const parsed = parseFile(file, source);
	if (!parsed) return null;
	const result = walk(parsed, defaultRules, defaultVendors);
	const filtered = applySuppressions(result.hits, parsed.comments);
	const kept = new Set(filtered);
	const cookies: Hit[] = [];
	const vendors: Hit[] = [];
	for (const h of filtered) {
		if ("kind" in h) cookies.push(h);
		else vendors.push(h);
	}
	const ungated = result.ungated.filter((u: Ungated) => kept.has(u.hit));
	return { cookies, vendors, ungated };
}

function rebuildResult(
	cookiesByFile: Map<string, Hit[]>,
	vendorsByFile: Map<string, Hit[]>,
	ungatedByFile: Map<string, Ungated[]>,
): ScanResult {
	const cookies: ScanResult["cookies"] = [];
	const vendors: ScanResult["vendors"] = [];
	const ungated: Ungated[] = [];
	for (const arr of cookiesByFile.values()) {
		for (const h of arr) if ("kind" in h) cookies.push(h);
	}
	for (const arr of vendorsByFile.values()) {
		for (const h of arr) if (!("kind" in h)) vendors.push(h);
	}
	for (const arr of ungatedByFile.values()) ungated.push(...arr);
	cookies.sort(orderHits);
	vendors.sort(orderHits);
	ungated.sort((a, b) => (a.file === b.file ? a.line - b.line : a.file.localeCompare(b.file)));
	return { cookies, vendors, ungated };
}

function orderHits(
	a: { file: string; line: number; column: number },
	b: { file: string; line: number; column: number },
): number {
	if (a.file !== b.file) return a.file.localeCompare(b.file);
	if (a.line !== b.line) return a.line - b.line;
	return a.column - b.column;
}
