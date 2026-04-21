// @ts-check

import sitemap from "@astrojs/sitemap";

import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";
import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
	site: "https://openpolicy.sh",
	adapter: vercel(),
	markdown: {
		shikiConfig: { theme: "github-light" },
	},
	integrations: [icon(), sitemap()],

	experimental: {
		fonts: [
			{
				provider: fontProviders.fontsource(),
				name: "Geist",
				cssVariable: "--font-geist",
			},
			{
				provider: fontProviders.fontsource(),
				name: "Geist Mono",
				cssVariable: "--font-geist-mono",
			},
			{
				provider: fontProviders.fontsource(),
				name: "Instrument Serif",
				cssVariable: "--font-instrument-serif",
			},
		],
	},

	vite: {
		plugins: [tailwindcss()],
	},
});
