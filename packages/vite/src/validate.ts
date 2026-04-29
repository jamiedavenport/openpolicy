import {
	expandOpenPolicyConfig,
	type OpenPolicyConfig,
	validateCookiePolicy,
	validateOpenPolicyConfig,
	validatePrivacyPolicy,
	type ValidationIssue,
} from "@openpolicy/core";
import { bundleRequire } from "bundle-require";
import type { Plugin as EsbuildPlugin } from "esbuild";
import {
	AUTO_COLLECTED_SPECIFIER,
	renderAutoCollectedSource,
	type Scanned,
	SDK_PATH_PATTERN,
} from "./scanned";

export type ValidatedConfig = {
	config: OpenPolicyConfig | null;
	issues: ValidationIssue[];
	loadError: Error | null;
};

/**
 * Esbuild plugin that intercepts `@openpolicy/sdk`'s internal `./auto-collected`
 * import and serves the live scanned values. Mirrors the Vite plugin's
 * `resolveId`/`load` pair so validation sees the same merged config the
 * consumer's bundle does.
 */
function autoCollectedShimPlugin(scanned: Scanned): EsbuildPlugin {
	return {
		name: "openpolicy-auto-collected-shim",
		setup(build) {
			build.onResolve({ filter: AUTO_COLLECTED_SPECIFIER }, (args) => {
				if (!args.importer || !SDK_PATH_PATTERN.test(args.importer)) return null;
				return {
					path: args.path,
					namespace: "openpolicy-virtual",
				};
			});
			build.onLoad({ filter: /.*/, namespace: "openpolicy-virtual" }, () => ({
				contents: renderAutoCollectedSource(scanned),
				loader: "js",
			}));
		},
	};
}

/**
 * Loads the user's `openpolicy.ts` via bundle-require with the scanned values
 * shimmed into `@openpolicy/sdk`'s sentinels, then runs every validator
 * exported from `@openpolicy/core` against the resolved config. Issues are
 * deduped by `code + message` because the SDK-shape validator overlaps with
 * the post-expansion privacy/cookie validators on required-field checks.
 *
 * Bundle-require errors (TS syntax errors, missing imports, runtime throws in
 * the user's config module) are surfaced as `loadError` rather than thrown so
 * the caller can decide whether to forward — TS errors should already be
 * caught by the user's type-check pipeline; we don't want to double-report.
 */
export async function loadAndValidateConfig(args: {
	configFile: string;
	scanned: Scanned;
}): Promise<ValidatedConfig> {
	let mod: { default?: OpenPolicyConfig };
	try {
		const result = await bundleRequire({
			filepath: args.configFile,
			// Walk into `@openpolicy/sdk` (and its bundled `@openpolicy/core`)
			// so esbuild sees the SDK's internal `./auto-collected.js` import
			// and the shim plugin can intercept it. Without this override
			// bundle-require externalises every non-relative specifier and
			// our shim never fires — Node would resolve `./auto-collected.js`
			// to the SDK's empty fallback at runtime.
			notExternal: [/^@openpolicy\//],
			esbuildOptions: {
				platform: "node",
				// Esbuild prints to stderr by default. Silence it — we surface
				// failures through `loadError` and the caller decides how to
				// report. Otherwise every config syntax error produces noisy
				// output even when the caller wants to suppress it.
				logLevel: "silent",
				plugins: [autoCollectedShimPlugin(args.scanned)],
			},
		});
		mod = result.mod as { default?: OpenPolicyConfig };
	} catch (err) {
		return {
			config: null,
			issues: [],
			loadError: err instanceof Error ? err : new Error(String(err)),
		};
	}

	const config = mod.default;
	if (!config) {
		return {
			config: null,
			issues: [],
			loadError: new Error(`${args.configFile} has no default export`),
		};
	}

	const issues: ValidationIssue[] = [];
	issues.push(...validateOpenPolicyConfig(config));
	for (const input of expandOpenPolicyConfig(config)) {
		if (input.type === "privacy") issues.push(...validatePrivacyPolicy(input));
		else issues.push(...validateCookiePolicy(input));
	}

	const seen = new Set<string>();
	const deduped: ValidationIssue[] = [];
	for (const issue of issues) {
		const key = `${issue.code}::${issue.message}`;
		if (seen.has(key)) continue;
		seen.add(key);
		deduped.push(issue);
	}

	return {
		config,
		issues: deduped,
		loadError: null,
	};
}

/**
 * Formats a validation issue for terminal output. Prefixes with `[openpolicy]`
 * so users can grep the build log for our messages.
 */
export function formatIssue(issue: ValidationIssue): string {
	return `[openpolicy] ${issue.code}: ${issue.message}`;
}
