import { openPolicy } from "@openpolicy/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [
		sveltekit(),
		openPolicy({
			configPath: "./openpolicy.ts",
			formats: ["html"],
			outDir: "src/lib/policies",
		}),
	],
});
