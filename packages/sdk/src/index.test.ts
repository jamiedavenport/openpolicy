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

test("defineConfig returns config unchanged", () => {
	expect(defineConfig(unifiedFixture)).toBe(unifiedFixture);
});
