/**
 * Placeholder populated by `@openpolicy/vite` during a Vite
 * build. The plugin intercepts this module's resolution and replaces it with
 * the scanned categories, so the literal default below is only used as a
 * fallback when the plugin is not active — in which case spreading
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

/**
 * Placeholder populated by `@openpolicy/vite` during a Vite
 * build. The plugin intercepts this module's resolution and replaces it with
 * the third-party services discovered via `thirdParty()` calls, so the literal
 * default below is only used as a fallback when no auto-collect plugin is
 * active — in which case spreading it into `thirdParties` is a no-op.
 *
 * @example
 * ```ts
 * import { thirdParties, defineConfig } from "@openpolicy/sdk";
 *
 * export default defineConfig({
 *   privacy: {
 *     thirdParties: [
 *       ...thirdParties,
 *       { name: "Manually-added Service", purpose: "Analytics", policyUrl: "https://example.com/privacy" },
 *     ],
 *   },
 * });
 * ```
 */
export const thirdParties: {
	name: string;
	purpose: string;
	policyUrl: string;
}[] = [];

/**
 * Placeholder populated by `@openpolicy/vite` during a Vite build. The plugin
 * intercepts this module's resolution and replaces it with the cookie
 * categories discovered via `defineCookie()` calls, `<ConsentGate>` usage,
 * `useCookies().has()` lookups, and optionally the project's `package.json`.
 * The literal default below is only used as a fallback when no plugin is
 * active — `essential` is always true; other categories default to false.
 *
 * @example
 * ```ts
 * import { cookies, defineConfig } from "@openpolicy/sdk";
 *
 * export default defineConfig({
 *   company: { ... },
 *   effectiveDate: "2026-01-01",
 *   jurisdictions: ["eu", "us-ca"],
 *   cookies,
 * });
 * ```
 */
export const cookies: { essential: boolean; [key: string]: boolean } = {
	essential: true,
};
