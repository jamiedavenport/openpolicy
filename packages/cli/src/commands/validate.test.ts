import { expect, test } from "bun:test";
import type { ArgsDef, CommandMeta } from "citty";
import { validateCommand } from "./validate";

test("validateCommand has correct name", () => {
	expect((validateCommand.meta as CommandMeta)?.name).toBe("validate");
});

test("validateCommand has config positional arg", () => {
	expect((validateCommand.args as ArgsDef)?.config?.type).toBe("positional");
});

test("validateCommand has jurisdiction arg", () => {
	expect((validateCommand.args as ArgsDef)?.jurisdiction?.type).toBe("string");
});
