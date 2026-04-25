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
	legalBasis: { "Providing the service": "legitimate_interests" },
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

test("validatePrivacyPolicy: emits lawful-basis-per-purpose when EU jurisdiction has empty legalBasis map", () => {
	const issues = validatePrivacyPolicy({
		...baseConfig,
		jurisdictions: ["eu"],
		legalBasis: {},
	});
	expect(issues.some((i) => i.code === "lawful-basis-per-purpose" && i.level === "error")).toBe(
		true,
	);
});

test("validatePrivacyPolicy: emits lawful-basis-per-purpose when UK jurisdiction has empty legalBasis map", () => {
	const issues = validatePrivacyPolicy({
		...baseConfig,
		jurisdictions: ["uk"],
		legalBasis: {},
	});
	expect(issues.some((i) => i.code === "lawful-basis-per-purpose" && i.level === "error")).toBe(
		true,
	);
});

test("validatePrivacyPolicy: emits lawful-basis-per-purpose when a purpose has empty basis", () => {
	const issues = validatePrivacyPolicy({
		...baseConfig,
		jurisdictions: ["eu"],
		legalBasis: { "Providing the service": "" as never },
	});
	const hit = issues.find(
		(i) => i.code === "lawful-basis-per-purpose" && i.message.includes("Providing the service"),
	);
	expect(hit).toBeDefined();
});

test("validatePrivacyPolicy: does NOT emit lawful-basis-per-purpose for non-GDPR jurisdictions", () => {
	const issues = validatePrivacyPolicy({
		...baseConfig,
		jurisdictions: ["us-ca"],
		legalBasis: {},
	});
	expect(issues.some((i) => i.code === "lawful-basis-per-purpose")).toBe(false);
});

test("validatePrivacyPolicy: well-formed per-purpose legalBasis under GDPR has no lawful-basis errors", () => {
	const issues = validatePrivacyPolicy({
		...baseConfig,
		jurisdictions: ["eu"],
		legalBasis: {
			"Providing the service": "contract",
			"Marketing communications": "consent",
		},
	});
	expect(issues.some((i) => i.code === "lawful-basis-per-purpose")).toBe(false);
});

test("validatePrivacyPolicy: warns automated-decision-making when EU jurisdiction omits the field", () => {
	const issues = validatePrivacyPolicy({
		...baseConfig,
		jurisdictions: ["eu"],
	});
	const hit = issues.find((i) => i.code === "automated-decision-making");
	expect(hit).toBeDefined();
	expect(hit?.level).toBe("warning");
});

test("validatePrivacyPolicy: warns automated-decision-making when UK jurisdiction omits the field", () => {
	const issues = validatePrivacyPolicy({
		...baseConfig,
		jurisdictions: ["uk"],
	});
	expect(issues.some((i) => i.code === "automated-decision-making" && i.level === "warning")).toBe(
		true,
	);
});

test("validatePrivacyPolicy: does NOT warn automated-decision-making when explicitly empty under EU", () => {
	const issues = validatePrivacyPolicy({
		...baseConfig,
		jurisdictions: ["eu"],
		automatedDecisionMaking: [],
	});
	expect(issues.some((i) => i.code === "automated-decision-making")).toBe(false);
});

test("validatePrivacyPolicy: does NOT warn automated-decision-making when populated under EU", () => {
	const issues = validatePrivacyPolicy({
		...baseConfig,
		jurisdictions: ["eu"],
		automatedDecisionMaking: [
			{ name: "Fraud scoring", logic: "Rules engine", significance: "May decline" },
		],
	});
	expect(issues.some((i) => i.code === "automated-decision-making")).toBe(false);
});

test("validatePrivacyPolicy: does NOT warn automated-decision-making for non-GDPR jurisdictions", () => {
	const issues = validatePrivacyPolicy({
		...baseConfig,
		jurisdictions: ["us-ca"],
	});
	expect(issues.some((i) => i.code === "automated-decision-making")).toBe(false);
});
