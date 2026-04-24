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
	},
	legalBasis: "legitimate_interests",
	retention: { "Account data": "Until deletion" },
	cookies: { essential: true, analytics: false, marketing: false },
	thirdParties: [],
};

test("defineConfig returns config unchanged", () => {
	expect(defineConfig(fixture)).toBe(fixture);
});
