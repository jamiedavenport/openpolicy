import { defineConfig } from "rolldown";
import { dts } from "rolldown-plugin-dts";

export default defineConfig([
	{
		input: "./src/index.ts",
		external: /^[^./]/,
		output: { format: "esm", dir: "dist" },
	},
	{
		input: "./src/index.ts",
		plugins: [dts()],
		external: (id) => id !== "@openpolicy/core" && /^[^./]/.test(id),
		output: { format: "esm", dir: "dist" },
	},
]);
