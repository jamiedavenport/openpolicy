import { defineConfig } from "@openpolicy/sdk";

export default defineConfig({
	company: {
		name: "Your Company",
		legalName: "Your Company, Inc.",
		address: "123 Main St, City, State, ZIP",
		contact: "privacy@yourcompany.com",
	},
	privacy: {
		effectiveDate: "2026-03-09",
		dataCollected: {
			"Personal Information": ["Full name", "Email address"],
		},
		legalBasis: "legitimate_interests",
		retention: {
			"All personal data":
				"As long as necessary for the purposes described in this policy",
		},
		cookies: { essential: true, analytics: false, marketing: false },
		thirdParties: [],
		userRights: ["access", "erasure"],
		jurisdictions: ["us"],
	},
	cookie: {
		effectiveDate: "2026-03-09",
		cookies: {
			essential: true,
			analytics: true,
			functional: false,
			marketing: false,
		},
		thirdParties: [
			{
				name: "Google Analytics",
				purpose: "Website analytics and performance monitoring",
				policyUrl: "https://policies.google.com/privacy",
			},
		],
		trackingTechnologies: ["web beacons", "local storage"],
		consentMechanism: {
			hasBanner: true,
			hasPreferencePanel: true,
			canWithdraw: true,
		},
		jurisdictions: ["us"],
	},
});
