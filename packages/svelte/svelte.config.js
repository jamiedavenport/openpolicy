import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

// Svelte config consumed by @sveltejs/package and svelte-check.
const config = {
	preprocess: vitePreprocess(),
	compilerOptions: {
		runes: true,
	},
};

export default config;
