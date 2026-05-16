import { defineConfig } from "vite-plus";

export default defineConfig({
	pack: {
		// Split entries — `./policy` (renderers) and `./consent` (banner adapter)
		// never cross-import, so each tree-shakes the other out.
		entry: ["./src/policy.ts", "./src/consent.tsx"],
		format: "esm",
		dts: true,
		fixedExtension: false,
	},
});
