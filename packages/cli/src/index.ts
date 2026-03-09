import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { defineCommand } from "citty";

function getCliVersion(): string {
	try {
		const dir =
			typeof import.meta.dirname !== "undefined"
				? import.meta.dirname
				: dirname(fileURLToPath(import.meta.url));
		const pkgPath = join(dir, "..", "package.json");
		const pkg = JSON.parse(readFileSync(pkgPath, "utf-8")) as {
			version?: string;
		};
		return pkg.version ?? "0.0.0";
	} catch {
		return "0.0.0";
	}
}

export const mainCommand = defineCommand({
	meta: {
		name: "openpolicy",
		version: getCliVersion(),
		description: "Generate and validate privacy policy documents",
	},
	subCommands: {
		init: () => import("./commands/init").then((m) => m.initCommand),
		generate: () =>
			import("./commands/generate").then((m) => m.generateCommand),
		validate: () =>
			import("./commands/validate").then((m) => m.validateCommand),
	},
});

export async function run() {
	const { runMain } = await import("citty");
	await runMain(mainCommand);
}
