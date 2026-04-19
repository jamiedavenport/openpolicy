import { expect, test } from "bun:test";
import { compile } from "./documents";
import type { OpenPolicyConfig, PolicyInput, UserRight } from "./types";
import { deriveUserRights } from "./user-rights";
import { validateOpenPolicyConfig } from "./validate-config";

test("deriveUserRights: EU-only returns the six GDPR rights in canonical order", () => {
	expect(deriveUserRights(["eu"])).toEqual([
		"access",
		"rectification",
		"erasure",
		"portability",
		"restriction",
		"objection",
	]);
});

test("deriveUserRights: CA-only returns the four CCPA rights in canonical order", () => {
	expect(deriveUserRights(["ca"])).toEqual([
		"access",
		"erasure",
		"opt_out_sale",
		"non_discrimination",
	]);
});

test("deriveUserRights: EU+CA returns the union in canonical order regardless of input order", () => {
	const expected: UserRight[] = [
		"access",
		"rectification",
		"erasure",
		"portability",
		"restriction",
		"objection",
		"opt_out_sale",
		"non_discrimination",
	];
	expect(deriveUserRights(["eu", "ca"])).toEqual(expected);
	expect(deriveUserRights(["ca", "eu"])).toEqual(expected);
});

test("deriveUserRights: US-only returns an empty array", () => {
	expect(deriveUserRights(["us"])).toEqual([]);
});

test("buildUserRights: privacy policy omits 'Your Rights' section when derivation is empty", () => {
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
		userRights: [],
		jurisdictions: ["us"],
	};
	const document = compile(input);
	const hasRightsSection = document.sections.some(
		(s) => s.id === "user-rights",
	);
	expect(hasRightsSection).toBe(false);
});

test("validateOpenPolicyConfig: emits no userRights-related issues", () => {
	const config: OpenPolicyConfig = {
		company: {
			name: "Acme Inc.",
			legalName: "Acme Corporation",
			address: "123 Main St, Springfield, USA",
			contact: "privacy@acme.com",
		},
		effectiveDate: "2026-01-01",
		jurisdictions: ["us"],
		dataCollected: { "Account Information": ["Name", "Email"] },
		legalBasis: "legitimate_interests",
		retention: { "Account data": "Until deletion" },
	};
	const issues = validateOpenPolicyConfig(config);
	expect(
		issues.some((i) => i.message.toLowerCase().includes("userrights")),
	).toBe(false);
});
