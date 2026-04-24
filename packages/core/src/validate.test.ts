import { expect, test } from "vite-plus/test";
import type { PrivacyPolicyConfig } from "./types";
import { validatePrivacyPolicy } from "./validate";

const baseConfig: PrivacyPolicyConfig = {
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
	legalBasis: ["legitimate_interests"],
	retention: { "Account data": "Until deletion" },
	cookies: { essential: true },
	thirdParties: [],
	userRights: [],
	jurisdictions: ["ca"],
};

test("validatePrivacyPolicy: no issues for a well-formed config", () => {
	expect(validatePrivacyPolicy(baseConfig)).toEqual([]);
});

test("validatePrivacyPolicy: errors when data.collected is empty", () => {
	const issues = validatePrivacyPolicy({
		...baseConfig,
		data: { collected: {}, purposes: {} },
	});
	expect(issues.some((i) => i.message === "data.collected must have at least one entry")).toBe(
		true,
	);
});

test("validatePrivacyPolicy: errors when a collected category has no purpose", () => {
	const issues = validatePrivacyPolicy({
		...baseConfig,
		data: {
			collected: {
				"Account Information": ["Name"],
				"Session Data": ["IP"],
			},
			purposes: { "Account Information": "To authenticate users" },
		},
	});
	expect(
		issues.some(
			(i) => i.level === "error" && i.message.includes('data.purposes["Session Data"] is missing'),
		),
	).toBe(true);
});

test("validatePrivacyPolicy: errors when a purpose is an empty string", () => {
	const issues = validatePrivacyPolicy({
		...baseConfig,
		data: {
			collected: { "Account Information": ["Name"] },
			purposes: { "Account Information": "   " },
		},
	});
	expect(
		issues.some(
			(i) =>
				i.level === "error" &&
				i.message.includes('data.purposes["Account Information"] must be a non-empty string'),
		),
	).toBe(true);
});

test("validatePrivacyPolicy: errors when a purpose key has no matching collected category", () => {
	const issues = validatePrivacyPolicy({
		...baseConfig,
		data: {
			collected: { "Account Information": ["Name"] },
			purposes: {
				"Account Information": "To authenticate users",
				"Orphan Category": "Not attached to anything",
			},
		},
	});
	expect(
		issues.some(
			(i) =>
				i.level === "error" &&
				i.message.includes('data.purposes["Orphan Category"] has no matching entry'),
		),
	).toBe(true);
});
