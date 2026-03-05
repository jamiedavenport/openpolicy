import { expect, test } from "bun:test";
import type { PrivacyPolicyConfig } from "./index";
import { definePrivacyPolicy } from "./index";

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
};

test("definePrivacyPolicy returns config unchanged", () => {
	expect(definePrivacyPolicy(fixture)).toBe(fixture);
});
