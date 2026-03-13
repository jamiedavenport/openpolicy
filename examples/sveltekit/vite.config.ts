import { openPolicy } from "@openpolicy/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [
		sveltekit(),
		openPolicy({
			formats: ["html"],
			outDir: "src/lib/policies",
		}),
	],
});
