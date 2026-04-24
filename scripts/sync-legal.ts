import { cp } from "node:fs/promises";
import { join } from "node:path";

const packages = ["core", "sdk", "cli", "vite", "react", "vue"];
const files = ["LICENSE.md", "NOTICE.md"];

for (const pkg of packages) {
	for (const file of files) {
		await cp(file, join("packages", pkg, file));
	}
}
