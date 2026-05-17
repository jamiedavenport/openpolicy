import { defineConfig } from "vite-plus";

export default defineConfig({
	fmt: {
		useTabs: true,
		// `**/__fixtures__/**`: vendored OpenCookies consent-scanner fixtures
		// (PS-19) are intentionally messy sample sources with frozen
		// `.expected.json` snapshots — never reformat them.
		ignorePatterns: ["**/*.gen.ts", "**/CHANGELOG.md", "**/__fixtures__/**"],
	},
	lint: {
		ignorePatterns: ["**/__fixtures__/**"],
	},
	test: {
		exclude: ["**/node_modules/**", "**/dist/**"],
	},
	staged: {
		// Include md/mdx/css so prose + styles are auto-formatted on commit.
		// `vp check` checks them in CI, so the staged set must match or content
		// edits drift red (the gap that left 21 apps/web files unformatted).
		"*.{js,cjs,mjs,jsx,ts,cts,mts,tsx,json,jsonc,md,mdx,css}": "vp check --fix",
	},
});
