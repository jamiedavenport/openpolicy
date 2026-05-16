import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite-plus";

export default defineConfig({
	plugins: [svelte({ hot: !process.env.VITEST })],
	// `browser` condition forces Svelte's client build under Vitest so
	// @testing-library/svelte can `mount` consent components (the SSR-only
	// policy tests use svelte/server explicitly and are unaffected).
	resolve: {
		conditions: ["browser"],
	},
});
