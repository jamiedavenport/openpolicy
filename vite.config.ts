import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite-plus";

export default defineConfig({
	plugins: [svelte()],
	fmt: {
		useTabs: true,
		ignorePatterns: ["**/*.gen.ts"],
	},
	test: {
		exclude: ["**/node_modules/**", "**/dist/**", "examples/tanstack/e2e/**"],
	},
	staged: {
		"*.{js,cjs,mjs,jsx,ts,cts,mts,tsx,json,jsonc}": "vp check --fix",
	},
});
