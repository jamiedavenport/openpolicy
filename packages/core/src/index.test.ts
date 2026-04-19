import { expect, test } from "bun:test";
import { expandOpenPolicyConfig, isOpenPolicyConfig } from "./index";
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
	legalBasis: "legitimate_interests",
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
		legalBasis: "legitimate_interests",
		retention: { "Account data": "Until deletion" },
		cookies: { essential: true, analytics: false, marketing: false },
		thirdParties: [],
		userRights: ["access"],
		jurisdictions: ["us"],
	},
	cookie: {
		effectiveDate: "2026-01-01",
		cookies: { essential: true },
		jurisdictions: ["us"],
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

test("isOpenPolicyConfig returns false for object without privacy/cookie keys", () => {
	expect(isOpenPolicyConfig({ company })).toBe(false);
});

test("expandOpenPolicyConfig returns both inputs when privacy and cookie present", () => {
	const inputs = expandOpenPolicyConfig(unifiedConfig);
	expect(inputs).toHaveLength(2);
	expect(inputs[0]?.type).toBe("privacy");
	expect(inputs[1]?.type).toBe("cookie");
});

test("expandOpenPolicyConfig merges company into each input", () => {
	const inputs = expandOpenPolicyConfig(unifiedConfig);
	expect(inputs[0]?.company).toEqual(company);
	expect(inputs[1]?.company).toEqual(company);
});

test("expandOpenPolicyConfig returns only privacy when cookie omitted", () => {
	const inputs = expandOpenPolicyConfig({
		company,
		privacy: unifiedConfig.privacy,
	});
	expect(inputs).toHaveLength(1);
	expect(inputs[0]?.type).toBe("privacy");
});

test("expandOpenPolicyConfig returns only cookie when privacy omitted", () => {
	const inputs = expandOpenPolicyConfig({
		company,
		cookie: unifiedConfig.cookie,
	});
	expect(inputs).toHaveLength(1);
	expect(inputs[0]?.type).toBe("cookie");
});

test("expandOpenPolicyConfig returns empty array when neither privacy nor cookie", () => {
	const inputs = expandOpenPolicyConfig({ company } as OpenPolicyConfig);
	expect(inputs).toHaveLength(0);
});
