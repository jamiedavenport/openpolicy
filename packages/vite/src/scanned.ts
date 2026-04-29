import type { ThirdPartyEntry } from "./analyse";

export type CookieMap = { essential: boolean; [key: string]: boolean };

export type Scanned = {
	dataCollected: Record<string, string[]>;
	thirdParties: ThirdPartyEntry[];
	cookies: CookieMap;
};

/**
 * Source body of the SDK's `./auto-collected` module with the live scanned
 * values inlined. Shared between the Vite `load` hook (consumer's module
 * graph) and the bundle-require esbuild plugin used by the validation step
 * (out-of-band Node import). Keeps the sentinel shape in one place.
 */
export function renderAutoCollectedSource(scanned: Scanned): string {
	return (
		`export const dataCollected = ${JSON.stringify(scanned.dataCollected)};\n` +
		`export const thirdParties = ${JSON.stringify(scanned.thirdParties)};\n` +
		`export const cookies = ${JSON.stringify(scanned.cookies)};\n`
	);
}

/**
 * Matches any path that lives inside the `@openpolicy/sdk` package, whether
 * it's resolved via a workspace symlink (`.../packages/sdk/...`) or a
 * published `node_modules` install (`.../@openpolicy/sdk/...`). Used to scope
 * the `./auto-collected` relative-import interception to the SDK itself.
 */
export const SDK_PATH_PATTERN = /[\\/](?:@openpolicy[\\/]sdk|packages[\\/]sdk)[\\/]/;

/**
 * Matches the relative specifier the SDK uses for its own internal
 * `./auto-collected` import. Both the source form (`./auto-collected`) and
 * the published dist form (`./auto-collected.js`) need to be intercepted.
 */
export const AUTO_COLLECTED_SPECIFIER = /^\.\/auto-collected(?:\.js)?$/;
