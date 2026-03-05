import { openPolicy } from "@openpolicy/vite";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [
		openPolicy({
			formats: ["markdown", "html"],
		}),
	],
});
