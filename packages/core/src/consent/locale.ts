import type { OpenCookiesConfig } from "./types";

export function resolveLocale(config: OpenCookiesConfig): string {
	if (config.locale) return config.locale;
	const nav = (globalThis as { navigator?: { language?: string } }).navigator;
	return nav?.language ?? "en";
}
