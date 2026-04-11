/**
 * Placeholder populated by `@openpolicy/vite-auto-collect` during a Vite
 * build. The plugin intercepts this module's resolution and replaces it with
 * the scanned categories, so the literal default below is only used as a
 * fallback when no auto-collect plugin is active — in which case spreading
 * it into `dataCollected` is a no-op.
 *
 * @example
 * ```ts
 * import { dataCollected, defineConfig } from "@openpolicy/sdk";
 *
 * export default defineConfig({
 *   privacy: {
 *     dataCollected: {
 *       ...dataCollected,
 *       "Manually-tracked Category": ["Field A"],
 *     },
 *   },
 * });
 * ```
 */
export const dataCollected: Record<string, string[]> = {};
