import pkgJson from '../package.json'
import { defineCommand } from "citty";


export const mainCommand = defineCommand({
	meta: {
		name: "openpolicy",
		version: pkgJson.version,
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
