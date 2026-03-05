import { expect, test } from "bun:test";
import type { CommandMeta, SubCommandsDef } from "citty";
import { mainCommand, run } from "./index";

test("run is a function", () => {
	expect(typeof run).toBe("function");
});

test("mainCommand has correct name", () => {
	expect((mainCommand.meta as CommandMeta)?.name).toBe("openpolicy");
});

test("mainCommand has init subcommand", () => {
	expect(typeof (mainCommand.subCommands as SubCommandsDef)?.init).toBe(
		"function",
	);
});

test("mainCommand has generate subcommand", () => {
	expect(typeof (mainCommand.subCommands as SubCommandsDef)?.generate).toBe(
		"function",
	);
});

test("mainCommand has validate subcommand", () => {
	expect(typeof (mainCommand.subCommands as SubCommandsDef)?.validate).toBe(
		"function",
	);
});
