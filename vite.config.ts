import { defineConfig } from "vite-plus";

export default defineConfig({
	fmt: {
		useTabs: true,
	},
	test: {
		exclude: ["**/node_modules/**", "**/dist/**", "examples/tanstack/e2e/**"],
	},
	staged: {
		"*.{js,cjs,mjs,jsx,ts,cts,mts,tsx,json,jsonc}": "vp check --fix",
	},
});
