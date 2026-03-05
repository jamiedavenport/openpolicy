import { defineConfig } from "rolldown";
import { dts } from "rolldown-plugin-dts";

export default defineConfig({
	input: "./src/index.ts",
	plugins: [dts()],
	platform: "node",
	external: [/^node:/, /^[^./]/],
	output: { format: "esm", dir: "dist" },
});
