import { expect, test } from "bun:test";
import type { OpenPolicyConfig, PrivacyPolicyConfig } from "./index";
import { defineConfig, definePrivacyPolicy } from "./index";

const fixture: PrivacyPolicyConfig = {
	effectiveDate: "2026-01-01",
	company: {
		name: "Acme Inc.",
		legalName: "Acme Corporation",
		address: "123 Main St, Springfield, USA",
		contact: "privacy@acme.com",
	},
	dataCollected: {
		"Account Information": ["Name", "Email address", "Password"],
		"Usage Data": ["IP address", "Browser type", "Pages visited"],
	},
	legalBasis: "Legitimate interests and consent",
	retention: {
		"Account data": "Until account deletion",
		"Usage logs": "90 days",
	},
	cookies: { essential: true, analytics: true, marketing: false },
	thirdParties: [{ name: "Stripe", purpose: "Payment processing" }],
	userRights: ["access", "erasure", "portability"],
	jurisdictions: ["us"],
	children: { underAge: 16, noticeUrl: "https://example.com/parental" },
};

test("definePrivacyPolicy returns config unchanged", () => {
	expect(definePrivacyPolicy(fixture)).toBe(fixture);
});

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
