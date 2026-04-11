/**
 * Module-level registry. Populated by `@openpolicy/vite-auto-collect`'s
 * `buildStart` hook before `@openpolicy/vite` imports the user's
 * `openpolicy.ts` config, so `autoCollected()` reads fresh data each build.
 */
let registry: Record<string, string[]> = {};

/**
 * Returns a snapshot of all `collecting()` call sites discovered by
 * `@openpolicy/vite-auto-collect` during the current build. Outside of a
 * Vite build (tests, ad-hoc imports) this returns `{}` silently — it is
 * safe to spread into `dataCollected` in any context.
 *
 * Designed to be spread into `dataCollected` so static and scanned entries
 * can coexist:
 *
 * @example
 * ```ts
 * import { defineConfig, autoCollected } from "@openpolicy/sdk";
 *
 * export default defineConfig({
 *   privacy: {
 *     dataCollected: {
 *       ...autoCollected(),
 *       "Manually-tracked Category": ["Field A"],
 *     },
 *   },
 * });
 * ```
 */
export function autoCollected(): Record<string, string[]> {
	return Object.fromEntries(
		Object.entries(registry).map(([k, v]) => [k, [...v]]),
	);
}

/**
 * Internal — consumed only by `@openpolicy/vite-auto-collect`. Not part of
 * the stable public surface. The leading underscores discourage user calls.
 */
export function __setAutoCollectedRegistry(
	next: Record<string, string[]>,
): void {
	registry = Object.fromEntries(
		Object.entries(next).map(([k, v]) => [k, [...v]]),
	);
}
