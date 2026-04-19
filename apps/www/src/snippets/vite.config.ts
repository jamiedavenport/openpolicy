import { autoCollect } from "@openpolicy/vite-auto-collect";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [autoCollect()],
});
