import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
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
 * Marker returned from `resolveId` so `load` can recognise a hit. The leading
 * NUL prefix is the Rollup/Vite convention for virtual IDs so other plugins
 * leave it alone.
 */
const RESOLVED_VIRTUAL_ID = "\0virtual:openpolicy/auto-collected";

/**
 * Matches any path that lives inside the `@openpolicy/sdk` package, whether
 * it's resolved via a workspace symlink (`.../packages/sdk/...`) or a
 * published `node_modules` install (`.../@openpolicy/sdk/...`). Used to scope
 * the `./auto-collected` relative-import interception to the SDK itself.
 */
const SDK_PATH_PATTERN = /[\\/](?:@openpolicy[\\/]sdk|packages[\\/]sdk)[\\/]/;

/**
 * Matches the relative specifier the SDK uses for its own internal
 * `./auto-collected` import. Both the source form (`./auto-collected`) and
 * the published dist form (`./auto-collected.js`) need to be intercepted:
 * the former applies when consumers resolve the SDK via its workspace
 * source, the latter when resolving against `dist/` with the separate
 * `auto-collected.js` chunk.
 */
const AUTO_COLLECTED_SPECIFIER = /^\.\/auto-collected(?:\.js)?$/;

/**
 * Vite plugin that scans source files for `@openpolicy/sdk` `collecting()`
 * calls at the start of each build and inlines the discovered categories into
 * the SDK's `autoCollected` sentinel.
 *
 * Internally the plugin intercepts `@openpolicy/sdk`'s own relative import of
 * `./auto-collected` and redirects it to a virtual module whose body is a
 * literal `export const autoCollected = { ... }`. Because the replacement
 * becomes part of the consumer's own module graph, the scanned data survives
 * any downstream bundler boundary (e.g. nitro's SSR output), which a shared
 * module-level registry would not.
 */
export function autoCollect(options: AutoCollectOptions = {}): Plugin {
	const srcDirOpt = options.srcDir ?? "src";
	const extensions = options.extensions ?? [".ts", ".tsx"];
	const ignore = options.ignore ?? [];
	let resolvedSrcDir: string;
	let scanned: Record<string, string[]> = {};

	async function scanAndMerge(): Promise<Record<string, string[]>> {
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
		return merged;
	}

	return {
		name: "openpolicy-auto-collect",
		enforce: "pre",
		configResolved(config) {
			resolvedSrcDir = resolve(config.root, srcDirOpt);
		},
		async buildStart() {
			scanned = await scanAndMerge();
		},
		async resolveId(source, importer, resolveOptions) {
			if (!importer || !AUTO_COLLECTED_SPECIFIER.test(source)) return null;
			// Defer to Vite's resolver first so we only redirect when the
			// relative specifier actually points inside @openpolicy/sdk.
			const resolved = await this.resolve(source, importer, {
				...resolveOptions,
				skipSelf: true,
			});
			if (!resolved) return null;
			if (!SDK_PATH_PATTERN.test(resolved.id)) return null;
			return RESOLVED_VIRTUAL_ID;
		},
		load(id) {
			if (id !== RESOLVED_VIRTUAL_ID) return null;
			return `export const autoCollected = ${JSON.stringify(scanned)};\n`;
		},
	};
}
