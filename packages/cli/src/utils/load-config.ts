import { existsSync } from "node:fs";
import { resolve } from "node:path";
import consola from "consola";

export async function loadConfig(configPath: string): Promise<unknown> {
	const absPath = resolve(configPath);

	if (!existsSync(absPath)) {
		consola.error(`Config file not found: ${absPath}`);
		process.exit(1);
	}

	let mod: unknown;
	try {
		mod = await import(absPath);
	} catch (err) {
		consola.error(`Failed to load config: ${absPath}`);
		consola.error(err);
		process.exit(1);
	}

	const config =
		(mod as Record<string, unknown>)["default"] ??
		(mod as Record<string, unknown>)["module.exports"] ??
		mod;

	if (config === null || config === undefined || typeof config !== "object") {
		consola.error(`Config must export a non-null object: ${absPath}`);
		process.exit(1);
	}

	return config;
}
