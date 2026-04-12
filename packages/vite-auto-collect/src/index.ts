import { readFile } from "node:fs/promises";
import { relative, resolve } from "node:path";
import type { Plugin, ViteDevServer } from "vite";
import { extractFromFile, type ThirdPartyEntry } from "./analyse";
import { KNOWN_PACKAGES } from "./known-packages";
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

	thirdParties?: {
		usePackageJson?: boolean;
	};
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
 * the SDK's `dataCollected` sentinel.
 *
 * Internally the plugin intercepts `@openpolicy/sdk`'s own relative import of
 * `./auto-collected` and redirects it to a virtual module whose body is a
 * literal `export const dataCollected = { ... }`. Because the replacement
 * becomes part of the consumer's own module graph, the scanned data survives
 * any downstream bundler boundary (e.g. nitro's SSR output), which a shared
 * module-level registry would not.
 */
export function autoCollect(options: AutoCollectOptions = {}): Plugin {
	const srcDirOpt = options.srcDir ?? "src";
	const extensions = options.extensions ?? [".ts", ".tsx"];
	const ignore = options.ignore ?? [];
	const usePackageJsonOpt = options.thirdParties?.usePackageJson ?? false;
	let resolvedRoot: string;
	let resolvedSrcDir: string;
	let scanned: {
		dataCollected: Record<string, string[]>;
		thirdParties: ThirdPartyEntry[];
	} = { dataCollected: {}, thirdParties: [] };

	async function detectFromPackageJson(
		root: string,
	): Promise<ThirdPartyEntry[]> {
		let raw: string;
		try {
			raw = await readFile(resolve(root, "package.json"), "utf8");
		} catch {
			return [];
		}
		let pkg: {
			dependencies?: Record<string, string>;
			devDependencies?: Record<string, string>;
		};
		try {
			pkg = JSON.parse(raw) as typeof pkg;
		} catch {
			return [];
		}
		const allDeps = {
			...pkg.dependencies,
			...pkg.devDependencies,
		};
		const entries: ThirdPartyEntry[] = [];
		const seenNames = new Set<string>();
		for (const pkgName of Object.keys(allDeps)) {
			const entry = KNOWN_PACKAGES.get(pkgName);
			if (entry && !seenNames.has(entry.name)) {
				seenNames.add(entry.name);
				entries.push(entry);
			}
		}
		return entries;
	}

	async function scanAndMerge(): Promise<typeof scanned> {
		const files = await walkSources(resolvedSrcDir, extensions, ignore);
		const mergedData: Record<string, string[]> = {};
		const mergedParties: ThirdPartyEntry[] = [];
		const seenParties = new Set<string>();
		for (const file of files) {
			let code: string;
			try {
				code = await readFile(file, "utf8");
			} catch {
				continue;
			}
			const extracted = extractFromFile(file, code);
			for (const [category, labels] of Object.entries(
				extracted.dataCollected,
			)) {
				const existing = mergedData[category] ?? [];
				const seen = new Set(existing);
				for (const label of labels) {
					if (!seen.has(label)) {
						existing.push(label);
						seen.add(label);
					}
				}
				mergedData[category] = existing;
			}
			for (const entry of extracted.thirdParties) {
				if (!seenParties.has(entry.name)) {
					seenParties.add(entry.name);
					mergedParties.push(entry);
				}
			}
		}
		if (usePackageJsonOpt) {
			const pkgEntries = await detectFromPackageJson(resolvedRoot);
			for (const entry of pkgEntries) {
				if (!seenParties.has(entry.name)) {
					seenParties.add(entry.name);
					mergedParties.push(entry);
				}
			}
		}
		return { dataCollected: mergedData, thirdParties: mergedParties };
	}

	/**
	 * Returns true when `file` lives inside `resolvedSrcDir` and has one of
	 * the tracked extensions. Used by the dev-server watcher to skip events
	 * for unrelated files (configs, public assets, other packages, etc.).
	 */
	function isTrackedSource(file: string): boolean {
		const rel = relative(resolvedSrcDir, file);
		if (!rel || rel.startsWith("..")) return false;
		return extensions.some((ext) => file.endsWith(ext));
	}

	/**
	 * Re-runs the scan and, if anything changed, invalidates the virtual
	 * module and triggers a full page reload. A full reload is used because
	 * `dataCollected` is spread into the policy config at module-evaluation
	 * time and the result is captured by the React tree as a prop — there's
	 * no clean way to hot-swap it in place.
	 */
	async function rescanAndRefresh(server: ViteDevServer): Promise<void> {
		const next = await scanAndMerge();
		if (JSON.stringify(next) === JSON.stringify(scanned)) return;
		scanned = next;
		const mod = server.moduleGraph.getModuleById(RESOLVED_VIRTUAL_ID);
		if (mod) server.moduleGraph.invalidateModule(mod);
		server.ws.send({ type: "full-reload" });
	}

	return {
		name: "openpolicy-auto-collect",
		enforce: "pre",
		configResolved(config) {
			resolvedRoot = config.root;
			resolvedSrcDir = resolve(config.root, srcDirOpt);
		},
		async buildStart() {
			scanned = await scanAndMerge();
		},
		configureServer(server) {
			// Make sure chokidar watches the whole src tree, not just files
			// already in the module graph. Without this, creating a brand-new
			// source file that nothing imports yet wouldn't fire a watcher
			// event — the very case we most need to re-scan on.
			server.watcher.add(resolvedSrcDir);

			const handler = async (file: string): Promise<void> => {
				if (!isTrackedSource(file)) return;
				// Surface errors via the logger but don't rethrow — an
				// unhandled rejection would crash the watcher process.
				try {
					await rescanAndRefresh(server);
				} catch (error) {
					server.config.logger.error(
						`[openpolicy-auto-collect] rescan failed: ${error}`,
					);
				}
			};

			server.watcher.on("change", handler);
			server.watcher.on("add", handler);
			server.watcher.on("unlink", handler);
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
			return (
				`export const dataCollected = ${JSON.stringify(
					scanned.dataCollected,
				)};\n` +
				`export const thirdParties = ${JSON.stringify(scanned.thirdParties)};\n`
			);
		},
	};
}
