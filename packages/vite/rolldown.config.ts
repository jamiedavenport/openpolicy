import { defineConfig } from "rolldown";
import { dts } from "rolldown-plugin-dts";

export default defineConfig({
	input: "./src/index.ts",
	plugins: [dts()],
	platform: "node",
	external: (id) =>
		id !== "@openpolicy/core" &&
		id !== "@openpolicy/renderers" &&
		(/^node:/.test(id) || /^[^./]/.test(id)),
	output: { format: "esm", dir: "dist" },
});
