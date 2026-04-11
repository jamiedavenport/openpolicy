import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { __setAutoCollectedRegistry } from "@openpolicy/sdk";
import type { Plugin } from "vite";
import { extractCollecting } from "./analyse";
import { walkSources } from "./scan";

export type AutoCollectOptions = {
	/**
	 * Directory walked for `collecting()` calls. Resolved relative to the
	 * Vite project root. Defaults to `"src"`.
	 */
	srcDir?: string;
	/**
	 * File extensions scanned. Defaults to `[".ts", ".tsx"]`.
	 */
	extensions?: string[];
	/**
	 * Extra directory names skipped during the walk. Appended to the built-in
	 * defaults (`node_modules`, `dist`, `.git`, `.next`, `.output`,
	 * `.svelte-kit`, `.cache`).
	 */
	ignore?: string[];
};

/**
 * Vite plugin that scans source files for `@openpolicy/sdk` `collecting()`
 * calls at the start of each build and populates the `autoCollected()`
 * sentinel exported from `@openpolicy/sdk`, so the `@openpolicy/vite` plugin
 * can render the discovered categories into the compiled privacy policy.
 *
 * Place this plugin **before** `openPolicy()` in `vite.config.ts` — Vite runs
 * `buildStart` hooks sequentially in plugin order, and the `openPolicy()`
 * plugin imports the user's `openpolicy.ts` inside its own `buildStart`, so
 * the registry must already be populated by then.
 */
export function autoCollect(options: AutoCollectOptions = {}): Plugin {
	const srcDirOpt = options.srcDir ?? "src";
	const extensions = options.extensions ?? [".ts", ".tsx"];
	const ignore = options.ignore ?? [];
	let resolvedSrcDir: string;

	async function scanAndPopulate(): Promise<void> {
		const files = await walkSources(resolvedSrcDir, extensions, ignore);
		const merged: Record<string, string[]> = {};
		for (const file of files) {
			let code: string;
			try {
				code = await readFile(file, "utf8");
			} catch {
				continue;
			}
			const extracted = extractCollecting(file, code);
			for (const [category, labels] of Object.entries(extracted)) {
				const existing = merged[category] ?? [];
				const seen = new Set(existing);
				for (const label of labels) {
					if (!seen.has(label)) {
						existing.push(label);
						seen.add(label);
					}
				}
				merged[category] = existing;
			}
		}
		__setAutoCollectedRegistry(merged);
	}

	return {
		name: "openpolicy-auto-collect",
		configResolved(config) {
			resolvedSrcDir = resolve(config.root, srcDirOpt);
		},
		async buildStart() {
			await scanAndPopulate();
		},
	};
}
