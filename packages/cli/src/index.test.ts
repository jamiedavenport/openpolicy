import { expect, test } from "vite-plus/test";
import type { CommandMeta, SubCommandsDef } from "citty";
import { mainCommand, run } from "./index";

test("run is a function", () => {
	expect(typeof run).toBe("function");
});

test("mainCommand has correct name", () => {
	expect((mainCommand.meta as CommandMeta)?.name).toBe("openpolicy");
});

test("mainCommand has init subcommand", () => {
	expect(typeof (mainCommand.subCommands as SubCommandsDef)?.init).toBe("function");
});

test("mainCommand no longer exposes generate/validate", () => {
	const subs = mainCommand.subCommands as SubCommandsDef;
	expect(subs?.generate).toBeUndefined();
	expect(subs?.validate).toBeUndefined();
});
