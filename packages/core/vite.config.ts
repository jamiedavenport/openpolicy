import { defineConfig } from "vite-plus";

export default defineConfig({
	pack: {
		// Separate entries — NO barrel re-export between the compiler (`.`) and the
		// consent runtime (`./consent`). Importing one must tree-shake out the other.
		entry: [
			"./src/index.ts",
			"./src/consent/index.ts",
			"./src/consent/storage/local-storage.ts",
			"./src/consent/storage/cookie.ts",
			"./src/consent/storage/server.ts",
		],
		format: "esm",
		dts: true,
		fixedExtension: false,
	},
});
