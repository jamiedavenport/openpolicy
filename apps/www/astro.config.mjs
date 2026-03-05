// @ts-check

import sitemap from "@astrojs/sitemap";

import vercel from "@astrojs/vercel";
import { openPolicy } from "@openpolicy/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";
import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
	site: "https://openpolicy.sh",
	adapter: vercel(),
	integrations: [icon(), sitemap()],

	experimental: {
		fonts: [
			{
				provider: fontProviders.fontsource(),
				name: "Geist Mono",
				cssVariable: "--font-geist-mono",
			},
		],
	},

	vite: {
		plugins: [
			tailwindcss(),
			openPolicy({
				configs: ["privacy.config.ts", "terms.config.ts"],
				formats: ["markdown"],
				outDir: "./src/policies",
			}),
		],
	},
});
