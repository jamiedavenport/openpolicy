import { defineConfig } from "vite-plus";

export default defineConfig({
	pack: {
		// Split entries — `./policy` and `./consent` never cross-import.
		entry: ["./src/policy.ts", "./src/consent.ts"],
		format: "esm",
		dts: true,
		fixedExtension: false,
	},
});
