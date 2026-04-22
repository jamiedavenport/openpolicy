import { expect, test } from "bun:test";
import {
	expandOpenPolicyConfig,
	isOpenPolicyConfig,
	shouldEmit,
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
	legalBasis: "legitimate_interests",
	retention: { "Account data": "Until deletion" },
	cookies: { essential: true, analytics: false, marketing: false },
	thirdParties: [],
	userRights: ["access"],
	jurisdictions: ["ca"],
};

const company = {
	name: "Acme Inc.",
	legalName: "Acme Corporation",
	address: "123 Main St, Springfield, USA",
	contact: "privacy@acme.com",
};

const fullConfig: OpenPolicyConfig = {
	company,
	effectiveDate: "2026-01-01",
	jurisdictions: ["ca"],
	dataCollected: { "Account Information": ["Name", "Email"] },
	legalBasis: "legitimate_interests",
	retention: { "Account data": "Until deletion" },
	cookies: { essential: true, analytics: false, marketing: false },
	thirdParties: [],
};

test("isOpenPolicyConfig returns true for flat config", () => {
	expect(isOpenPolicyConfig(fullConfig)).toBe(true);
});

test("isOpenPolicyConfig returns false for PolicyInput (has type discriminator)", () => {
	expect(isOpenPolicyConfig(input)).toBe(false);
});

test("isOpenPolicyConfig returns false for null/non-object", () => {
	expect(isOpenPolicyConfig(null)).toBe(false);
	expect(isOpenPolicyConfig("string")).toBe(false);
	expect(isOpenPolicyConfig(42)).toBe(false);
});

test("isOpenPolicyConfig returns false for object without effectiveDate", () => {
	expect(isOpenPolicyConfig({ company })).toBe(false);
});

test("expandOpenPolicyConfig emits both inputs when all fields present", () => {
	const inputs = expandOpenPolicyConfig(fullConfig);
	expect(inputs).toHaveLength(2);
	expect(inputs[0]?.type).toBe("privacy");
	expect(inputs[1]?.type).toBe("cookie");
});

test("expandOpenPolicyConfig merges company and shared fields into each input", () => {
	const inputs = expandOpenPolicyConfig(fullConfig);
	expect(inputs[0]?.company).toEqual(company);
	expect(inputs[1]?.company).toEqual(company);
	expect(inputs[0]?.effectiveDate).toBe("2026-01-01");
	expect(inputs[1]?.effectiveDate).toBe("2026-01-01");
	expect(inputs[0]?.jurisdictions).toEqual(["ca"]);
	expect(inputs[1]?.jurisdictions).toEqual(["ca"]);
});

test("expandOpenPolicyConfig auto-detects privacy-only when cookies omitted", () => {
	const { cookies: _, ...privacyOnly } = fullConfig;
	const inputs = expandOpenPolicyConfig(privacyOnly);
	expect(inputs).toHaveLength(1);
	expect(inputs[0]?.type).toBe("privacy");
});

test("expandOpenPolicyConfig auto-detects cookie-only when no privacy fields", () => {
	const inputs = expandOpenPolicyConfig({
		company,
		effectiveDate: "2026-01-01",
		jurisdictions: ["ca"],
		cookies: { essential: true },
	});
	expect(inputs).toHaveLength(1);
	expect(inputs[0]?.type).toBe("cookie");
});

test("expandOpenPolicyConfig returns empty array when nothing to emit", () => {
	const inputs = expandOpenPolicyConfig({
		company,
		effectiveDate: "2026-01-01",
		jurisdictions: ["ca"],
	});
	expect(inputs).toHaveLength(0);
});

test("shouldEmit honours explicit policies override", () => {
	const config: OpenPolicyConfig = {
		...fullConfig,
		policies: ["privacy"],
	};
	expect(shouldEmit("privacy", config)).toBe(true);
	expect(shouldEmit("cookie", config)).toBe(false);
	const inputs = expandOpenPolicyConfig(config);
	expect(inputs).toHaveLength(1);
	expect(inputs[0]?.type).toBe("privacy");
});
