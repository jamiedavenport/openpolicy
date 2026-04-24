import { expect, test } from "vite-plus/test";
import { isJurisdiction, JURISDICTIONS } from "./jurisdictions";
import type { OpenPolicyConfig } from "./types";
import { validateOpenPolicyConfig } from "./validate-config";

const baseConfig: OpenPolicyConfig = {
	company: {
		name: "Acme Inc.",
		legalName: "Acme Corporation",
		address: "123 Main St, Springfield, USA",
		contact: "privacy@acme.com",
	},
	effectiveDate: "2026-01-01",
	jurisdictions: ["eu"],
	data: {
		collected: { "Account Information": ["Name", "Email"] },
		purposes: { "Account Information": "To authenticate users" },
	},
	legalBasis: "legitimate_interests",
	retention: { "Account data": "Until deletion" },
};

test("isJurisdiction is true for every documented code", () => {
	for (const code of JURISDICTIONS) {
		expect(isJurisdiction(code)).toBe(true);
	}
});

test("isJurisdiction is false for retired codes and regulation names", () => {
	expect(isJurisdiction("us")).toBe(false);
	expect(isJurisdiction("nz")).toBe(false);
	expect(isJurisdiction("other")).toBe(false);
	expect(isJurisdiction("gdpr")).toBe(false);
	expect(isJurisdiction("ccpa")).toBe(false);
	expect(isJurisdiction("")).toBe(false);
});

test("validateOpenPolicyConfig rejects retired 'us' code with a helpful message", () => {
	const issues = validateOpenPolicyConfig({
		...baseConfig,
		jurisdictions: ["us" as never],
	});
	const bad = issues.find((i) => i.message.startsWith('Unknown jurisdiction "us"'));
	expect(bad).toBeDefined();
	expect(bad?.level).toBe("error");
	for (const code of JURISDICTIONS) {
		expect(bad?.message).toContain(code);
	}
});

test("validateOpenPolicyConfig rejects a typo'd code", () => {
	const issues = validateOpenPolicyConfig({
		...baseConfig,
		jurisdictions: ["uss-ca" as never],
	});
	expect(
		issues.some(
			(i) => i.level === "error" && i.message.startsWith('Unknown jurisdiction "uss-ca"'),
		),
	).toBe(true);
});

test("validateOpenPolicyConfig accepts every documented code", () => {
	for (const code of JURISDICTIONS) {
		const issues = validateOpenPolicyConfig({
			...baseConfig,
			jurisdictions: [code],
		});
		expect(issues.some((i) => i.message.startsWith("Unknown jurisdiction"))).toBe(false);
	}
});

test("validateOpenPolicyConfig still errors on empty jurisdictions array", () => {
	const issues = validateOpenPolicyConfig({ ...baseConfig, jurisdictions: [] });
	expect(
		issues.some(
			(i) => i.level === "error" && i.message === "jurisdictions must have at least one entry",
		),
	).toBe(true);
});
