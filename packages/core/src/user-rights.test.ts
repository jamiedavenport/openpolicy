import { expect, test } from "vite-plus/test";
import { compile } from "./documents";
import type { OpenPolicyConfig, PolicyInput, UserRight } from "./types";
import { deriveUserRights } from "./user-rights";
import { validateOpenPolicyConfig } from "./validate-config";

const GDPR_RIGHTS: UserRight[] = [
	"access",
	"rectification",
	"erasure",
	"portability",
	"restriction",
	"objection",
];

test("deriveUserRights: EU-only returns the six GDPR rights in canonical order", () => {
	expect(deriveUserRights(["eu"])).toEqual(GDPR_RIGHTS);
});

test("deriveUserRights: UK-only returns the six GDPR rights (UK-GDPR parity)", () => {
	expect(deriveUserRights(["uk"])).toEqual(GDPR_RIGHTS);
});

test("deriveUserRights: US-CA-only returns the four CCPA rights in canonical order", () => {
	expect(deriveUserRights(["us-ca"])).toEqual([
		"access",
		"erasure",
		"opt_out_sale",
		"non_discrimination",
	]);
});

test("deriveUserRights: EU+US-CA returns the union in canonical order regardless of input order", () => {
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
	expect(deriveUserRights(["eu", "us-ca"])).toEqual(expected);
	expect(deriveUserRights(["us-ca", "eu"])).toEqual(expected);
});

test("deriveUserRights: EU dedupes with UK (both grant the same GDPR rights)", () => {
	expect(deriveUserRights(["eu", "uk"])).toEqual(GDPR_RIGHTS);
});

test("deriveUserRights: a reserved jurisdiction with no shipped content returns an empty array", () => {
	expect(deriveUserRights(["ca"])).toEqual([]);
	expect(deriveUserRights(["us-va"])).toEqual([]);
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
		data: {
			collected: { "Account Information": ["Name", "Email"] },
			purposes: { "Account Information": "To authenticate users" },
		},
		legalBasis: "legitimate_interests",
		retention: { "Account data": "Until deletion" },
		cookies: { essential: true, analytics: false, marketing: false },
		thirdParties: [],
		userRights: [],
		jurisdictions: ["ca"],
	};
	const document = compile(input);
	const hasRightsSection = document.sections.some((s) => s.id === "user-rights");
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
		jurisdictions: ["us-ca"],
		data: {
			collected: { "Account Information": ["Name", "Email"] },
			purposes: { "Account Information": "To authenticate users" },
		},
		legalBasis: "legitimate_interests",
		retention: { "Account data": "Until deletion" },
	};
	const issues = validateOpenPolicyConfig(config);
	expect(issues.some((i) => i.message.toLowerCase().includes("userrights"))).toBe(false);
});
