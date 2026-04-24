/**
 * Populated by `@openpolicy/vite` during a Vite build from `collecting()` calls
 * across the project. The plugin also emits `openpolicy.gen.ts` (alongside
 * your `openpolicy.ts`, meant to be committed) which augments
 * `ScannedCollectionKeys` so `defineConfig` requires `data.purposes` to cover
 * every scanned key.
 *
 * @example
 * ```ts
 * import { dataCollected, defineConfig } from "@openpolicy/sdk";
 *
 * export default defineConfig({
 *   data: {
 *     collected: dataCollected,
 *     purposes: {
 *       "Account Information": "To authenticate users",
 *     },
 *   },
 * });
 * ```
 */
export const dataCollected: Record<keyof ScannedCollectionKeys & string, string[]> = {} as Record<
	keyof ScannedCollectionKeys & string,
	string[]
>;

/**
 * Augmented by `openpolicy.gen.ts` (emitted by `@openpolicy/vite` alongside
 * your config, meant to be committed) with one key per scanned `collecting()`
 * category. `defineConfig` reads this interface to require a `data.purposes`
 * entry for every scanned key.
 */
// biome-ignore lint/suspicious/noEmptyInterface: augmented by codegen
export interface ScannedCollectionKeys {}

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
