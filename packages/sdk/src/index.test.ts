import { expect, test } from "vite-plus/test";
import type { OpenPolicyConfig } from "./index";
import { defineConfig } from "./index";

const fixture: OpenPolicyConfig = {
	company: {
		name: "Acme Inc.",
		legalName: "Acme Corporation",
		address: "123 Main St, Springfield, USA",
		contact: "privacy@acme.com",
	},
	effectiveDate: "2026-01-01",
	jurisdictions: ["ca"],
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
	cookies: {
		used: { essential: true, analytics: false, marketing: false },
		lawfulBasis: { essential: "legal_obligation", analytics: "consent", marketing: "consent" },
	},
	thirdParties: [],
};

test("defineConfig returns config unchanged", () => {
	expect(defineConfig(fixture)).toBe(fixture);
});

test("defineConfig rejects data without lawfulBasis for every collected category", () => {
	defineConfig({
		company: fixture.company,
		effectiveDate: "2026-01-01",
		jurisdictions: ["eu"],
		data: {
			collected: { "Account Information": ["Email"] },
			purposes: { "Account Information": "Auth" },
			// @ts-expect-error — missing "Account Information" in lawfulBasis
			lawfulBasis: {},
			retention: { "Account Information": "Until deletion" },
			provisionRequirement: {
				"Account Information": {
					basis: "contract-prerequisite",
					consequences: "We cannot create or operate your account.",
				},
			},
		},
	});
	expect(true).toBe(true);
});

test("defineConfig rejects data without retention for every collected category", () => {
	defineConfig({
		company: fixture.company,
		effectiveDate: "2026-01-01",
		jurisdictions: ["eu"],
		data: {
			collected: { "Account Information": ["Email"] },
			purposes: { "Account Information": "Auth" },
			lawfulBasis: { "Account Information": "contract" },
			// @ts-expect-error — missing "Account Information" in retention
			retention: {},
			provisionRequirement: {
				"Account Information": {
					basis: "contract-prerequisite",
					consequences: "We cannot create or operate your account.",
				},
			},
		},
	});
	expect(true).toBe(true);
});

test("defineConfig rejects data without provisionRequirement for every collected category", () => {
	defineConfig({
		company: fixture.company,
		effectiveDate: "2026-01-01",
		jurisdictions: ["eu"],
		data: {
			collected: { "Account Information": ["Email"] },
			purposes: { "Account Information": "Auth" },
			lawfulBasis: { "Account Information": "contract" },
			retention: { "Account Information": "Until deletion" },
			// @ts-expect-error — missing "Account Information" in provisionRequirement
			provisionRequirement: {},
		},
	});
	expect(true).toBe(true);
});

test("defineConfig rejects cookies.lawfulBasis without entry for every used cookie", () => {
	defineConfig({
		company: fixture.company,
		effectiveDate: "2026-01-01",
		jurisdictions: ["eu"],
		cookies: {
			used: { essential: true, analytics: true },
			// @ts-expect-error — missing "analytics" in lawfulBasis
			lawfulBasis: { essential: "legal_obligation" },
		},
	});
	expect(true).toBe(true);
});
