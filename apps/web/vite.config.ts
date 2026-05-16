import { defineConfig } from "vite-plus";
import { devtools } from "@tanstack/devtools-vite";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";

import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";
import contentCollections from "@content-collections/vite";

const ogDevStripPng = {
	name: "og-dev-strip-png",
	apply: "serve" as const,
	configureServer(server: { middlewares: { use: (fn: unknown) => void } }) {
		server.middlewares.use((req: { url?: string }, _res: unknown, next: () => void) => {
			if (req.url) {
				const m = req.url.match(/^(\/og\/[^?]*)\.png(\?.*)?$/);
				if (m) req.url = m[1] + (m[2] ?? "");
			}
			next();
		});
	},
};

const config = defineConfig({
	resolve: { tsconfigPaths: true },
	optimizeDeps: { exclude: ["@resvg/resvg-js"] },
	ssr: {
		external: ["@resvg/resvg-js"],
		optimizeDeps: { exclude: ["@resvg/resvg-js"] },
	},
	plugins: [
		devtools(),
		tailwindcss(),
		contentCollections(),
		ogDevStripPng,
		tanstackStart(),
		nitro({ rollupConfig: { external: [/^@sentry\//] } }),
		// react's vite plugin must come after start's vite plugin
		viteReact(),
	],
});

export default config;
