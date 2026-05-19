import { createServerFn } from "@tanstack/react-start";
import type { HighlighterCore, ThemeRegistrationRaw } from "shiki/core";

export type Lang = "ts" | "tsx" | "json" | "bash";

export type HighlightItem = { code: string; lang: Lang };
export type HighlightInput = { items: Array<HighlightItem> };

let highlighterPromise: Promise<HighlighterCore> | null = null;

async function getHighlighter() {
	if (!highlighterPromise) {
		highlighterPromise = (async () => {
			const { createHighlighterCore } = await import("shiki/core");
			const { createOnigurumaEngine } = await import("shiki/engine/oniguruma");
			const monoTheme = (await import("./shiki-mono-theme.json")).default;
			return createHighlighterCore({
				themes: [monoTheme as unknown as ThemeRegistrationRaw],
				langs: [
					import("shiki/langs/typescript.mjs"),
					import("shiki/langs/tsx.mjs"),
					import("shiki/langs/json.mjs"),
					import("shiki/langs/bash.mjs"),
				],
				engine: createOnigurumaEngine(import("shiki/wasm")),
			});
		})();
	}
	return highlighterPromise;
}

export const highlight = createServerFn({ method: "GET" })
	.inputValidator((data: HighlightInput) => data)
	.handler(async ({ data }) => {
		const h = await getHighlighter();
		return data.items.map((item) => h.codeToHtml(item.code, { lang: item.lang, theme: "mono" }));
	});
