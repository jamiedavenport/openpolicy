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
		lawfulBasis: { "Account Information": "contract" },
		retention: { "Account Information": "Until deletion" },
		provisionRequirement: {
			"Account Information": {
				basis: "contract-prerequisite",
				consequences: "We cannot create or operate your account.",
			},
		},
	},
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

test("validateOpenPolicyConfig warns when EU/UK jurisdiction has no company.dpo", () => {
	const issues = validateOpenPolicyConfig(baseConfig);
	expect(
		issues.some((i) => i.level === "warning" && i.message.includes("company.dpo is not set")),
	).toBe(true);
});

test("validateOpenPolicyConfig does not warn about DPO when company.dpo is provided", () => {
	const issues = validateOpenPolicyConfig({
		...baseConfig,
		company: { ...baseConfig.company, dpo: { email: "dpo@acme.com" } },
	});
	expect(issues.some((i) => i.message.includes("company.dpo"))).toBe(false);
});

test("validateOpenPolicyConfig does not warn about DPO when dpo.required === false", () => {
	const issues = validateOpenPolicyConfig({
		...baseConfig,
		company: { ...baseConfig.company, dpo: { required: false } },
	});
	expect(issues.some((i) => i.message.includes("company.dpo"))).toBe(false);
});

test("validateOpenPolicyConfig does not warn about DPO for non-EU/UK jurisdictions", () => {
	const issues = validateOpenPolicyConfig({ ...baseConfig, jurisdictions: ["us-ca"] });
	expect(issues.some((i) => i.message.includes("company.dpo"))).toBe(false);
});

test("validateOpenPolicyConfig emits statutory-contractual-obligation when provisionRequirement is missing under GDPR", () => {
	const issues = validateOpenPolicyConfig({
		...baseConfig,
		data: {
			collected: { "Account Information": ["Name", "Email"] },
			purposes: { "Account Information": "To authenticate users" },
			lawfulBasis: { "Account Information": "contract" },
			retention: { "Account Information": "Until deletion" },
			provisionRequirement: {},
		},
	});
	const hit = issues.find(
		(i) => i.code === "statutory-contractual-obligation" && i.level === "error",
	);
	expect(hit).toBeDefined();
	expect(hit?.message).toContain('data.provisionRequirement["Account Information"]');
	expect(hit?.message).toContain("Art. 13(2)(e)");
});

test("validateOpenPolicyConfig emits statutory-contractual-obligation when consequences string is empty", () => {
	const issues = validateOpenPolicyConfig({
		...baseConfig,
		data: {
			collected: { "Account Information": ["Name", "Email"] },
			purposes: { "Account Information": "To authenticate users" },
			lawfulBasis: { "Account Information": "contract" },
			retention: { "Account Information": "Until deletion" },
			provisionRequirement: {
				"Account Information": { basis: "contractual", consequences: "   " },
			},
		},
	});
	expect(
		issues.some(
			(i) =>
				i.code === "statutory-contractual-obligation" &&
				i.message.includes("consequences is empty"),
		),
	).toBe(true);
});

test("validateOpenPolicyConfig does NOT emit statutory-contractual-obligation for non-GDPR jurisdictions", () => {
	const issues = validateOpenPolicyConfig({
		...baseConfig,
		jurisdictions: ["us-ca"],
		data: {
			collected: { "Account Information": ["Name", "Email"] },
			purposes: { "Account Information": "To authenticate users" },
			lawfulBasis: { "Account Information": "contract" },
			retention: { "Account Information": "Until deletion" },
			provisionRequirement: {},
		},
	});
	expect(issues.some((i) => i.code === "statutory-contractual-obligation")).toBe(false);
});
