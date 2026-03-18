import { expect, test } from "bun:test";
import {
	compilePolicy,
	expandOpenPolicyConfig,
	isOpenPolicyConfig,
} from "./index";
import type { OpenPolicyConfig, PolicyInput } from "./types";

const input: PolicyInput = {
	type: "privacy",
	effectiveDate: "2026-01-01",
	company: {
		name: "Acme Inc.",
		legalName: "Acme Corporation",
		address: "123 Main St, Springfield, USA",
		contact: "privacy@acme.com",
	},
	dataCollected: { "Account Information": ["Name", "Email"] },
	legalBasis: "Legitimate interests",
	retention: { "Account data": "Until deletion" },
	cookies: { essential: true, analytics: false, marketing: false },
	thirdParties: [],
	userRights: ["access"],
	jurisdictions: ["us"],
};

const company = {
	name: "Acme Inc.",
	legalName: "Acme Corporation",
	address: "123 Main St, Springfield, USA",
	contact: "privacy@acme.com",
};

const unifiedConfig: OpenPolicyConfig = {
	company,
	privacy: {
		effectiveDate: "2026-01-01",
		dataCollected: { "Account Information": ["Name", "Email"] },
		legalBasis: "Legitimate interests",
		retention: { "Account data": "Until deletion" },
		cookies: { essential: true, analytics: false, marketing: false },
		thirdParties: [],
		userRights: ["access"],
		jurisdictions: ["us"],
	},
	terms: {
		effectiveDate: "2026-01-01",
		acceptance: { methods: ["using the service"] },
		governingLaw: { jurisdiction: "Delaware, USA" },
	},
};

test("isOpenPolicyConfig returns true for unified config", () => {
	expect(isOpenPolicyConfig(unifiedConfig)).toBe(true);
});

test("isOpenPolicyConfig returns false for privacy config (has effectiveDate)", () => {
	expect(isOpenPolicyConfig(input)).toBe(false);
});

test("isOpenPolicyConfig returns false for null/non-object", () => {
	expect(isOpenPolicyConfig(null)).toBe(false);
	expect(isOpenPolicyConfig("string")).toBe(false);
	expect(isOpenPolicyConfig(42)).toBe(false);
});

test("isOpenPolicyConfig returns false for object without privacy/terms keys", () => {
	expect(isOpenPolicyConfig({ company })).toBe(false);
});

test("expandOpenPolicyConfig returns both inputs when privacy and terms present", () => {
	const inputs = expandOpenPolicyConfig(unifiedConfig);
	expect(inputs).toHaveLength(2);
	expect(inputs[0]?.type).toBe("privacy");
	expect(inputs[1]?.type).toBe("terms");
});

test("expandOpenPolicyConfig merges company into each input", () => {
	const inputs = expandOpenPolicyConfig(unifiedConfig);
	expect(inputs[0]?.company).toEqual(company);
	expect(inputs[1]?.company).toEqual(company);
});

test("expandOpenPolicyConfig returns only privacy when terms omitted", () => {
	const inputs = expandOpenPolicyConfig({
		company,
		privacy: unifiedConfig.privacy,
	});
	expect(inputs).toHaveLength(1);
	expect(inputs[0]?.type).toBe("privacy");
});

test("expandOpenPolicyConfig returns only terms when privacy omitted", () => {
	const inputs = expandOpenPolicyConfig({
		company,
		terms: unifiedConfig.terms,
	});
	expect(inputs).toHaveLength(1);
	expect(inputs[0]?.type).toBe("terms");
});

test("expandOpenPolicyConfig returns empty array when neither privacy nor terms", () => {
	const inputs = expandOpenPolicyConfig({ company } as OpenPolicyConfig);
	expect(inputs).toHaveLength(0);
});

test("compilePolicy routes privacy input to markdown", async () => {
	const results = await compilePolicy(input);
	expect(results).toBeArray();
	expect(results[0]?.format).toBe("markdown");
	expect(results[0]?.content).toContain("Acme Inc.");
});
