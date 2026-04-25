import { defineConfig, LegalBases } from "@openpolicy/sdk";

export default defineConfig({
	company: {
		name: "Your Company",
		legalName: "Your Company, Inc.",
		address: "123 Main St, City, State, ZIP",
		contact: "privacy@yourcompany.com",
	},
	effectiveDate: "2026-03-09",
	jurisdictions: ["us-ca"],
	data: {
		collected: {
			"Personal Information": ["Full name", "Email address"],
		},
		purposes: {
			"Personal Information": "To create and manage user accounts and provide customer support",
		},
		lawfulBasis: {
			"Personal Information": LegalBases.Contract,
		},
		retention: {
			"Personal Information": "As long as necessary for the purposes described in this policy",
		},
	},
	cookies: {
		used: {
			essential: true,
			analytics: true,
			functional: false,
			marketing: false,
		},
		lawfulBasis: {
			essential: LegalBases.LegalObligation,
			analytics: LegalBases.Consent,
			functional: LegalBases.Consent,
			marketing: LegalBases.Consent,
		},
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
});
