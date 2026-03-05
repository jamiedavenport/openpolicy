import { expect, test } from "bun:test";
import type { ArgsDef, CommandMeta } from "citty";
import { generateCommand } from "./generate";

test("generateCommand has correct name", () => {
	expect((generateCommand.meta as CommandMeta)?.name).toBe("generate");
});

test("generateCommand has config positional arg", () => {
	expect((generateCommand.args as ArgsDef)?.config?.type).toBe("positional");
});

test("generateCommand has format arg", () => {
	expect((generateCommand.args as ArgsDef)?.format?.type).toBe("string");
});

test("generateCommand has out arg", () => {
	expect((generateCommand.args as ArgsDef)?.out?.type).toBe("string");
});
