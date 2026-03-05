import { expect, test } from "bun:test";
import type { ArgsDef, CommandMeta } from "citty";
import { initCommand } from "./init";

test("initCommand has correct name", () => {
	expect((initCommand.meta as CommandMeta)?.name).toBe("init");
});

test("initCommand has out arg", () => {
	expect((initCommand.args as ArgsDef)?.out?.type).toBe("string");
});

test("initCommand has yes flag", () => {
	expect((initCommand.args as ArgsDef)?.yes?.type).toBe("boolean");
});
