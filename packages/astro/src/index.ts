import type { OpenPolicyOptions } from "@openpolicy/vite";
import { openPolicy as openPolicyVite } from "@openpolicy/vite";
import type { AstroIntegration } from "astro";

export type { OpenPolicyOptions };

export function openPolicy(options: OpenPolicyOptions = {}): AstroIntegration {
	return {
		name: "@openpolicy/astro",
		hooks: {
			"astro:config:setup": ({ updateConfig }) => {
				updateConfig({
					vite: {
						// biome-ignore lint/suspicious/noExplicitAny: Cast needed: astro bundles its own vite version, causing Plugin type mismatch
						plugins: [openPolicyVite(options) as any],
					},
				});
			},
		},
	};
}

export default openPolicy;
