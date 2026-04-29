import { expect, test } from "vite-plus/test";
import type { OpenPolicyConfig } from "./index";
import { defineConfig } from "./index";

const fixture: OpenPolicyConfig = {
	company: {
		name: "Acme Inc.",
		legalName: "Acme Corporation",
		address: "123 Main St, Springfield, USA",
		contact: { email: "privacy@acme.com" },
	},
	effectiveDate: "2026-01-01",
	jurisdictions: ["ca"],
	data: {
		collected: { "Account Information": ["Name", "Email"] },
		context: {
			"Account Information": {
				purpose: "To authenticate users",
				lawfulBasis: "contract",
				retention: "Until deletion",
				provision: {
					basis: "contract-prerequisite",
					consequences: "We cannot create or operate your account.",
				},
			},
		},
	},
	cookies: {
		used: { essential: true, analytics: false, marketing: false },
		context: {
			essential: { lawfulBasis: "legal_obligation" },
			analytics: { lawfulBasis: "consent" },
			marketing: { lawfulBasis: "consent" },
		},
	},
	thirdParties: [],
};

test("defineConfig returns config unchanged", () => {
	expect(defineConfig(fixture)).toBe(fixture);
});

test("defineConfig rejects data context missing entries for every collected category", () => {
	defineConfig({
		company: fixture.company,
		effectiveDate: "2026-01-01",
		jurisdictions: ["eu"],
		data: {
			collected: { "Account Information": ["Email"] },
			// @ts-expect-error — missing "Account Information" in context
			context: {},
		},
	});
	expect(true).toBe(true);
});

test("defineConfig rejects cookies.context without entry for every used cookie", () => {
	defineConfig({
		company: fixture.company,
		effectiveDate: "2026-01-01",
		jurisdictions: ["eu"],
		cookies: {
			used: { essential: true, analytics: true },
			// @ts-expect-error — missing "analytics" in context
			context: { essential: { lawfulBasis: "legal_obligation" } },
		},
	});
	expect(true).toBe(true);
});
