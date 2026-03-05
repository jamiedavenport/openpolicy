import { defineConfig } from "rolldown";
import { dts } from "rolldown-plugin-dts";

export default defineConfig({
	input: "./src/index.ts",
	plugins: [dts()],
	external: /^[^./]/,
	output: { format: "esm", dir: "dist" },
});
