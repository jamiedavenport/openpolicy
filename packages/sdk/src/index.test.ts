import { expect, test } from "bun:test";
import type { OpenPolicyConfig } from "./index";
import { defineConfig } from "./index";

const unifiedFixture: OpenPolicyConfig = {
	company: {
		name: "Acme Inc.",
		legalName: "Acme Corporation",
		address: "123 Main St, Springfield, USA",
		contact: "privacy@acme.com",
	},
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

test("defineConfig returns config unchanged", () => {
	expect(defineConfig(unifiedFixture)).toBe(unifiedFixture);
});
