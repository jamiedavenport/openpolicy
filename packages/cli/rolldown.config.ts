import { defineConfig } from "rolldown";

export default defineConfig({
	input: "./src/cli.ts",
	platform: "node",
	external: (id) => /^[^./]/.test(id),
	output: {
		format: "esm",
		file: "dist/cli.js",
		banner: "#!/usr/bin/env node",
		codeSplitting: false,
	},
});
