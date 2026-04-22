import { defineCommand } from "citty";
import pkgJson from "../package.json";

export const mainCommand = defineCommand({
	meta: {
		name: "openpolicy",
		version: pkgJson.version,
		description:
			"Install OpenPolicy and print a setup prompt for coding agents",
	},
	subCommands: {
		init: () => import("./commands/init").then((m) => m.initCommand),
	},
});

export async function run() {
	const { runMain } = await import("citty");
	await runMain(mainCommand);
}
