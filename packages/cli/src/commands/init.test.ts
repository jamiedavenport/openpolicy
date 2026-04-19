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

test("template includes privacy fields when privacy selected", () => {
	const output = getOpenPolicyTemplate("Acme", "hi@acme.com", ["privacy"]);
	expect(output).toContain("dataCollected:");
	expect(output).toContain("legalBasis:");
	expect(output).not.toContain("cookies:");
	expect(output).not.toContain("userRights:");
});

test("template includes cookies field when cookie selected", () => {
	const output = getOpenPolicyTemplate("Widgets Co", "hi@widgets.co", [
		"cookie",
	]);
	expect(output).toContain("cookies:");
	expect(output).not.toContain("dataCollected:");
});

test("template includes all fields when both selected", () => {
	const output = getOpenPolicyTemplate("Acme", "hi@acme.com", [
		"privacy",
		"cookie",
	]);
	expect(output).toContain("dataCollected:");
	expect(output).toContain("cookies:");
});

test("template always has top-level effectiveDate and jurisdictions", () => {
	const output = getOpenPolicyTemplate("Acme", "hi@acme.com", ["privacy"]);
	expect(output).toContain("effectiveDate:");
	expect(output).toContain("jurisdictions:");
});
