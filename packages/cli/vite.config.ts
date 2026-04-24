import { defineConfig } from "vite-plus";

export default defineConfig({
	pack: {
		entry: "./src/cli.ts",
		format: "esm",
		platform: "node",
		fixedExtension: false,
		// citty + consola are devDependencies and get bundled; Node built-ins stay external by default.
		banner: { js: "#!/usr/bin/env node" },
	},
});
