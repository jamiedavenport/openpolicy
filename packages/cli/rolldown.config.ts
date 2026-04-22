import { defineConfig } from "rolldown";

export default defineConfig({
	input: "./src/cli.ts",
	platform: "node",
	external: (id) => id.startsWith("node:"),
	output: {
		format: "esm",
		file: "dist/cli.js",
		banner: "#!/usr/bin/env node",
		codeSplitting: false,
	},
});
