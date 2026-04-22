import { defineConfig } from "rolldown";
import { dts } from "rolldown-plugin-dts";

// Two entry points on purpose: `./auto-collected` is kept as a separate
// chunk so the `dist/index.js` bundle references it via a relative
// `./auto-collected.js` import instead of inlining its contents. That
// relative import is what `@openpolicy/vite`'s `resolveId` hook
// intercepts to inline scanned categories at consumer build time.
const input = {
	index: "./src/index.ts",
	"auto-collected": "./src/auto-collected.ts",
};

const external = (id: string): boolean =>
	id !== "@openpolicy/core" && /^[^./]/.test(id);

export default defineConfig([
	{
		input,
		external,
		output: { format: "esm", dir: "dist" },
	},
	{
		input,
		plugins: [dts()],
		external,
		output: { format: "esm", dir: "dist" },
	},
]);
