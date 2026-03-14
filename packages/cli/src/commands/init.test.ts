import { expect, test } from "bun:test";
import type { ArgsDef, CommandMeta } from "citty";
import { getOpenPolicyTemplate, initCommand } from "./init";

test("initCommand has correct name", () => {
	expect((initCommand.meta as CommandMeta)?.name).toBe("init");
});

test("initCommand has out arg", () => {
	expect((initCommand.args as ArgsDef)?.out?.type).toBe("string");
});

test("template includes defineConfig import", () => {
	const output = getOpenPolicyTemplate("Acme", "hi@acme.com", ["privacy"]);
	expect(output).toContain('import { defineConfig } from "@openpolicy/sdk"');
	expect(output).toContain("export default defineConfig(");
});

test("template includes company fields", () => {
	const output = getOpenPolicyTemplate("Acme Inc", "legal@acme.com", [
		"privacy",
	]);
	expect(output).toContain('name: "Acme Inc"');
	expect(output).toContain('contact: "legal@acme.com"');
});

test("template includes selected policy sections", () => {
	const output = getOpenPolicyTemplate("Acme", "hi@acme.com", [
		"privacy",
		"terms",
	]);
	expect(output).toContain("privacy:");
	expect(output).toContain("terms:");
	expect(output).not.toContain("cookie:");
});

test("template includes cookie section when selected", () => {
	const output = getOpenPolicyTemplate("Widgets Co", "hi@widgets.co", [
		"cookie",
	]);
	expect(output).toContain("cookie:");
	expect(output).not.toContain("privacy:");
	expect(output).not.toContain("terms:");
});

test("template includes all sections when all selected", () => {
	const output = getOpenPolicyTemplate("Acme", "hi@acme.com", [
		"privacy",
		"terms",
		"cookie",
	]);
	expect(output).toContain("privacy:");
	expect(output).toContain("terms:");
	expect(output).toContain("cookie:");
});
