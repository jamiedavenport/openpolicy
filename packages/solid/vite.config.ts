import solid from "vite-plugin-solid";
import { defineConfig } from "vite-plus";

export default defineConfig({
	plugins: [solid({ ssr: false })],
	resolve: {
		conditions: ["browser", "development"],
		alias: {
			"solid-js/web": "solid-js/web/dist/dev.js",
			"solid-js/store": "solid-js/store/dist/dev.js",
			"solid-js": "solid-js/dist/dev.js",
		},
	},
	test: {
		environment: "happy-dom",
		server: {
			deps: {
				inline: [/solid-js/, /@solidjs\//, /@testing-library\//],
			},
		},
	},
});
