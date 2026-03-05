// @ts-check

import { openPolicy } from "@openpolicy/vite";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
	vite: {
		plugins: [
			openPolicy({
				configs: ["policy.config.ts", "terms.config.ts"],
				formats: ["markdown", "html"],
				outDir: "src/policies",
			}),
		],
	},
});
